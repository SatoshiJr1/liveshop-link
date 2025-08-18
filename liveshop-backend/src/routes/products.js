const express = require('express');
const { Product, ProductVariant } = require('../models');
const { validateProductAttributes } = require('../config/productCategories');
const router = express.Router();

// Middleware d'authentification
const { authenticateToken } = require('../middleware/auth');

// Middleware de crédits
const { requireAndConsumeCredits } = require('../middleware/creditMiddleware');

// GET /api/products - Récupérer tous les produits du vendeur
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;

    // Compter le total des produits
    const totalProducts = await Product.count({
      where: { seller_id: req.seller.id }
    });

    // Récupérer les produits avec pagination
    const products = await Product.findAll({
      where: { seller_id: req.seller.id },
      include: [
        {
          model: ProductVariant,
          as: 'variants',
          attributes: ['id', 'name', 'attributes', 'price', 'stock_quantity', 'status']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: limit,
      offset: offset
    });

    const totalPages = Math.ceil(totalProducts / limit);

    res.json({
      products: products,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalProducts: totalProducts,
        productsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/products/:id - Récupérer un produit spécifique
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { 
        id: req.params.id,
        seller_id: req.seller.id 
      },
      include: [
        {
          model: ProductVariant,
          as: 'variants',
          attributes: ['id', 'name', 'attributes', 'price', 'stock_quantity', 'status', 'sku']
        }
      ]
    });

    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    res.json(product);
  } catch (error) {
    console.error('Erreur lors de la récupération du produit:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/products - Créer un nouveau produit
router.post('/', authenticateToken, ...requireAndConsumeCredits('ADD_PRODUCT', (req) => ({
  productName: req.body.name,
  category: req.body.category
})), async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      stock_quantity,
      category = 'general',
      attributes = {},
      images = [],
      tags = [],
      weight,
      dimensions,
      has_variants = false,
      variants = []
    } = req.body;

    // Validation des données de base
    if (!name || !price || stock_quantity === undefined) {
      return res.status(400).json({ 
        error: 'Nom, prix et quantité en stock sont requis' 
      });
    }

    // Validation des attributs spécifiques à la catégorie
    const attributeErrors = validateProductAttributes(category, attributes);
    if (attributeErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Erreurs de validation des attributs',
        details: attributeErrors 
      });
    }

    // Créer le produit principal
    const productData = {
      seller_id: req.seller.id,
      name: name.trim(),
      description: description?.trim() || null,
      price: parseFloat(price),
      stock_quantity: parseInt(stock_quantity),
      category,
      attributes: Object.keys(attributes).length > 0 ? attributes : null,
      images: images.length > 0 ? images : null,
      tags: tags.length > 0 ? tags : null,
      weight: weight ? parseFloat(weight) : null,
      dimensions: dimensions && (dimensions.length || dimensions.width || dimensions.height) ? dimensions : null,
      has_variants,
      status: 'active',
      image_url: images.length > 0 ? images[0] : null
    };

    const product = await Product.create(productData);

    // Créer les variantes si elles existent
    if (has_variants && variants && variants.length > 0) {
      const variantPromises = variants.map(variant => {
        return ProductVariant.create({
          product_id: product.id,
          name: variant.name,
          attributes: variant.attributes,
          price: variant.price || product.price,
          stock_quantity: variant.stock_quantity || 0,
          image_url: variant.image_url,
          status: 'active',
          sku: variant.sku
        });
      });

      await Promise.all(variantPromises);
    }

    // Récupérer le produit avec ses variantes
    const createdProduct = await Product.findByPk(product.id, {
      include: [
        {
          model: ProductVariant,
          as: 'variants',
          attributes: ['id', 'name', 'attributes', 'price', 'stock_quantity', 'status', 'sku']
        }
      ]
    });

    res.status(201).json({
      message: 'Produit créé avec succès',
      product: createdProduct,
      creditConsumption: res.locals.creditConsumption
    });
  } catch (error) {
    console.error('Erreur lors de la création du produit:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        error: 'Données invalides',
        details: error.errors.map(e => e.message)
      });
    }
    
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/products/:id - Mettre à jour un produit
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { 
        id: req.params.id,
        seller_id: req.seller.id 
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    const {
      name,
      description,
      price,
      stock_quantity,
      category,
      attributes,
      images,
      tags,
      weight,
      dimensions,
      has_variants,
      status
    } = req.body;

    // Validation des attributs si la catégorie change
    if (category && category !== product.category) {
      const attributeErrors = validateProductAttributes(category, attributes || {});
      if (attributeErrors.length > 0) {
        return res.status(400).json({ 
          error: 'Erreurs de validation des attributs',
          details: attributeErrors 
        });
      }
    }

    // Mettre à jour le produit
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (stock_quantity !== undefined) updateData.stock_quantity = parseInt(stock_quantity);
    if (category !== undefined) updateData.category = category;
    if (attributes !== undefined) updateData.attributes = Object.keys(attributes).length > 0 ? attributes : null;
    if (images !== undefined) {
      updateData.images = images.length > 0 ? images : null;
      updateData.image_url = images.length > 0 ? images[0] : null;
    }
    if (tags !== undefined) updateData.tags = tags.length > 0 ? tags : null;
    if (weight !== undefined) updateData.weight = weight ? parseFloat(weight) : null;
    if (dimensions !== undefined) updateData.dimensions = dimensions && (dimensions.length || dimensions.width || dimensions.height) ? dimensions : null;
    if (has_variants !== undefined) updateData.has_variants = has_variants;
    if (status !== undefined) updateData.status = status;

    await product.update(updateData);

    // Récupérer le produit mis à jour avec ses variantes
    const updatedProduct = await Product.findByPk(product.id, {
      include: [
        {
          model: ProductVariant,
          as: 'variants',
          attributes: ['id', 'name', 'attributes', 'price', 'stock_quantity', 'status', 'sku']
        }
      ]
    });

    res.json(updatedProduct);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du produit:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        error: 'Données invalides',
        details: error.errors.map(e => e.message)
      });
    }
    
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/products/:id - Supprimer un produit
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { 
        id: req.params.id,
        seller_id: req.seller.id 
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    await product.destroy();
    res.json({ message: 'Produit supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du produit:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PATCH /api/products/:id/pin - Épingler/Désépingler un produit
router.patch('/:id/pin', authenticateToken, async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { 
        id: req.params.id,
        seller_id: req.seller.id 
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    await product.update({ is_pinned: !product.is_pinned });
    res.json({ 
      message: product.is_pinned ? 'Produit épinglé' : 'Produit désépinglé',
      is_pinned: product.is_pinned 
    });
  } catch (error) {
    console.error('Erreur lors de l\'épinglage du produit:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/products/categories - Récupérer toutes les catégories
router.get('/categories', authenticateToken, async (req, res) => {
  try {
    const { getAllCategories } = require('../config/productCategories');
    const categories = getAllCategories();
    res.json(categories);
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;

