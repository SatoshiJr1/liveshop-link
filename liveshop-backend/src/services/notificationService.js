const { Notification } = require('../models');
const { sequelize } = require('../config/database');

class NotificationService {
  constructor() {
    this.retryQueue = new Map();
    this.maxRetries = 3;
    this.retryDelay = 5000; // 5 secondes
    this.isProcessing = false;
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

      console.log(`📝 Notification créée: ${type} pour vendeur ${sellerId} (ID: ${notification.id})`);
      return notification;
    } catch (error) {
      console.error('❌ Erreur création notification:', error);
      throw error;
    }
  }

  // Envoyer une notification en temps réel
  async sendRealtimeNotification(sellerId, type, data) {
    try {
      console.log(`🔔 Tentative d'envoi notification: ${type} pour vendeur ${sellerId}`);
      
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
        console.log(`✅ Notification envoyée en temps réel: ${type} (ID: ${notification.id})`);
      } else {
        // Ajouter à la queue de retry
        this.addToRetryQueue(notification);
        console.log(`⏳ Notification ajoutée à la queue de retry: ${type} (ID: ${notification.id})`);
      }

      // Envoyer des événements de mise à jour spécifiques
      await this.sendUpdateEvents(sellerId, type, data);

      return { notification, sent };
    } catch (error) {
      console.error('❌ Erreur envoi notification:', error);
      throw error;
    }
  }

  // Envoyer des événements de mise à jour spécifiques
  async sendUpdateEvents(sellerId, type, data) {
    try {
      if (global.notifySeller) {
        // Événements spécifiques selon le type
        switch (type) {
          case 'new_order':
            global.notifySeller(sellerId, 'order_updated', {
              orderId: data.order?.id,
              action: 'created',
              timestamp: new Date()
            });
            break;
          case 'order_status_update':
            global.notifySeller(sellerId, 'order_updated', {
              orderId: data.order?.id,
              action: 'status_changed',
              newStatus: data.order?.status,
              timestamp: new Date()
            });
            break;
          case 'product_updated':
            global.notifySeller(sellerId, 'product_updated', {
              productId: data.product?.id,
              action: 'updated',
              timestamp: new Date()
            });
            break;
          case 'credits_updated':
            global.notifySeller(sellerId, 'credits_updated', {
              newCredits: data.newCredits,
              change: data.change,
              timestamp: new Date()
            });
            break;
        }

        // Événement de mise à jour des statistiques
        global.notifySeller(sellerId, 'stats_updated', {
          timestamp: new Date()
        });

        console.log(`📡 Événements de mise à jour envoyés pour vendeur ${sellerId}`);
      }
    } catch (error) {
      console.error('❌ Erreur envoi événements de mise à jour:', error);
    }
  }

  // Tenter l'envoi en temps réel
  async attemptRealtimeSend(sellerId, type, data) {
    try {
      console.log(`🔍 Vérification global.notifySeller pour vendeur ${sellerId}...`);
      
      if (global.notifySeller) {
        console.log(`📡 Envoi via WebSocket pour vendeur ${sellerId}...`);
        global.notifySeller(sellerId, type, data);
        console.log(`✅ Notification WebSocket envoyée pour vendeur ${sellerId}`);
        return true;
      } else {
        console.log(`❌ global.notifySeller non disponible pour vendeur ${sellerId}`);
        return false;
      }
    } catch (error) {
      console.error(`❌ Erreur envoi temps réel pour vendeur ${sellerId}:`, error);
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
    console.log(`📋 Notification ${notification.id} ajoutée à la queue de retry`);
  }

  // Traiter la queue de retry
  async processRetryQueue() {
    if (this.isProcessing) {
      console.log('⏳ Traitement de queue déjà en cours...');
      return;
    }

    this.isProcessing = true;
    const now = Date.now();
    
    try {
      for (const [key, item] of this.retryQueue.entries()) {
        if (now >= item.nextRetry) {
          try {
            console.log(`🔄 Tentative de retry pour notification ${item.notification.id} (${item.retryCount + 1}/${this.maxRetries})`);
            
            const sent = await this.attemptRealtimeSend(
              item.notification.seller_id,
              item.notification.type,
              item.notification.data
            );
            
            if (sent) {
              // Succès - marquer comme envoyée et retirer de la queue
              await item.notification.update({
                sent: true,
                sent_at: new Date()
              });
              this.retryQueue.delete(key);
              console.log(`✅ Retry réussi pour notification ${item.notification.id}`);
            } else {
              // Échec - incrémenter le compteur de retry
              item.retryCount++;
              if (item.retryCount >= this.maxRetries) {
                // Nombre maximum de tentatives atteint
                await item.notification.update({
                  sent: false,
                  retry_count: item.retryCount
                });
                this.retryQueue.delete(key);
                console.log(`❌ Nombre maximum de retry atteint pour notification ${item.notification.id}`);
              } else {
                // Programmer le prochain retry
                item.nextRetry = now + (this.retryDelay * Math.pow(2, item.retryCount));
                console.log(`⏳ Prochain retry pour notification ${item.notification.id} dans ${this.retryDelay * Math.pow(2, item.retryCount)}ms`);
              }
            }
          } catch (error) {
            console.error(`❌ Erreur lors du retry pour notification ${item.notification.id}:`, error);
            item.retryCount++;
            if (item.retryCount >= this.maxRetries) {
              this.retryQueue.delete(key);
            }
          }
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  // Marquer les notifications comme lues
  async markNotificationsAsRead(sellerId, notificationIds = null) {
    try {
      const whereClause = { seller_id: sellerId };
      if (notificationIds) {
        whereClause.id = { [sequelize.Op.in]: notificationIds };
      }

      await Notification.update(
        { read: true, read_at: new Date() },
        { where: whereClause }
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

    console.log('🔄 Processeur de retry démarré (intervalle: 10s)');
  }

  // Arrêter le traitement de la queue
  stopRetryProcessor() {
    if (this.retryInterval) {
      clearInterval(this.retryInterval);
      this.retryInterval = null;
    }
    console.log('🛑 Processeur de retry arrêté');
  }

  // Obtenir le statut du service
  getStatus() {
    return {
      isProcessing: this.isProcessing,
      queueSize: this.retryQueue.size,
      retryInterval: !!this.retryInterval
    };
  }
}

// Instance singleton
const notificationService = new NotificationService();

module.exports = notificationService; 