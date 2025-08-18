const { Notification } = require('../models');
const { sequelize } = require('../config/database');

class NotificationService {
  constructor() {
    this.retryQueue = new Map();
    this.maxRetries = 3;
    this.retryDelay = 5000; // 5 secondes
  }

  // Créer une notification persistante
  async createNotification(sellerId, type, title, message, data = null) {
    try {
      const notification = await Notification.create({
        seller_id: sellerId,
        type,
        title,
        message,
        data,
        read: false,
        sent: false,
        retry_count: 0,
        max_retries: 3
      });

      console.log(`📝 Notification créée: ${type} pour vendeur ${sellerId}`);
      return notification;
    } catch (error) {
      console.error('❌ Erreur création notification:', error);
      throw error;
    }
  }

  // Envoyer une notification en temps réel
  async sendRealtimeNotification(sellerId, type, data) {
    try {
      // Créer la notification persistante
      const notification = await this.createNotification(
        sellerId,
        type,
        this.getTitle(type, data),
        this.getMessage(type, data),
        data
      );

      // Tenter l'envoi en temps réel
      const sent = await this.attemptRealtimeSend(sellerId, type, data);
      
      if (sent) {
        // Marquer comme envoyée
        await notification.update({
          sent: true,
          sent_at: new Date()
        });
        console.log(`✅ Notification envoyée en temps réel: ${type}`);
      } else {
        // Ajouter à la queue de retry
        this.addToRetryQueue(notification);
        console.log(`⏳ Notification ajoutée à la queue de retry: ${type}`);
      }

      return { notification, sent };
    } catch (error) {
      console.error('❌ Erreur envoi notification:', error);
      throw error;
    }
  }

  // Tenter l'envoi en temps réel
  async attemptRealtimeSend(sellerId, type, data) {
    try {
      if (global.notifySeller) {
        global.notifySeller(sellerId, type, data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erreur envoi temps réel:', error);
      return false;
    }
  }

  // Ajouter à la queue de retry
  addToRetryQueue(notification) {
    const key = `${notification.id}`;
    this.retryQueue.set(key, {
      notification,
      retryCount: 0,
      nextRetry: Date.now() + this.retryDelay
    });
  }

  // Traiter la queue de retry
  async processRetryQueue() {
    const now = Date.now();
    
    for (const [key, item] of this.retryQueue.entries()) {
      if (now >= item.nextRetry) {
        try {
          const sent = await this.attemptRealtimeSend(
            item.notification.seller_id,
            item.notification.type,
            item.notification.data
          );

          if (sent) {
            // Succès
            await item.notification.update({
              sent: true,
              sent_at: new Date()
            });
            this.retryQueue.delete(key);
            console.log(`✅ Notification retry réussie: ${item.notification.id}`);
          } else {
            // Échec, incrémenter le compteur
            item.retryCount++;
            if (item.retryCount >= this.maxRetries) {
              // Maximum de tentatives atteint
              await item.notification.update({
                retry_count: item.retryCount
              });
              this.retryQueue.delete(key);
              console.log(`❌ Notification abandonnée après ${this.maxRetries} tentatives: ${item.notification.id}`);
            } else {
              // Programmer la prochaine tentative
              item.nextRetry = now + (this.retryDelay * Math.pow(2, item.retryCount));
              await item.notification.update({
                retry_count: item.retryCount
              });
            }
          }
        } catch (error) {
          console.error('❌ Erreur retry notification:', error);
        }
      }
    }
  }

  // Récupérer les notifications non lues d'un vendeur
  async getUnreadNotifications(sellerId, limit = 50) {
    try {
      const notifications = await Notification.findAll({
        where: {
          seller_id: sellerId,
          read: false
        },
        order: [['created_at', 'DESC']],
        limit
      });

      return notifications;
    } catch (error) {
      console.error('❌ Erreur récupération notifications:', error);
      throw error;
    }
  }

  // Marquer une notification comme lue
  async markAsRead(notificationId, sellerId) {
    try {
      const notification = await Notification.findOne({
        where: {
          id: notificationId,
          seller_id: sellerId
        }
      });

      if (notification) {
        await notification.update({ read: true });
        console.log(`✅ Notification marquée comme lue: ${notificationId}`);
      }

      return notification;
    } catch (error) {
      console.error('❌ Erreur marquage notification:', error);
      throw error;
    }
  }

  // Marquer toutes les notifications comme lues
  async markAllAsRead(sellerId) {
    try {
      await Notification.update(
        { read: true },
        {
          where: {
            seller_id: sellerId,
            read: false
          }
        }
      );

      console.log(`✅ Toutes les notifications marquées comme lues pour vendeur ${sellerId}`);
    } catch (error) {
      console.error('❌ Erreur marquage notifications:', error);
      throw error;
    }
  }

  // Statistiques des notifications
  async getNotificationStats(sellerId) {
    try {
      const stats = await Notification.findAll({
        where: { seller_id: sellerId },
        attributes: [
          'type',
          'read',
          'sent',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['type', 'read', 'sent']
      });

      return stats;
    } catch (error) {
      console.error('❌ Erreur statistiques notifications:', error);
      throw error;
    }
  }

  // Nettoyer les anciennes notifications
  async cleanupOldNotifications(daysToKeep = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const deletedCount = await Notification.destroy({
        where: {
          created_at: {
            [sequelize.Op.lt]: cutoffDate
          },
          read: true
        }
      });

      console.log(`🗑️ ${deletedCount} anciennes notifications supprimées`);
      return deletedCount;
    } catch (error) {
      console.error('❌ Erreur nettoyage notifications:', error);
      throw error;
    }
  }

  // Utilitaires pour les titres et messages
  getTitle(type, data) {
    switch (type) {
      case 'new_order':
        return `Nouvelle commande #${data.order?.id}`;
      case 'order_status_update':
        return `Commande #${data.order?.id} mise à jour`;
      case 'new_comment':
        return 'Nouveau commentaire';
      default:
        return 'Notification';
    }
  }

  getMessage(type, data) {
    switch (type) {
      case 'new_order':
        return `Nouvelle commande de ${data.order?.customer_name} - ${data.order?.total_price?.toLocaleString()} FCFA`;
      case 'order_status_update':
        return `Commande #${data.order?.id} : ${data.order?.status}`;
      case 'new_comment':
        return data.comment || 'Nouveau commentaire reçu';
      default:
        return data.message || 'Notification système';
    }
  }

  // Démarrer le traitement de la queue
  startRetryProcessor() {
    this.retryInterval = setInterval(() => {
      this.processRetryQueue();
    }, 10000); // Toutes les 10 secondes

    console.log('🔄 Processeur de retry démarré');
  }

  // Arrêter le traitement de la queue
  stopRetryProcessor() {
    if (this.retryInterval) {
      clearInterval(this.retryInterval);
      this.retryInterval = null;
    }
  }
}

// Instance singleton
const notificationService = new NotificationService();

module.exports = notificationService; 