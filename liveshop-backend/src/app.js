const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const { sequelize, testConnection } = require('./config/database');
const { Seller, Product, Order } = require('./models');

// Import des routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const publicRoutes = require('./routes/public');
const liveRoutes = require('./routes/lives');
const notificationRoutes = require('./routes/notifications');
const creditRoutes = require('./routes/credits');
const adminRoutes = require('./routes/admin');
const sellerRoutes = require('./routes/sellers');
const uploadRoutes = require('./routes/upload');

const notificationService = require('./services/notificationService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir les fichiers statiques (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Stockage des connexions WebSocket par vendeur
const sellerConnections = new Map();

// Gestion des connexions WebSocket
io.on('connection', (socket) => {
  console.log('Nouvelle connexion WebSocket:', socket.id);

  // Authentification du vendeur
  socket.on('authenticate', async (data) => {
    try {
      console.log('🔐 Tentative d\'authentification WebSocket...');
      const { token } = data;
      if (!token) {
        console.log('❌ Token manquant');
        socket.emit('error', { message: 'Token requis' });
        return;
      }

      console.log('🔑 Token reçu, vérification...');
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'liveshop_secret_key');
      console.log('✅ Token décodé:', decoded);
      
      // Le token contient 'id', pas 'sellerId'
      const sellerId = decoded.id || decoded.sellerId;
      console.log('🔍 SellerId extrait:', sellerId);
      
      const seller = await Seller.findByPk(sellerId);
      console.log('🔍 Recherche vendeur:', seller ? 'Trouvé' : 'Non trouvé');

      if (!seller) {
        console.log('❌ Vendeur non trouvé pour ID:', decoded.sellerId);
        socket.emit('error', { message: 'Vendeur non trouvé' });
        return;
      }

      // Associer le socket au vendeur
      socket.sellerId = seller.id;
      socket.join(`seller_${seller.id}`);
      
      if (!sellerConnections.has(seller.id)) {
        sellerConnections.set(seller.id, new Set());
      }
      sellerConnections.get(seller.id).add(socket.id);

      console.log(`Vendeur ${seller.name} (ID: ${seller.id}) connecté via WebSocket`);
      socket.emit('authenticated', { 
        message: 'Authentification réussie',
        seller: {
          id: seller.id,
          name: seller.name,
          public_link_id: seller.public_link_id
        }
      });

    } catch (error) {
      console.error('❌ Erreur d\'authentification WebSocket:', error);
      socket.emit('error', { message: 'Erreur d\'authentification' });
    }
  });

  // Gestion du ping/pong
  socket.on('ping', () => {
    const startTime = Date.now();
    socket.emit('pong', Date.now() - startTime);
  });

  // Déconnexion
  socket.on('disconnect', (reason) => {
    if (socket.sellerId) {
      const connections = sellerConnections.get(socket.sellerId);
      if (connections) {
        connections.delete(socket.id);
        if (connections.size === 0) {
          sellerConnections.delete(socket.sellerId);
        }
      }
      console.log(`Vendeur ${socket.sellerId} déconnecté (${reason})`);
    }
  });
});

// Nettoyage périodique des connexions mortes
setInterval(() => {
  const now = Date.now();
  let totalConnections = 0;
  let activeSellers = 0;

  sellerConnections.forEach((connections, sellerId) => {
    totalConnections += connections.size;
    if (connections.size > 0) {
      activeSellers++;
    }
  });

  console.log(`📊 WebSocket Stats: ${activeSellers} vendeurs actifs, ${totalConnections} connexions totales`);
}, 60000); // Toutes les minutes

// Fonction pour envoyer des notifications aux vendeurs
const notifySeller = (sellerId, event, data) => {
  const connections = sellerConnections.get(sellerId);
  if (connections && connections.size > 0) {
    io.to(`seller_${sellerId}`).emit(event, data);
    console.log(`Notification envoyée au vendeur ${sellerId}:`, event);
  }
};

// Fonction pour envoyer des notifications à tous les vendeurs connectés
const notifyAllSellers = (event, data) => {
  io.emit(event, data);
  console.log('Notification envoyée à tous les vendeurs:', event);
};

// Rendre les fonctions de notification disponibles globalement
global.notifySeller = notifySeller;
global.notifyAllSellers = notifyAllSellers;

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/lives', liveRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/credits', creditRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/upload', uploadRoutes);

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'LiveShop Link API is running',
    timestamp: new Date().toISOString(),
    connectedSellers: sellerConnections.size
  });
});

// Servir le frontend (pour la production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build/index.html'));
  });
}

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée'
  });
});

// Gestion globale des erreurs
app.use((error, req, res, next) => {
  console.error('Erreur globale:', error);
  res.status(500).json({
    error: 'Erreur interne du serveur'
  });
});

// Initialisation de la base de données et démarrage du serveur
const startServer = async () => {
  try {
    // Test de la connexion à la base de données
    await testConnection();
    
    // Synchronisation des modèles avec la base de données
    await sequelize.sync({ force: false });
    console.log('✅ Base de données synchronisée');
    
    // Démarrer le processeur de retry des notifications
    notificationService.startRetryProcessor();
    
    // Nettoyer les anciennes notifications (une fois par jour)
    setInterval(async () => {
      try {
        await notificationService.cleanupOldNotifications(30);
      } catch (error) {
        console.error('❌ Erreur nettoyage notifications:', error);
      }
    }, 24 * 60 * 60 * 1000); // 24 heures
    
    // Démarrage du serveur
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Serveur LiveShop Link démarré sur le port ${PORT}`);
      console.log(`📡 WebSocket disponible sur ws://localhost:${PORT}`);
      console.log(`📱 API disponible sur: http://localhost:${PORT}/api`);
      console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

// Gestion propre de l'arrêt du serveur
process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt du serveur...');
  try {
    // Arrêter le processeur de retry
    notificationService.stopRetryProcessor();
    
    await sequelize.close();
    console.log('✅ Connexion à la base de données fermée');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la fermeture:', error);
    process.exit(1);
  }
});

// Démarrer le serveur
startServer();

module.exports = app;

