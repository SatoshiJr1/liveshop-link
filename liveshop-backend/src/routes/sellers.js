const express = require('express');
const { Seller } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { uploadQRCode, handleUploadError } = require('../middleware/upload');
const path = require('path');

const router = express.Router();

// GET /api/sellers/payment-settings - Récupérer les paramètres de paiement
router.get('/payment-settings', authenticateToken, async (req, res) => {
  try {
    const seller = await Seller.findByPk(req.seller.id);
    
    if (!seller) {
      return res.status(404).json({ error: 'Vendeur non trouvé' });
    }

    const paymentSettings = {
      wave_qr_code_url: seller.wave_qr_code_url,
      orange_money_qr_code_url: seller.orange_money_qr_code_url,
      payment_settings: seller.payment_settings || {},
      payment_methods_enabled: seller.payment_methods_enabled || ['manual']
    };

    res.json({
      success: true,
      data: paymentSettings
    });

  } catch (error) {
    console.error('Erreur récupération paramètres paiement:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/sellers/payment-settings - Mettre à jour les paramètres de paiement
router.post('/payment-settings', authenticateToken, async (req, res) => {
  try {
    const { payment_settings, payment_methods_enabled, wave_phone, orange_money_phone } = req.body;

    const seller = await Seller.findByPk(req.seller.id);
    
    if (!seller) {
      return res.status(404).json({ error: 'Vendeur non trouvé' });
    }

    // Préparer les settings fusionnés
    const currentSettings = seller.payment_settings || {};
    const mergedSettings = {
      ...currentSettings,
      ...(payment_settings || {})
    };

    if (typeof wave_phone === 'string') {
      mergedSettings.wave = { ...(mergedSettings.wave || {}), phone: wave_phone };
    }
    if (typeof orange_money_phone === 'string') {
      mergedSettings.orange_money = { ...(mergedSettings.orange_money || {}), phone: orange_money_phone };
    }

    // Mettre à jour les paramètres
    await seller.update({
      payment_settings: mergedSettings,
      payment_methods_enabled: payment_methods_enabled || ['manual']
    });

    res.json({
      success: true,
      message: 'Paramètres de paiement mis à jour',
      data: {
        payment_settings: seller.payment_settings,
        payment_methods_enabled: seller.payment_methods_enabled
      }
    });

  } catch (error) {
    console.error('Erreur mise à jour paramètres paiement:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/sellers/upload-qr-code - Upload d'un QR code
router.post('/upload-qr-code', authenticateToken, uploadQRCode, handleUploadError, async (req, res) => {
  try {
    const { payment_method } = req.body; // 'wave' ou 'orange_money'
    
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    if (!payment_method || !['wave', 'orange_money'].includes(payment_method)) {
      return res.status(400).json({ error: 'Méthode de paiement invalide' });
    }

    const seller = await Seller.findByPk(req.seller.id);
    
    if (!seller) {
      return res.status(404).json({ error: 'Vendeur non trouvé' });
    }

    // Construire l'URL du fichier
    const fileUrl = `/uploads/qr-codes/${req.file.filename}`;

    // Mettre à jour le champ approprié
    const updateData = {};
    if (payment_method === 'wave') {
      updateData.wave_qr_code_url = fileUrl;
    } else if (payment_method === 'orange_money') {
      updateData.orange_money_qr_code_url = fileUrl;
    }

    // Ajouter la méthode aux méthodes activées si pas déjà présente
    let currentMethods = seller.payment_methods_enabled || ['manual'];
    
    // Parser si c'est une chaîne JSON
    if (typeof currentMethods === 'string') {
      try {
        currentMethods = JSON.parse(currentMethods);
      } catch (e) {
        currentMethods = ['manual'];
      }
    }
    
    if (!currentMethods.includes(payment_method)) {
      currentMethods.push(payment_method);
      updateData.payment_methods_enabled = JSON.stringify(currentMethods);
    }

    await seller.update(updateData);

    res.json({
      success: true,
      message: `QR code ${payment_method} uploadé avec succès`,
      data: {
        qr_code_url: fileUrl,
        payment_method: payment_method,
        payment_methods_enabled: seller.payment_methods_enabled
      }
    });

  } catch (error) {
    console.error('Erreur upload QR code:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/sellers/qr-code/:method - Supprimer un QR code
router.delete('/qr-code/:method', authenticateToken, async (req, res) => {
  try {
    const { method } = req.params; // 'wave' ou 'orange_money'
    
    if (!['wave', 'orange_money'].includes(method)) {
      return res.status(400).json({ error: 'Méthode de paiement invalide' });
    }

    const seller = await Seller.findByPk(req.seller.id);
    
    if (!seller) {
      return res.status(404).json({ error: 'Vendeur non trouvé' });
    }

    // Supprimer le fichier physique s'il existe
    let filePath = null;
    if (method === 'wave' && seller.wave_qr_code_url) {
      filePath = path.join(__dirname, '../../', seller.wave_qr_code_url);
    } else if (method === 'orange_money' && seller.orange_money_qr_code_url) {
      filePath = path.join(__dirname, '../../', seller.orange_money_qr_code_url);
    }

    if (filePath && require('fs').existsSync(filePath)) {
      require('fs').unlinkSync(filePath);
    }

    // Mettre à jour la base de données
    const updateData = {};
    if (method === 'wave') {
      updateData.wave_qr_code_url = null;
    } else if (method === 'orange_money') {
      updateData.orange_money_qr_code_url = null;
    }

    // Retirer la méthode des méthodes activées
    let currentMethods = seller.payment_methods_enabled || ['manual'];
    
    // Parser si c'est une chaîne JSON
    if (typeof currentMethods === 'string') {
      try {
        currentMethods = JSON.parse(currentMethods);
      } catch (e) {
        currentMethods = ['manual'];
      }
    }
    
    const updatedMethods = currentMethods.filter(m => m !== method);
    updateData.payment_methods_enabled = JSON.stringify(updatedMethods);

    await seller.update(updateData);

    res.json({
      success: true,
      message: `QR code ${method} supprimé avec succès`,
      data: {
        payment_methods_enabled: seller.payment_methods_enabled
      }
    });

  } catch (error) {
    console.error('Erreur suppression QR code:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router; 