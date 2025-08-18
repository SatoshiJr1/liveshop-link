const express = require('express');
const router = express.Router();
const { Live, LiveProduct, Product } = require('../models');
const { Op } = require('sequelize');
const { Parser } = require('json2csv');

// Créer un live
router.post('/', async (req, res) => {
  try {
    const { title, date, sellerId } = req.body;
    
    // Générer un slug unique
    const baseSlug = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Supprimer les caractères spéciaux
      .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
      .replace(/-+/g, '-') // Supprimer les tirets multiples
      .substring(0, 50); // Limiter la longueur
    
    let slug = baseSlug;
    let attempts = 0;
    const maxAttempts = 10;
    
    // Vérifier l'unicité du slug
    while (attempts < maxAttempts) {
      const existingLive = await Live.findOne({ where: { slug } });
      if (!existingLive) {
        break;
      }
      
      // Ajouter un suffixe unique
      const suffix = Math.random().toString(36).substring(2, 6);
      slug = `${baseSlug}-${suffix}`;
      attempts++;
    }
    
    // Si on n'a pas trouvé après maxAttempts, utiliser un timestamp
    if (attempts >= maxAttempts) {
      const timestamp = Date.now().toString(36);
      slug = `${baseSlug}-${timestamp}`;
    }
    
    const live = await Live.create({ title, date, sellerId, slug });
    res.status(201).json(live);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lister les lives d'un vendeur
router.get('/', async (req, res) => {
  try {
    const { sellerId } = req.query;
    if (!sellerId) return res.status(400).json({ error: 'sellerId requis' });
    const lives = await Live.findAll({ where: { sellerId }, order: [['date', 'DESC']] });
    res.json(lives);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Associer des produits à un live
router.post('/:liveId/products', async (req, res) => {
  try {
    const { productIds } = req.body; // tableau d'IDs
    const { liveId } = req.params;
    if (!Array.isArray(productIds)) return res.status(400).json({ error: 'productIds doit être un tableau' });
    // Supprimer les associations existantes
    await LiveProduct.destroy({ where: { liveId } });
    // Créer les nouvelles associations
    const bulk = productIds.map(productId => ({ liveId, productId }));
    await LiveProduct.bulkCreate(bulk);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Retirer un produit d'un live
router.delete('/:liveId/products/:productId', async (req, res) => {
  try {
    const { liveId, productId } = req.params;
    await LiveProduct.destroy({ where: { liveId, productId } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lister les produits d'un live
router.get('/:liveId/products', async (req, res) => {
  try {
    const { liveId } = req.params;
    const live = await Live.findByPk(liveId, {
      include: [{ model: Product }]
    });
    if (!live) return res.status(404).json({ error: 'Live non trouvé' });
    res.json(live.Products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lister les commandes d'un live
router.get('/:liveId/orders', async (req, res) => {
  try {
    const { liveId } = req.params;
    // Récupérer les produits associés à ce live
    const live = await Live.findByPk(liveId, { include: [{ model: Product }] });
    if (!live) return res.status(404).json({ error: 'Live non trouvé' });
    const productIds = live.Products.map(p => p.id);
    // Récupérer les commandes pour ces produits
    const orders = await require('../models').Order.findAll({
      where: { product_id: productIds.length > 0 ? productIds : [-1] },
      order: [['created_at', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supprimer un live
router.delete('/:liveId', async (req, res) => {
  try {
    const { liveId } = req.params;
    
    // Vérifier que le live existe
    const live = await Live.findByPk(liveId);
    if (!live) {
      return res.status(404).json({ error: 'Live non trouvé' });
    }
    
    // Supprimer les associations avec les produits
    await LiveProduct.destroy({ where: { liveId } });
    
    // Supprimer le live
    await live.destroy();
    
    res.json({ success: true, message: 'Live supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression live:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rapport PDF des ventes d'un live
router.get('/:liveId/report', async (req, res) => {
  try {
    const { liveId } = req.params;
    const live = await Live.findByPk(liveId, { include: [{ model: Product }] });
    if (!live) return res.status(404).json({ error: 'Live non trouvé' });
    const productIds = live.Products.map(p => p.id);
    const orders = await require('../models').Order.findAll({
      where: { product_id: productIds.length > 0 ? productIds : [-1] },
      order: [['created_at', 'DESC']]
    });
    
    // Calculer les statistiques (seulement commandes payées et livrées)
    const paidOrders = orders.filter(order => order.status === 'paid' || order.status === 'delivered');
    const totalOrders = orders.length;
    const paidOrdersCount = paidOrders.length;
    const totalRevenue = paidOrders.reduce((sum, order) => sum + (order.total_price || 0), 0);
    const todayOrders = paidOrders.filter(order => {
      const orderDate = new Date(order.created_at);
      const today = new Date();
      return orderDate.toDateString() === today.toDateString();
    });
    const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.total_price || 0), 0);
    
    // Générer le contenu HTML du rapport
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Rapport Live - ${live.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .stats { display: flex; justify-content: space-around; margin: 20px 0; }
          .stat-card { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; }
          .orders-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .orders-table th, .orders-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .orders-table th { background-color: #f2f2f2; }
          .total { font-weight: bold; margin-top: 20px; text-align: right; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 Rapport Live: ${live.title}</h1>
          <p>Date du live: ${new Date(live.date).toLocaleDateString()}</p>
          <p>Généré le: ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="stats">
          <div class="stat-card">
            <h3>Total Commandes</h3>
            <p>${totalOrders}</p>
          </div>
          <div class="stat-card">
            <h3>Commandes Payées</h3>
            <p>${paidOrdersCount}</p>
          </div>
          <div class="stat-card">
            <h3>Chiffre d'Affaires</h3>
            <p>${totalRevenue.toLocaleString()} FCFA</p>
          </div>
          <div class="stat-card">
            <h3>CA Aujourd'hui</h3>
            <p>${todayRevenue.toLocaleString()} FCFA</p>
          </div>
        </div>
        
        <h2>📋 Détail des Commandes</h2>
        <table class="orders-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Client</th>
              <th>Téléphone</th>
              <th>Produit</th>
              <th>Quantité</th>
              <th>Total</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map(order => `
              <tr>
                <td>${new Date(order.created_at).toLocaleDateString()}</td>
                <td>${order.customer_name || 'N/A'}</td>
                <td>${order.customer_phone || 'N/A'}</td>
                <td>${order.product_id || 'N/A'}</td>
                <td>${order.quantity || 1}</td>
                <td>${(order.total_price || 0).toLocaleString()} FCFA</td>
                <td>${order.status || 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="total">
          <h3>Total: ${totalRevenue.toLocaleString()} FCFA</h3>
        </div>
      </body>
      </html>
    `;
    
    // Pour l'instant, on retourne le HTML (on pourrait utiliser puppeteer pour générer un vrai PDF)
    res.header('Content-Type', 'text/html');
    res.attachment(`rapport-live-${live.title}-${liveId}.html`);
    return res.send(htmlContent);
  } catch (error) {
    console.error('Erreur génération rapport:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 