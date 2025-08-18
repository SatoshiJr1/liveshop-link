import { io } from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 1000; // 1 seconde
    this.maxReconnectDelay = 30000; // 30 secondes max
    this.currentToken = null;
    this.isConnecting = false;
    this.reconnectTimer = null;
    this.heartbeatInterval = null;
    this.lastPing = null;
    this.connectionTimeout = 15000;
  }

  connect(token) {
    if (this.socket && this.isConnected) {
      console.log('🔗 WebSocket déjà connecté');
      return Promise.resolve();
    }

    if (this.isConnecting) {
      console.log('🔄 WebSocket en cours de connexion...');
      return Promise.resolve();
    }

    this.isConnecting = true;
    this.currentToken = token;

    return new Promise((resolve, reject) => {
      try {
        console.log('🔗 Tentative de connexion WebSocket...');
        
        // URL WebSocket robuste (support env et IP privées)
        const envUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BACKEND_URL) ? import.meta.env.VITE_BACKEND_URL : null;
        const envPort = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BACKEND_PORT) ? import.meta.env.VITE_BACKEND_PORT : null;
        const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
        const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
        const isPrivateIp = (h) => {
          return (
            h === 'localhost' ||
            h === '127.0.0.1' ||
            /^10\./.test(h) ||
            /^192\.168\./.test(h) ||
            /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(h)
          );
        };

        let wsUrl;
        if (envUrl) {
          // Permettre de forcer l'URL depuis l'environnement (ex: http://192.168.1.10:3001)
          wsUrl = envUrl.replace(/\/$/, '').replace(/\/api$/, '');
        } else if (isPrivateIp(hostname)) {
          const port = envPort || '3001';
          wsUrl = `${protocol}//${hostname}:${port}`;
        } else {
          // Prod: même host (port par défaut)
          wsUrl = `${protocol}//${hostname}`;
        }
        
        console.log('🔗 Connexion WebSocket vers:', wsUrl);
        
        // Connexion au serveur WebSocket avec configuration robuste
        this.socket = io(wsUrl, {
          transports: ['websocket', 'polling'],
          timeout: this.connectionTimeout,
          reconnection: false, // On gère la reconnexion manuellement
          reconnectionAttempts: 0,
          forceNew: true,
          upgrade: true,
          rememberUpgrade: false
        });

        // Timeout de connexion
        const connectionTimeout = setTimeout(() => {
          if (!this.isConnected) {
            console.error('⏰ Timeout de connexion WebSocket');
            this.isConnecting = false;
            reject(new Error('Timeout de connexion'));
          }
        }, this.connectionTimeout);

        // Gestion des événements de connexion
        this.socket.on('connect', () => {
          clearTimeout(connectionTimeout);
          console.log('🔗 WebSocket connecté avec succès');
          this.isConnected = true;
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          
          // Authentification avec le token
          if (this.currentToken) {
            console.log('🔐 Authentification WebSocket...');
            this.socket.emit('authenticate', { token: this.currentToken });
          }

          // Démarrer le heartbeat
          this.startHeartbeat();
        });

        this.socket.on('authenticated', (data) => {
          console.log('✅ WebSocket authentifié:', data.message);
          resolve(data);
        });

        this.socket.on('authentication_error', (error) => {
          console.error('❌ Erreur d\'authentification WebSocket:', error);
          this.isConnecting = false;
          reject(error);
        });

        this.socket.on('error', (error) => {
          console.error('❌ Erreur WebSocket:', error);
          this.isConnecting = false;
          reject(error);
        });

        this.socket.on('disconnect', (reason) => {
          console.log('🔌 WebSocket déconnecté:', reason);
          this.isConnected = false;
          this.isConnecting = false;
          this.stopHeartbeat();
          
          // Reconnexion automatique seulement si ce n'est pas une déconnexion volontaire
          if (reason !== 'io client disconnect' && this.currentToken) {
            this.scheduleReconnect();
          }
        });

        this.socket.on('connect_error', (error) => {
          console.error('❌ Erreur de connexion WebSocket:', error);
          this.isConnecting = false;
          reject(error);
        });

        // Gestion du ping/pong
        this.socket.on('pong', (latency) => {
          this.lastPing = Date.now();
          console.log(`🏓 Pong reçu, latence: ${latency}ms`);
        });

      } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation WebSocket:', error);
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  // Reconnexion automatique avec backoff exponentiel
  scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Nombre maximum de tentatives de reconnexion atteint');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.maxReconnectDelay
    );

    console.log(`🔄 Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts} dans ${delay}ms`);
    
    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.connect(this.currentToken);
        console.log('✅ Reconnexion réussie');
      } catch (error) {
        console.error('❌ Échec de la reconnexion:', error);
        this.scheduleReconnect();
      }
    }, delay);
  }

  // Heartbeat pour détecter les connexions mortes
  startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.isConnected) {
        this.socket.emit('ping');
        console.log('🏓 Ping envoyé');
      }
    }, 30000); // Ping toutes les 30 secondes
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.stopHeartbeat();

    if (this.socket) {
      console.log('🔌 Déconnexion WebSocket manuelle');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.isConnecting = false;
      this.currentToken = null;
      this.listeners.clear();
      this.reconnectAttempts = 0;
    }
  }

  // Écouter les nouvelles commandes
  onNewOrder(callback) {
    if (!this.socket) {
      console.warn('⚠️ WebSocket non connecté pour onNewOrder');
      return;
    }

    // Supprimer l'ancien listener s'il existe
    this.socket.off('new_order');
    
    this.socket.on('new_order', (data) => {
      console.log('🛒 Nouvelle commande reçue:', data);
      try {
        callback(data);
      } catch (error) {
        console.error('❌ Erreur dans callback new_order:', error);
      }
    });

    this.listeners.set('new_order', callback);
  }

  // Écouter les mises à jour de statut
  onOrderStatusUpdate(callback) {
    if (!this.socket) {
      console.warn('⚠️ WebSocket non connecté pour onOrderStatusUpdate');
      return;
    }

    // Supprimer l'ancien listener s'il existe
    this.socket.off('order_status_update');
    
    this.socket.on('order_status_update', (data) => {
      console.log('📊 Mise à jour de statut reçue:', data);
      try {
        callback(data);
      } catch (error) {
        console.error('❌ Erreur dans callback order_status_update:', error);
      }
    });

    this.listeners.set('order_status_update', callback);
  }

  // Écouter les nouveaux commentaires
  onNewComment(callback) {
    if (!this.socket) {
      console.warn('⚠️ WebSocket non connecté pour onNewComment');
      return;
    }

    this.socket.on('new_comment', (data) => {
      console.log('💬 Nouveau commentaire reçu:', data);
      try {
        callback(data);
      } catch (error) {
        console.error('❌ Erreur dans callback new_comment:', error);
      }
    });

    this.listeners.set('new_comment', callback);
  }

  // Écouter les notifications générales
  onNotification(callback) {
    if (!this.socket) {
      console.warn('⚠️ WebSocket non connecté pour onNotification');
      return;
    }

    // Supprimer l'ancien listener s'il existe
    this.socket.off('notification');
    
    this.socket.on('notification', (data) => {
      console.log('🔔 Notification reçue:', data);
      try {
        callback(data);
      } catch (error) {
        console.error('❌ Erreur dans callback notification:', error);
      }
    });

    this.listeners.set('notification', callback);
  }

  // Supprimer un listener
  off(event) {
    if (this.socket && this.listeners.has(event)) {
      this.socket.off(event);
      this.listeners.delete(event);
      console.log(`🗑️ Listener supprimé: ${event}`);
    }
  }

  // Supprimer tous les listeners
  offAll() {
    if (this.socket) {
      this.listeners.forEach((callback, event) => {
        this.socket.off(event);
      });
      this.listeners.clear();
      console.log('🗑️ Tous les listeners supprimés');
    }
  }

  // Vérifier si connecté
  isConnected() {
    return this.isConnected;
  }

  // Obtenir l'ID du socket
  getSocketId() {
    return this.socket ? this.socket.id : null;
  }

  // Obtenir les statistiques de connexion
  getConnectionStats() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      lastPing: this.lastPing,
      socketId: this.getSocketId()
    };
  }

  // Forcer une reconnexion
  forceReconnect() {
    console.log('🔄 Reconnexion forcée WebSocket');
    this.disconnect();
    setTimeout(() => {
      if (this.currentToken) {
        this.connect(this.currentToken);
      }
    }, 1000);
  }
}

// Instance singleton
const webSocketService = new WebSocketService();

export default webSocketService; 