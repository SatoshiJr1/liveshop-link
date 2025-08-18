const express = require('express');
const { Parser } = require('json2csv');
const { Seller, Product, Order } = require('../models');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const notificationService = require('../services/notificationService');

const router = express.Router();

// Middleware de validation des liens publics
const validatePublicLink = (req, res, next) => {
  const { linkId } = req.params;
  
  // Validation du format : 8-12 caractères alphanumériques
  const linkIdRegex = /^[a-z0-9]{8,12}$/;
  
  if (!linkIdRegex.test(linkId)) {
    return res.status(400).json({
      error: 'Format de lien invalide'
    });
  }
  
  next();
};

// Récupérer les produits publics d'un vendeur
router.get('/:linkId/products', validatePublicLink, async (req, res) => {
  try {
    const { linkId } = req.params;

    const seller = await Seller.findOne({
      where: { public_link_id: linkId }
    });

    if (!seller) {
      return res.status(404).json({
        error: 'Vendeur non trouvé'
      });
    }

    const products = await Product.findAll({
      where: { seller_id: seller.id },
      order: [
        ['is_pinned', 'DESC'],
        ['created_at', 'DESC']
      ]
    });

    res.json({
      seller: {
        name: seller.name,
        link_id: seller.public_link_id
      },
      products: products.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description,
        image_url: product.image_url,
        stock_quantity: product.stock_quantity,
        is_pinned: product.is_pinned,
        created_at: product.created_at
      }))
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des produits publics:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
});

