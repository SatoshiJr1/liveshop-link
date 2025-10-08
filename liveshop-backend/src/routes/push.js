const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const webPushService = require('../services/webPushService');

// Obtenir la clé publique VAPID
router.get('/vapid-public-key', (req, res) => {
  const publicKey = webPushService.getPublicKey();
  
  if (publicKey) {
    res.json({ success: true, publicKey });
  } else {
    res.status(503).json({ 
      success: false, 
      error: 'Web Push non configuré' 
    });
  }
});

// Enregistrer une souscription push
router.post('/subscribe', authenticateToken, async (req, res) => {
  try {
    const { subscription } = req.body;
    
    if (!subscription) {
      return res.status(400).json({
        success: false,
        error: 'Souscription requise'
      });
    }

    await webPushService.saveSubscription(req.seller.id, subscription);
    
    res.json({
      success: true,
      message: 'Souscription enregistrée'
    });
  } catch (error) {
    console.error('❌ Erreur enregistrement souscription:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'enregistrement'
    });
  }
});

// Supprimer une souscription
router.post('/unsubscribe', authenticateToken, async (req, res) => {
  try {
    await webPushService.removeSubscription(req.seller.id);
    
    res.json({
      success: true,
      message: 'Souscription supprimée'
    });
  } catch (error) {
    console.error('❌ Erreur suppression souscription:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression'
    });
  }
});

// Tester l'envoi d'une notification push
router.post('/test', authenticateToken, async (req, res) => {
  try {
    const sent = await webPushService.sendTestPush(req.seller.id);
    
    res.json({
      success: true,
      sent,
      message: sent ? 'Notification test envoyée' : 'Pas de souscription active'
    });
  } catch (error) {
    console.error('❌ Erreur test push:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors du test'
    });
  }
});

// Statistiques Web Push
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await webPushService.getStats();
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('❌ Erreur stats push:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des stats'
    });
  }
});

module.exports = router;
