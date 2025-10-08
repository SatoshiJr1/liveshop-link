const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const redisManager = require('./config/redis');

// Configuration par défaut pour le déploiement #8
const defaultConfig = {
  NODE_ENV: 'development', // Par défaut en développement
  PORT: 3001,
  DATABASE_URL: 'postgresql://liveshop_user:motdepassefort@fitsen-postgresql:5432/liveshop', // Pour production
  JWT_SECRET: 'production_secret_key_very_secure',
  CORS_ORIGIN: 'https://livelink.store,https://space.livelink.store',
  CLOUDINARY_CLOUD_NAME: 'dp2838ewe',
  CLOUDINARY_API_KEY: '837659378846734',
  CLOUDINARY_API_SECRET: 'udbbN6TXXOkdwXJ271cSRPVIaq8'
};

// Appliquer les valeurs par défaut si pas définies
Object.keys(defaultConfig).forEach(key => {
  if (!process.env[key]) {
    process.env[key] = defaultConfig[key];
  }
});

console.log('🔧 Configuration appliquée:');
console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
console.log('🔧 DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configurée' : '❌ Manquante');
console.log('🔧 FRONTEND_URL:', process.env.FRONTEND_URL ? '✅ Configurée' : '❌ Manquante');
console.log('🔧 VENDOR_URL:', process.env.VENDOR_URL ? '✅ Configurée' : '❌ Manquante');

const { sequelize, testConnection } = require('./config/database');
const { Seller, Product, Order } = require('./models');

// Import du middleware de debug
const debugMiddleware = require('./middleware/debugMiddleware');

// Import des routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const publicRoutes = require('./routes/public');
const liveRoutes = require('./routes/lives');
const notificationRoutes = require('./routes/notifications');
const creditRoutes = require('./routes/credits');
// const commentRoutes = require('./routes/comments');
const adminRoutes = require('./routes/admin');
const sellerRoutes = require('./routes/sellers');
const uploadRoutes = require('./routes/upload');
const pushRoutes = require('./routes/push');

const notificationService = require('./services/notificationService');

console.log('🚀 Démarrage de LiveShop Link API...');
console.log('=====================================');
console.log('📋 Informations système :');
console.log('- Node.js version:', process.version);
console.log('- Plateforme:', process.platform);
console.log('- Architecture:', process.arch);
console.log('- Répertoire de travail:', process.cwd());
console.log('- Variables d\'environnement chargées:', Object.keys(process.env).filter(key => key.includes('DB') || key.includes('NODE_ENV')).length);
console.log('');

const app = express();
const server = http.createServer(app);

// Configuration Socket.IO avec origines sécurisées
const allowedOrigins = [
  'https://livelink.store',
  'https://space.livelink.store',
  'https://api.livelink.store'
];

if (process.env.NODE_ENV === 'development') {
  allowedOrigins.push('http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000');
}

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

const PORT = process.env.PORT || 3001;

// Middleware CORS sécurisé
const corsOptions = {
  origin: function (origin, callback) {
    console.log('🌐 CORS - Origine demandée:', origin);
    console.log('🌐 CORS - NODE_ENV:', process.env.NODE_ENV);
    
    // Autoriser les requêtes sans origine (Postman, curl, etc.)
    if (!origin) {
      callback(null, true);
      return;
    }
    
    // Vérifier si l'origine est autorisée
    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS - Origine autorisée:', origin);
      callback(null, true);
    } else {
      console.log('🚫 CORS - Origine refusée:', origin);
      callback(new Error('CORS non autorisé'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept']
};

app.use(cors(corsOptions));

// Middleware de debug pour logger les requêtes
app.use(debugMiddleware.requestLogger());

// Middleware de gestion d'erreurs global
app.use((err, req, res, next) => {
  console.error('🚨 ERREUR GLOBALE:', err);
  console.error('🚨 URL:', req.url);
  console.error('🚨 Méthode:', req.method);
  console.error('🚨 Headers:', req.headers);
  
  if (err.message === 'CORS non autorisé') {
    return res.status(403).json({ 
      error: 'CORS Error', 
      message: 'Origine non autorisée',
      origin: req.headers.origin 
    });
  }
  
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir les fichiers statiques (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Route de test simple
app.get('/api/test', (req, res) => {
  console.log('🧪 Test route appelée');
  res.json({ 
    message: 'API fonctionne !', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown'
  });
});

app.get('/api/health', (req, res) => {
  console.log('🏥 Health check appelé');
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    cors: 'enabled'
  });
});

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

  // ACK de réception de notification
  socket.on('notification_ack', async (data) => {
    try {
      const { notificationId } = data;
      if (!notificationId) return;

      console.log(`✅ ACK reçu pour notification ${notificationId} du vendeur ${socket.sellerId}`);
      
      // Pour l'instant, on log juste l'ACK (à implémenter plus tard avec colonnes DB)
      console.log(`📝 ACK traité pour notification ${notificationId} du vendeur ${socket.sellerId}`);
    } catch (error) {
      console.error('❌ Erreur traitement ACK notification:', error);
    }
  });

  // Récupération delta au reconnect
  socket.on('request_missed_notifications', async (data, callback) => {
    try {
      const { lastNotificationId } = data;
      console.log(`🔄 Demande notifications manquées depuis ID ${lastNotificationId} pour vendeur ${socket.sellerId}`);
      
      const { Op } = require('sequelize');
      const missedNotifications = await Notification.findAll({
        where: {
          seller_id: socket.sellerId,
          id: { [Op.gt]: lastNotificationId || 0 }
        },
        order: [['id', 'ASC']],
        limit: 50
      });

      console.log(`📤 Envoi de ${missedNotifications.length} notifications manquées`);
      callback({ success: true, notifications: missedNotifications });
    } catch (error) {
      console.error('❌ Erreur récupération notifications manquées:', error);
      callback({ success: false, error: error.message });
    }
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
// app.use('/api/comments', commentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/push', pushRoutes);

// Initialiser le middleware de debug après l'enregistrement des routes
if (debugMiddleware.init) {
  debugMiddleware.init(app, sequelize);
}

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
app.use(debugMiddleware.errorLogger());
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
    
    // Initialiser Redis adapter pour Socket.IO (mode scalable)
    try {
      const redisClients = await redisManager.connect();
      if (redisClients) {
        io.adapter(createAdapter(redisClients.pubClient, redisClients.subClient));
        console.log('✅ Socket.IO Redis Adapter configuré - Mode multi-instances activé');
      } else {
        console.warn('⚠️  Socket.IO en mode local - Pas de Redis disponible');
      }
    } catch (error) {
      console.warn('⚠️  Impossible de configurer Redis adapter:', error.message);
      console.warn('⚠️  Socket.IO fonctionnera en mode local uniquement');
    }
    
    // Démarrer le processeur de retry des notifications (avec BullMQ)
    await notificationService.startRetryProcessor();
    
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
    
    // Déconnecter Redis
    await redisManager.disconnect();
    
    // Fermer Socket.IO
    io.close();
    
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

