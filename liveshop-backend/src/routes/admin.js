const express = require('express');
const router = express.Router();
const { Seller, Product, Order, CreditTransaction, Live, LiveProduct } = require('../models');
const { requireSuperAdmin } = require('../middleware/adminMiddleware');
const { authenticateToken } = require('../middleware/auth');
const { Op } = require('sequelize');

// Appliquer l'authentification puis le middleware superadmin à toutes les routes
router.use(authenticateToken);
router.use(requireSuperAdmin);

// GET /api/admin/dashboard - Tableau de bord général
router.get('/dashboard', async (req, res) => {
  try {
    console.log('🔍 Admin Dashboard - Utilisateur:', req.seller);
    console.log('🔍 Admin Dashboard - Rôle:', req.seller.role);
    
    const totalSellers = await Seller.count();
    const activeSellers = await Seller.count({ where: { is_active: true } });
    const totalProducts = await Product.count();
    const totalOrders = await Order.count();
    const totalRevenue = await Order.sum('total_price') || 0;
    const totalCredits = await Seller.sum('credit_balance') || 0;

    const dashboardData = {
      overview: {
        totalSellers,
        activeSellers,
        totalProducts,
        totalOrders,
        totalRevenue,
        totalCredits,
        todayOrders: 0, // À implémenter
        todayRevenue: 0 // À implémenter
      }
    };

    console.log('🔍 Admin Dashboard - Données:', dashboardData);

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Erreur dashboard admin:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/admin/sellers - Liste des vendeurs
router.get('/sellers', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const sellers = await Seller.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      attributes: [
        'id', 'name', 'phone_number', 'public_link_id', 
        'credit_balance', 'role', 'is_active', 'created_at'
      ]
    });

    res.json({
      success: true,
      data: {
        sellers: sellers.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(sellers.count / limit),
          totalItems: sellers.count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Erreur liste vendeurs:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/admin/sellers/:id - Modifier un vendeur
router.put('/sellers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, is_active, credit_balance } = req.body;

    const seller = await Seller.findByPk(id);
    if (!seller) {
      return res.status(404).json({ error: 'Vendeur non trouvé' });
    }

    // Empêcher la modification du superadmin principal
    if (seller.phone_number === '+221771842787' && role !== 'superadmin') {
      return res.status(403).json({ error: 'Impossible de modifier le superadmin principal' });
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (role !== undefined) updates.role = role;
    if (is_active !== undefined) updates.is_active = is_active;
    if (credit_balance !== undefined) updates.credit_balance = credit_balance;

    await seller.update(updates);

    res.json({
      success: true,
      data: seller
    });
  } catch (error) {
    console.error('Erreur modification vendeur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/admin/sellers/:id/credits - Ajouter/retirer des crédits
router.post('/sellers/:id/credits', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, reason, type = 'bonus' } = req.body;

    const seller = await Seller.findByPk(id);
    if (!seller) {
      return res.status(404).json({ error: 'Vendeur non trouvé' });
    }

    const balanceBefore = seller.credit_balance;
    const newBalance = balanceBefore + amount;

    if (newBalance < 0) {
      return res.status(400).json({ error: 'Solde insuffisant' });
    }

    // Mettre à jour le solde
    await seller.update({ credit_balance: newBalance });

    // Enregistrer la transaction
    await CreditTransaction.create({
      seller_id: seller.id,
      type: type,
      amount: amount,
      balance_before: balanceBefore,
      balance_after: newBalance,
      description: `Admin: ${reason}`,
      metadata: {
        admin_id: req.seller.id,
        admin_name: req.seller.name,
        reason: reason
      }
    });

    res.json({
      success: true,
      data: {
        seller: seller,
        transaction: {
          amount,
          balanceBefore,
          balanceAfter: newBalance,
          reason
        }
      }
    });
  } catch (error) {
    console.error('Erreur modification crédits:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/admin/sellers/:id - Détails d'un vendeur
router.get('/sellers/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const seller = await Seller.findByPk(id, {
      include: [
        {
          model: Product,
          as: 'products',
          attributes: ['id', 'name', 'price', 'stock_quantity', 'created_at']
        },
        {
          model: Order,
          as: 'orders',
          attributes: ['id', 'customer_name', 'total_price', 'status', 'created_at']
        },
        {
          model: CreditTransaction,
          as: 'creditTransactions',
          attributes: ['id', 'type', 'amount', 'description', 'created_at'],
          limit: 10,
          order: [['created_at', 'DESC']]
        }
      ]
    });

    if (!seller) {
      return res.status(404).json({ error: 'Vendeur non trouvé' });
    }

    res.json({
      success: true,
      data: seller
    });
  } catch (error) {
    console.error('Erreur détails vendeur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/admin/orders - Liste des commandes
router.get('/orders', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const orders = await Order.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      include: [
        { model: Seller, as: 'seller', attributes: ['name', 'phone_number', 'role'] },
        { model: Product, as: 'product', attributes: ['name', 'price'] }
      ]
    });

    res.json({
      success: true,
      data: {
        orders: orders.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(orders.count / limit),
          totalItems: orders.count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Erreur liste commandes:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/admin/products - Liste des produits
router.get('/products', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const products = await Product.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      include: [
        { model: Seller, as: 'seller', attributes: ['name', 'phone_number', 'role'] }
      ]
    });

    res.json({
      success: true,
      data: {
        products: products.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(products.count / limit),
          totalItems: products.count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Erreur liste produits:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/admin/products/:id - Supprimer un produit
router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [{ model: Seller, as: 'seller', attributes: ['name', 'role'] }]
    });

    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    await product.destroy();

    res.json({
      success: true,
      message: 'Produit supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur suppression produit:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/admin/transactions - Historique des transactions
router.get('/transactions', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const transactions = await CreditTransaction.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      include: [
        { model: Seller, as: 'seller', attributes: ['name', 'phone_number', 'role'] }
      ]
    });

    res.json({
      success: true,
      data: {
        transactions: transactions.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(transactions.count / limit),
          totalItems: transactions.count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Erreur historique transactions:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/admin/sellers/:id/suspend - Suspendre un vendeur
router.post('/sellers/:id/suspend', async (req, res) => {
  try {
    const { id } = req.params;

    const seller = await Seller.findByPk(id);
    if (!seller) {
      return res.status(404).json({ error: 'Vendeur non trouvé' });
    }

    // Empêcher la suspension du superadmin principal
    if (seller.phone_number === '+221771842787') {
      return res.status(403).json({ error: 'Impossible de suspendre le superadmin principal' });
    }

    await seller.update({ is_active: false });

    res.json({
      success: true,
      message: 'Vendeur suspendu avec succès'
    });
  } catch (error) {
    console.error('Erreur suspension vendeur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/admin/sellers/:id/activate - Activer un vendeur
router.post('/sellers/:id/activate', async (req, res) => {
  try {
    const { id } = req.params;

    const seller = await Seller.findByPk(id);
    if (!seller) {
      return res.status(404).json({ error: 'Vendeur non trouvé' });
    }

    await seller.update({ is_active: true });

    res.json({
      success: true,
      message: 'Vendeur activé avec succès'
    });
  } catch (error) {
    console.error('Erreur activation vendeur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/admin/sellers/:id/orders - Commandes d'un vendeur
router.get('/sellers/:id/orders', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const orders = await Order.findAndCountAll({
      where: { seller_id: id },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'price', 'image_url']
        }
      ]
    });

    res.json({
      success: true,
      data: {
        orders: orders.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(orders.count / limit),
          totalItems: orders.count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Erreur commandes vendeur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/admin/sellers/:id/products - Produits d'un vendeur
router.get('/sellers/:id/products', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const products = await Product.findAndCountAll({
      where: { seller_id: id },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        products: products.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(products.count / limit),
          totalItems: products.count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Erreur produits vendeur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router; 