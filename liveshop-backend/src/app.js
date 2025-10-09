const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const redisManager = require('./config/redis');
const { Notification } = require('./models');

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
    console.log('🌐 CORS - Origines autorisées:', allowedOrigins);
    
    // Autoriser les requêtes sans origine (Postman, curl, etc.)
    if (!origin) {
      console.log('✅ CORS - Requête sans origine (autorisée)');
      callback(null, true);
      return;
    }
    
    // Vérifier si l'origine est autorisée
    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS - Origine autorisée:', origin);
      callback(null, true);
    } else {
      console.log('🚫 CORS - Origine refusée:', origin);
      console.log('💡 CORS - Essayez d\'ajouter cette origine à allowedOrigins');
      // En production, autoriser quand même mais logger
      if (origin.includes('livelink.store')) {
        console.log('⚠️  CORS - Origine livelink.store autorisée par fallback');
        callback(null, true);
      } else {
        callback(new Error('CORS non autorisé'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept'],
  exposedHeaders: ['Content-Length', 'X-Requested-With']
};

// Appliquer CORS avant toute autre route
app.use(cors(corsOptions));

// Pre-flight requests
app.options('*', cors(corsOptions));

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
// Map pour accès direct aux sockets par vendeur (pour notifications)
const connectedSellers = new Map();

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
      
      // Ajouter à la map pour notifications (dernière socket connectée)
      connectedSellers.set(seller.id, socket);

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
      console.log(`🔄 [MISSED-REQ] Demande notifications manquées depuis ID ${lastNotificationId} pour vendeur ${socket.sellerId}`);
      
      if (!socket.sellerId) {
        console.error('❌ [MISSED-AUTH] Pas de sellerId sur la socket');
        callback({ success: false, error: 'not_ready', message: 'Socket non authentifiée' });
        return;
      }
      
      // Vérifier que lastNotificationId est un nombre valide
      const lastId = parseInt(lastNotificationId) || 0;
      if (isNaN(lastId) || lastId < 0) {
        console.error('❌ [MISSED-PARAM] lastNotificationId invalide:', lastNotificationId);
        callback({ success: false, error: 'invalid_param', message: 'lastNotificationId invalide' });
        return;
      }
      
      const { Op } = require('sequelize');
      console.log(`🔍 [MISSED-QUERY] Recherche notifications pour vendeur ${socket.sellerId} avec ID > ${lastId}`);
      
      const missedNotifications = await Notification.findAll({
        where: {
          seller_id: socket.sellerId,
          id: { [Op.gt]: lastId }
        },
        order: [['id', 'ASC']],
        limit: 50
      });

      console.log(`📤 [MISSED-FOUND] ${missedNotifications.length} notifications trouvées:`, 
        missedNotifications.map(n => ({ id: n.id, type: n.type, title: n.title, sent: n.sent })));
      
      callback({ 
        success: true, 
        notifications: missedNotifications,
        lastId: lastId,
        count: missedNotifications.length
      });
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
          // Supprimer aussi de la map de notifications
          connectedSellers.delete(socket.sellerId);
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

    // Fonction pour notifier un vendeur spécifique avec ACK
    global.notifySeller = (sellerId, type, data) => {
      return new Promise((resolve) => {
        const sellerSocket = connectedSellers.get(sellerId);
        if (sellerSocket && sellerSocket.connected) {
          console.log(`📤 [NOTIF-EMIT] Envoi notification ${type} au vendeur ${sellerId} avec ACK`);
          
          // Timeout pour ACK
          const timeout = setTimeout(() => {
            console.error(`⏰ [NOTIF-ACK] Timeout ACK pour notification ${data.notification?.id} vendeur ${sellerId}`);
            resolve(false);
          }, 5000);
          
          // Envoi avec callback ACK
          sellerSocket.emit(type, data, (ackResponse) => {
            clearTimeout(timeout);
            if (ackResponse?.ok) {
              console.log(`✅ [NOTIF-ACK] ACK reçu pour notification ${data.notification?.id} vendeur ${sellerId}`);
              resolve(true);
            } else {
              console.error(`❌ [NOTIF-ACK] ACK invalide pour notification ${data.notification?.id} vendeur ${sellerId}:`, ackResponse);
              resolve(false);
            }
          });
        } else {
          console.log(`❌ [NOTIF-EMIT] Vendeur ${sellerId} non connecté ou socket fermée`);
          resolve(false);
        }
      });
    };

    // Fonction pour envoyer des notifications à tous les vendeurs connectés
    global.notifyAllSellers = (event, data) => {
      io.emit(event, data);
      console.log('Notification envoyée à tous les vendeurs:', event);
    };

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
    
    // Initialiser le service de notifications avec BullMQ
    console.log('🔔 Initialisation du service de notifications...');
    await notificationService.initializeQueue();
    
    // Démarrer le processeur de retry
    notificationService.startRetryProcessor();
    console.log('🔄 Processeur de retry démarré');
    
    // Nettoyer les anciennes notifications (une fois par jour)
    setInterval(async () => {
      try {
        await notificationService.cleanupOldNotifications(30);
      } catch (error) {
        console.error('❌ Erreur nettoyage notifications:', error);
      }
    }, 24 * 60 * 60 * 1000); // 24 heures
    
    // Endpoint de test pour notifications hors ligne
    app.post('/api/test/create-notification', async (req, res) => {
      try {
        const notification = await Notification.create(req.body);
        console.log('🧪 Notification de test créée:', notification.id);
        res.json({ success: true, notification });
      } catch (error) {
        console.error('❌ Erreur création notification test:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    // Démarrer le serveur
    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📱 URL locale: http://localhost:${PORT}`);
      console.log(`🌐 CORS autorisé pour: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
      console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
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

