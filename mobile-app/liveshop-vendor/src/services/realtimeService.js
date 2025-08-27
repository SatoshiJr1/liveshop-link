import io from 'socket.io-client';

class RealtimeService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // 1 seconde
    this.listeners = new Map();
    this.isConnected = false;
  }

  // Connexion au Socket.IO
  connect() {
    try {
      const token = localStorage.getItem('liveshop_token');
      const socketUrl = this.getSocketUrl();
      
      this.socket = io(socketUrl, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling']
      });
      
      this.socket.on('connect', () => {
        console.log('🔌 Socket.IO connecté');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('connection', { status: 'connected' });
        
        // Authentifier avec le serveur
        this.socket.emit('authenticate', { token });
      });

      this.socket.on('authenticated', (data) => {
        console.log('✅ Authentification Socket.IO réussie:', data);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 Socket.IO déconnecté:', reason);
        this.isConnected = false;
        this.emit('connection', { status: 'disconnected' });
        
        // Tentative de reconnexion automatique
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`🔄 Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
          setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts);
        }
      });

      this.socket.on('error', (error) => {
        console.error('❌ Erreur Socket.IO:', error);
      });

      // Écouter les événements de produits
      this.socket.on('product_created', (data) => {
        console.log('🆕 Produit créé reçu:', data);
        this.emit('product_created', data);
      });

      this.socket.on('product_updated', (data) => {
        console.log('✏️ Produit mis à jour reçu:', data);
        this.emit('product_updated', data);
      });

      this.socket.on('product_deleted', (data) => {
        console.log('🗑️ Produit supprimé reçu:', data);
        this.emit('product_deleted', data);
      });

      this.socket.on('order_created', (data) => {
        console.log('📦 Commande créée reçue:', data);
        this.emit('order_created', data);
      });

      this.socket.on('order_updated', (data) => {
        console.log('📦 Commande mise à jour reçue:', data);
        this.emit('order_updated', data);
      });

      this.socket.on('live_started', (data) => {
        console.log('🎥 Live démarré reçu:', data);
        this.emit('live_started', data);
      });

      this.socket.on('live_ended', (data) => {
        console.log('🎥 Live terminé reçu:', data);
        this.emit('live_ended', data);
      });

      this.socket.on('notification', (data) => {
        console.log('📢 Notification reçue:', data);
        this.emit('notification', data);
      });

    } catch (error) {
      console.error('❌ Erreur connexion Socket.IO:', error);
    }
  }

  // Obtenir l'URL Socket.IO
  getSocketUrl() {
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    const hostname = window.location.hostname;
    const port = '3001'; // Port du backend
    
    return `${protocol}//${hostname}:${port}`;
  }

  // Envoyer un message
  send(type, payload = {}) {
    if (this.isConnected && this.socket) {
      this.socket.emit(type, payload);
      console.log('📤 Message Socket.IO envoyé:', { type, payload });
    } else {
      console.warn('⚠️ Socket.IO non connecté, message non envoyé:', { type, payload });
    }
  }

  // S'abonner à un événement
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  // Se désabonner d'un événement
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Émettre un événement
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ Erreur callback événement ${event}:`, error);
        }
      });
    }
  }

  // Déconnexion
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.listeners.clear();
  }

  // Statut de connexion
  getConnectionStatus() {
    return this.isConnected;
  }
}

// Instance singleton
const realtimeService = new RealtimeService();

export default realtimeService; 