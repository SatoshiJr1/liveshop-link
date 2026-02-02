import io from 'socket.io-client';

class RealtimeService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  // Se connecter au WebSocket
  connect() {
    if (this.socket && this.isConnected) {
      console.log('🔌 WebSocket déjà connecté');
      return;
    }

    try {
      const serverUrl = window.location.hostname.includes('livelink.store') 
        ? 'https://api.livelink.store'
        : 'http://localhost:3001';

      console.log('🔌 Connexion WebSocket à:', serverUrl);
      
      this.socket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });

      this.setupEventListeners();
      
    } catch (error) {
      console.error('❌ Erreur connexion WebSocket:', error);
    }
  }

  // Configurer les écouteurs d'événements
  setupEventListeners() {
    if (!this.socket) return;

    // Connexion établie
    this.socket.on('connect', () => {
      console.log('✅ WebSocket connecté avec succès');
      this.isConnected = true;
      this.emit('client_connected', { 
        client: 'web-client',
        timestamp: new Date().toISOString()
      });
    });

    // Déconnexion
    this.socket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket déconnecté:', reason);
      this.isConnected = false;
    });

    // Erreur de connexion
    this.socket.on('connect_error', (error) => {
      console.error('❌ Erreur connexion WebSocket:', error);
      this.isConnected = false;
    });

    // Reconnexion
    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 WebSocket reconnecté après', attemptNumber, 'tentatives');
      this.isConnected = true;
    });
  }

  // Écouter les nouveaux produits
  onProductCreated(callback) {
    if (!this.socket) {
      console.warn('⚠️ WebSocket non connecté, impossible d\'écouter product_created');
      return;
    }

    this.socket.on('product_created', (data) => {
      console.log('🆕 Nouveau produit reçu:', data);
      callback(data);
    });

    // Stocker le callback pour pouvoir le supprimer plus tard
    this.listeners.set('product_created', callback);
  }

  // Écouter les produits modifiés
  onProductUpdated(callback) {
    if (!this.socket) {
      console.warn('⚠️ WebSocket non connecté, impossible d\'écouter product_updated');
      return;
    }

    this.socket.on('product_updated', (data) => {
      console.log('✏️ Produit modifié reçu:', data);
      callback(data);
    });

    this.listeners.set('product_updated', callback);
  }

  // Écouter les produits supprimés
  onProductDeleted(callback) {
    if (!this.socket) {
      console.warn('⚠️ WebSocket non connecté, impossible d\'écouter product_deleted');
      return;
    }

    this.socket.on('product_deleted', (data) => {
      console.log('🗑️ Produit supprimé reçu:', data);
      callback(data);
    });

    this.listeners.set('product_deleted', callback);
  }

  // Écouter les produits épinglés
  onProductPinned(callback) {
    if (!this.socket) {
      console.warn('⚠️ WebSocket non connecté, impossible d\'écouter product_pinned');
      return;
    }

    this.socket.on('product_pinned', (data) => {
      console.log('📌 Produit épinglé reçu:', data);
      callback(data);
    });

    this.listeners.set('product_pinned', callback);
  }

  // Émettre un événement
  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn('⚠️ WebSocket non connecté, impossible d\'émettre:', event);
    }
  }

  // Se déconnecter
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('🔌 WebSocket déconnecté');
    }
  }

  // Supprimer un écouteur spécifique
  off(event) {
    if (this.socket && this.listeners.has(event)) {
      this.socket.off(event);
      this.listeners.delete(event);
      console.log('🔇 Écouteur supprimé:', event);
    }
  }

  // Supprimer tous les écouteurs
  removeAllListeners() {
    if (this.socket) {
      this.listeners.forEach((callback, event) => {
        this.socket.off(event);
      });
      this.listeners.clear();
      console.log('🔇 Tous les écouteurs supprimés');
    }
  }

  // Obtenir le statut de connexion
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id || null,
      listeners: Array.from(this.listeners.keys())
    };
  }
}

// Créer une instance singleton
const realtimeService = new RealtimeService();

export default realtimeService;