const webpush = require('web-push');
const { Seller } = require('../models');

class WebPushService {
  constructor() {
    this.isConfigured = false;
    this.initialize();
  }

  initialize() {
    try {
      // Vérifier si les clés VAPID sont configurées
      const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
      const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
      const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:contact@livelink.store';

      if (vapidPublicKey && vapidPrivateKey) {
        webpush.setVapidDetails(
          vapidSubject,
          vapidPublicKey,
          vapidPrivateKey
        );
        this.isConfigured = true;
        console.log('✅ Web Push configuré avec clés VAPID');
      } else {
        console.warn('⚠️  Web Push non configuré - Clés VAPID manquantes');
        console.warn('⚠️  Générez des clés avec: npx web-push generate-vapid-keys');
      }
    } catch (error) {
      console.error('❌ Erreur initialisation Web Push:', error);
      this.isConfigured = false;
    }
  }

  // Enregistrer une souscription push pour un vendeur (en mémoire pour l'instant)
  async saveSubscription(sellerId, subscription) {
    try {
      if (!this.isConfigured) {
        throw new Error('Web Push non configuré');
      }

      // Pour l'instant, on stocke en mémoire (à remplacer par DB plus tard)
      if (!this.subscriptions) {
        this.subscriptions = new Map();
      }
      
      this.subscriptions.set(sellerId, subscription);
      console.log(`✅ Souscription push enregistrée en mémoire pour vendeur ${sellerId}`);
      return true;
    } catch (error) {
      console.error('❌ Erreur sauvegarde souscription:', error);
      throw error;
    }
  }

  // Supprimer la souscription d'un vendeur
  async removeSubscription(sellerId) {
    try {
      if (this.subscriptions) {
        this.subscriptions.delete(sellerId);
      }
      console.log(`✅ Souscription push supprimée de la mémoire pour vendeur ${sellerId}`);
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression souscription:', error);
      throw error;
    }
  }

  // Envoyer une notification push à un vendeur
  async sendPushNotification(sellerId, notification) {
    try {
      if (!this.isConfigured) {
        console.warn('⚠️  Web Push non configuré, notification non envoyée');
        return false;
      }

      // Récupérer la souscription du vendeur (en mémoire)
      if (!this.subscriptions || !this.subscriptions.has(sellerId)) {
        console.log(`ℹ️  Vendeur ${sellerId} n'a pas de souscription push active`);
        return false;
      }

      const subscription = this.subscriptions.get(sellerId);
      
      // Préparer le payload
      const payload = JSON.stringify({
        title: notification.title || 'Nouvelle notification',
        body: notification.message || '',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: `notification-${notification.id}`,
        data: {
          notificationId: notification.id,
          type: notification.type,
          url: this.getNotificationUrl(notification),
          ...notification.data
        },
        actions: this.getNotificationActions(notification.type),
        requireInteraction: notification.type === 'new_order' // Nécessite interaction pour nouvelles commandes
      });

      // Envoyer la notification
      await webpush.sendNotification(subscription, payload);
      
      console.log(`✅ Push notification envoyée au vendeur ${sellerId}`);
      return true;

    } catch (error) {
      // Si la souscription est invalide (410 Gone), la supprimer
      if (error.statusCode === 410) {
        console.warn(`⚠️  Souscription expirée pour vendeur ${sellerId}, suppression...`);
        await this.removeSubscription(sellerId);
      } else {
        console.error(`❌ Erreur envoi push notification au vendeur ${sellerId}:`, error);
      }
      return false;
    }
  }

  // Obtenir l'URL de redirection selon le type de notification
  getNotificationUrl(notification) {
    const baseUrl = process.env.VENDOR_URL || 'https://space.livelink.store';
    
    switch (notification.type) {
      case 'new_order':
        return `${baseUrl}/orders/${notification.data?.order?.id || ''}`;
      case 'order_status_update':
        return `${baseUrl}/orders/${notification.data?.order?.id || ''}`;
      case 'new_comment':
        return `${baseUrl}/products`;
      case 'credits_updated':
        return `${baseUrl}/credits`;
      default:
        return baseUrl;
    }
  }

  // Obtenir les actions selon le type de notification
  getNotificationActions(type) {
    switch (type) {
      case 'new_order':
        return [
          { action: 'view', title: 'Voir la commande', icon: '/icons/view.png' },
          { action: 'close', title: 'Fermer', icon: '/icons/close.png' }
        ];
      case 'order_status_update':
        return [
          { action: 'view', title: 'Voir', icon: '/icons/view.png' }
        ];
      default:
        return [];
    }
  }

  // Envoyer à plusieurs vendeurs
  async sendBulkPushNotifications(sellerIds, notification) {
    const results = await Promise.allSettled(
      sellerIds.map(sellerId => this.sendPushNotification(sellerId, notification))
    );

    const successful = results.filter(r => r.status === 'fulfilled' && r.value).length;
    const failed = results.length - successful;

    console.log(`📊 Push bulk: ${successful} envoyées, ${failed} échouées`);
    
    return { successful, failed, total: results.length };
  }

  // Tester l'envoi d'une notification push
  async sendTestPush(sellerId) {
    const testNotification = {
      id: 999999,
      type: 'test',
      title: '🧪 Notification de test',
      message: 'Ceci est une notification push de test. Votre système fonctionne correctement !',
      data: {}
    };

    return await this.sendPushNotification(sellerId, testNotification);
  }

  // Obtenir les statistiques
  async getStats() {
    try {
      const totalSubscriptions = this.subscriptions ? this.subscriptions.size : 0;

      return {
        isConfigured: this.isConfigured,
        totalSubscriptions,
        vapidPublicKey: process.env.VAPID_PUBLIC_KEY ? '✅ Configurée' : '❌ Manquante'
      };
    } catch (error) {
      console.error('❌ Erreur récupération stats Web Push:', error);
      return null;
    }
  }

  // Obtenir la clé publique VAPID (pour le client)
  getPublicKey() {
    return process.env.VAPID_PUBLIC_KEY || null;
  }
}

// Instance singleton
const webPushService = new WebPushService();

module.exports = webPushService;
