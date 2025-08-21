const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const notificationService = require('../services/notificationService');

// Récupérer les notifications d'un vendeur
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const { Notification } = require('../models');
    
    const notifications = await Notification.findAll({
      where: { seller_id: req.seller.id },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      notifications,
      count: notifications.length
    });
  } catch (error) {
    console.error('❌ Erreur récupération notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des notifications'
    });
  }
});

// Marquer une notification comme lue
router.patch('/:notificationId/read', authenticateToken, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { Notification } = require('../models');
    
    const notification = await Notification.findOne({
      where: {
        id: parseInt(notificationId),
        seller_id: req.seller.id
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification non trouvée'
      });
    }

    await notification.update({ read: true, read_at: new Date() });

    res.json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('❌ Erreur marquage notification:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors du marquage de la notification'
    });
  }
});

// Marquer toutes les notifications comme lues
router.patch('/read-all', authenticateToken, async (req, res) => {
  try {
    await notificationService.markNotificationsAsRead(req.seller.id);

    res.json({
      success: true,
      message: 'Toutes les notifications marquées comme lues'
    });
  } catch (error) {
    console.error('❌ Erreur marquage notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors du marquage des notifications'
    });
  }
});

// Marquer des notifications spécifiques comme lues
router.post('/mark-read', authenticateToken, async (req, res) => {
  try {
    const { notificationIds } = req.body;
    await notificationService.markNotificationsAsRead(req.seller.id, notificationIds);

    res.json({
      success: true,
      message: 'Notifications marquées comme lues'
    });
  } catch (error) {
    console.error('❌ Erreur marquage notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors du marquage des notifications'
    });
  }
});

// Statistiques des notifications
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await notificationService.getNotificationStats(req.seller.id);

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('❌ Erreur statistiques notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des statistiques'
    });
  }
});

// Tester l'envoi d'une notification
router.post('/test', authenticateToken, async (req, res) => {
  try {
    const testData = {
      order: {
        id: 999,
        customer_name: 'Test Client',
        total_price: 50000,
        product: {
          name: 'Produit Test'
        }
      },
      message: 'Notification de test'
    };

    const { sent } = await notificationService.sendRealtimeNotification(
      req.seller.id,
      'new_order',
      testData
    );

    res.json({
      success: true,
      sent,
      message: sent ? 'Notification de test envoyée' : 'Notification de test en queue'
    });
  } catch (error) {
    console.error('❌ Erreur test notification:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors du test de notification'
    });
  }
});

module.exports = router; 