// Récupérer les méthodes de paiement d'un vendeur (public)
router.get('/:linkId/payment-methods', validatePublicLink, async (req, res) => {
  try {
    const { linkId } = req.params;

    const seller = await Seller.findOne({
      where: { public_link_id: linkId }
    });

    if (!seller) {
      return res.status(404).json({
        error: 'Vendeur non trouvé'
      });
    }

    const paymentMethods = {
      wave: seller.wave_qr_code_url ? {
        available: true,
        qr_code_url: seller.wave_qr_code_url
      } : { available: false },
      orange_money: seller.orange_money_qr_code_url ? {
        available: true,
        qr_code_url: seller.orange_money_qr_code_url
      } : { available: false },
      manual: { available: true } // Toujours disponible
    };

    res.json({
      success: true,
      data: paymentMethods
    });

  } catch (error) {
    console.error('Erreur récupération méthodes paiement:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
});

// Récupérer les détails d'un produit public
router.get('/:linkId/products/:productId', validatePublicLink, async (req, res) => {
  try {
    const { linkId, productId } = req.params;

    const seller = await Seller.findOne({
      where: { public_link_id: linkId }
    });

    if (!seller) {
      return res.status(404).json({
        error: 'Vendeur non trouvé'
      });
    }

    const product = await Product.findOne({
      where: { 
        id: productId, 
        seller_id: seller.id 
      }
    });

    if (!product) {
      return res.status(404).json({
        error: 'Produit non trouvé'
      });
    }

    res.json({
      seller: {
        name: seller.name,
        link_id: seller.public_link_id
      },
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description,
        image_url: product.image_url,
        stock_quantity: product.stock_quantity,
        is_pinned: product.is_pinned,
        created_at: product.created_at
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du produit public:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
});

// Créer une nouvelle commande depuis l'interface publique
router.post('/:linkId/orders', validatePublicLink, async (req, res) => {
  console.log('🔍 Route POST /:linkId/orders appelée');
  console.log('📋 LinkId:', req.params.linkId);
  console.log('📦 Body:', req.body);
  
  try {
    const { linkId } = req.params;
    const { 
      product_id, 
      customer_name, 
      customer_phone, 
      customer_address, 
      quantity, 
      payment_method,
      payment_proof_url,
      comment 
    } = req.body;

    // Validation des champs requis
    if (!product_id || !customer_name || !customer_phone || !customer_address || !quantity || !payment_method) {
      return res.status(400).json({
        error: 'Tous les champs requis doivent être remplis'
      });
    }

    const seller = await Seller.findOne({
      where: { public_link_id: linkId }
    });

    if (!seller) {
      return res.status(404).json({
        error: 'Vendeur non trouvé'
      });
    }

    // Vérifier que le produit existe et appartient au vendeur
    const product = await Product.findOne({
      where: { 
        id: product_id, 
        seller_id: seller.id 
      }
    });

    if (!product) {
      return res.status(404).json({
        error: 'Produit non trouvé'
      });
    }

    // Validation de la quantité
    const orderQuantity = parseInt(quantity);
    if (isNaN(orderQuantity) || orderQuantity <= 0) {
      return res.status(400).json({
        error: 'Quantité invalide'
      });
    }

    // Vérifier le stock
    if (product.stock_quantity > 0 && orderQuantity > product.stock_quantity) {
      return res.status(400).json({
        error: 'Stock insuffisant'
      });
    }

    // Calculer le prix total
    const totalPrice = product.price * orderQuantity;

    // Créer la commande
    const order = await Order.create({
      product_id: product.id,
      seller_id: seller.id,
      customer_name: customer_name.trim(),
      customer_phone: customer_phone.trim(),
      customer_address: customer_address.trim(),
      quantity: orderQuantity,
      total_price: totalPrice,
      payment_method,
      payment_proof_url: payment_proof_url || '',
      comment: comment ? comment.trim() : ''
    });

    // Mettre à jour le stock si nécessaire
    if (product.stock_quantity > 0) {
      await product.update({
        stock_quantity: product.stock_quantity - orderQuantity
      });
    }

    // Envoyer une notification en temps réel au vendeur
    console.log('🔍 Debug - global.notifySeller disponible:', !!global.notifySeller);
    let notificationSent = false;
    
    try {
      const notificationData = {
        order: {
          id: order.id,
          product_id: order.product_id,
          customer_name: order.customer_name,
          customer_phone: order.customer_phone,
          customer_address: order.customer_address,
          quantity: order.quantity,
          total_price: order.total_price,
          payment_method: order.payment_method,
          status: order.status,
          created_at: order.created_at,
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            image_url: product.image_url
          }
        },
        message: `Nouvelle commande de ${customer_name.trim()} - ${product.name}`
      };

      const { sent } = await notificationService.sendRealtimeNotification(
        seller.id,
        'new_order',
        notificationData
      );
      
      notificationSent = sent;
      console.log('✅ Notification traitée par le service');
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de la notification:', error);
      notificationSent = false;
    }

    res.status(201).json({
      message: 'Commande créée avec succès',
      order: {
        id: order.id,
        product_id: order.product_id,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        customer_address: order.customer_address,
        quantity: order.quantity,
        total_price: order.total_price,
        payment_method: order.payment_method,
        status: order.status,
        created_at: order.created_at
      },
      notification_sent: notificationSent
    });

  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error);
    if (error && error.stack) {
      console.error(error.stack);
    }
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
});

// Ajouter un commentaire live
router.post('/:linkId/comments', validatePublicLink, async (req, res) => {
  try {
    const { linkId } = req.params;
    const { comment } = req.body;

    if (!comment) {
      return res.status(400).json({
        error: 'Commentaire requis'
      });
    }

    const seller = await Seller.findOne({
      where: { public_link_id: linkId }
    });

    if (!seller) {
      return res.status(404).json({
        error: 'Vendeur non trouvé'
      });
    }

    // Pour le MVP, on retourne simplement une confirmation
    // Dans une version complète, on pourrait stocker les commentaires
    // et les diffuser en temps réel via WebSocket

    res.status(201).json({
      message: 'Commentaire envoyé avec succès',
      comment: comment.trim(),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur lors de l\'ajout du commentaire:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
});

// Rapport global des ventes d'un vendeur
router.get('/sellers/:sellerId/report', async (req, res) => {
  try {
    const { sellerId } = req.params;
    // Récupérer tous les produits du vendeur
    const products = await Product.findAll({ where: { seller_id: sellerId } });
    const productIds = products.map(p => p.id);
    // Récupérer toutes les commandes de ces produits
    const orders = await Order.findAll({
      where: { product_id: productIds.length > 0 ? productIds : [-1] },
      order: [['created_at', 'DESC']]
    });
    // Formatage CSV
    const fields = [
      { label: 'Date', value: 'created_at' },
      { label: 'Client', value: 'customer_name' },
      { label: 'Téléphone', value: 'customer_phone' },
      { label: 'Produit', value: 'product_id' },
      { label: 'Quantité', value: 'quantity' },
      { label: 'Total', value: 'total_price' },
      { label: 'Statut', value: 'status' }
    ];
    const parser = new Parser({ fields });
    const csv = parser.parse(orders.map(o => o.toJSON()));
    res.header('Content-Type', 'text/csv');
    res.attachment(`rapport-global-vendeur-${sellerId}.csv`);
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route pour obtenir les informations de livraison (pour le QR code)
router.get('/orders/:orderId/delivery-info', async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      where: { id: orderId },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['name', 'price', 'image_url']
        },
        {
          model: Seller,
          as: 'seller',
          attributes: ['name', 'phone_number']
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    res.json({
      order: {
        id: order.id,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        customer_address: order.customer_address,
        quantity: order.quantity,
        total_price: order.total_price,
        payment_method: order.payment_method,
        status: order.status,
        created_at: order.created_at,
        product: order.product,
        seller: order.seller
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des infos de livraison:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des informations' });
  }
});

// Route pour générer le ticket de livraison (publique)
router.get('/orders/:orderId/delivery-ticket', async (req, res) => {
  try {
    console.log('🖨️ Génération de ticket pour la commande:', req.params.orderId);
    const { orderId } = req.params;

    console.log('🔍 Recherche de la commande...');
    // Récupérer la commande avec les détails du produit et du vendeur
    const order = await Order.findOne({
      where: { id: orderId },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['name', 'price', 'image_url']
        },
        {
          model: Seller,
          as: 'seller',
          attributes: ['name', 'phone_number']
        }
      ]
    });

    if (!order) {
      console.log('❌ Commande non trouvée');
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    console.log('✅ Commande trouvée:', order.id);

    // Créer le PDF
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });

    // Configuration de la réponse pour le PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="livraison-${order.id}.pdf"`);

    // Pipe le PDF vers la réponse
    doc.pipe(res);

    // Contenu du ticket
    doc.fontSize(24)
       .text('TICKET DE LIVRAISON', { align: 'center' });
    
    doc.moveDown(1);
    doc.fontSize(16)
       .text(`Commande #${order.id}`, { align: 'center' });
    
    doc.moveDown(1);

    // Générer le QR code
    const deliveryUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/delivery/${order.id}`;
    const qrCodeDataUrl = await QRCode.toDataURL(deliveryUrl, {
      width: 150,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Convertir Data URL en Buffer
    const qrCodeBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');
    
    // Ajouter le QR code au PDF
    doc.image(qrCodeBuffer, 250, 150, { width: 150, height: 150 });
    doc.fontSize(10)
       .text('Scannez pour plus de détails', 250, 320, { width: 150, align: 'center' });
    
    doc.moveDown(1);

    // Informations client
    doc.fontSize(14)
       .text('CLIENT');
    
    doc.fontSize(12)
       .text(`Nom: ${order.customer_name}`)
       .text(`Téléphone: ${order.customer_phone}`)
       .text(`Adresse: ${order.customer_address}`);
    
    doc.moveDown(1);

    // Informations produit
    doc.fontSize(14)
       .text('PRODUIT');
    
    doc.fontSize(12)
       .text(`Nom: ${order.product?.name || 'Produit inconnu'}`)
       .text(`Quantité: ${order.quantity}`)
       .text(`Prix unitaire: ${order.product?.price || 0} FCFA`)
       .text(`Prix total: ${order.total_price} FCFA`);
    
    doc.moveDown(1);

    // Informations livraison
    doc.fontSize(14)
       .text('LIVRAISON');
    
    doc.fontSize(12)
       .text(`Méthode de paiement: ${order.payment_method}`)
       .text(`Statut: ${order.status}`);
    
    doc.moveDown(1);

    // Contact vendeur
    doc.fontSize(14)
       .text('CONTACT VENDEUR');
    
    doc.fontSize(12)
       .text(`Nom: ${order.seller?.name || 'Vendeur'}`)
       .text(`Téléphone: ${order.seller?.phone_number || 'N/A'}`);
    
    doc.moveDown(1);

    // Date
    doc.fontSize(10)
       .text(`Généré le: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, { align: 'center' });

    console.log('📄 Finalisation du PDF...');
    // Finaliser le PDF
    doc.end();

    console.log('✅ PDF généré avec succès');

  } catch (error) {
    console.error('❌ Erreur lors de la génération du ticket:', error);
    res.status(500).json({ error: 'Erreur lors de la génération du ticket' });
  }
});

module.exports = router;

