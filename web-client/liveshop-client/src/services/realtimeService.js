import io from 'socket.io-client';

class RealtimeService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.listeners = new Map();
  }

  // Connexion au Socket.IO
  connect() {
    try {
      const socketUrl = this.getSocketUrl();
      console.log('🔌 Tentative de connexion temps réel vers:', socketUrl);
      
      this.socket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        timeout: 15000
      });
      
      this.socket.on('connect', () => {
        console.log('✅ Web-client connecté au temps réel - Socket ID:', this.socket.id);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('connection', { status: 'connected' });
        
        // Alerte pour confirmer la connexion
        alert('🔌 Web-client connecté au temps réel !');
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ Web-client déconnecté:', reason);
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
        console.error('❌ Erreur temps réel web-client:', error);
      });

      // Écouter les événements de produits
      this.socket.on('product_created', (data) => {
        console.log('🆕 Nouveau produit créé (web-client):', data);
        this.emit('product_created', data);
      });

      this.socket.on('product_updated', (data) => {
        console.log('✏️ Produit mis à jour (web-client):', data);
        this.emit('product_updated', data);
      });

      this.socket.on('product_deleted', (data) => {
        console.log('🗑️ Produit supprimé (web-client):', data);
        this.emit('product_deleted', data);
      });

      // Écouter les événements de lives
      this.socket.on('live_started', (data) => {
        console.log('🎥 Nouveau live démarré (web-client):', data);
        this.emit('live_started', data);
      });

      this.socket.on('live_ended', (data) => {
        console.log('⏹️ Live terminé (web-client):', data);
        this.emit('live_ended', data);
      });

      this.socket.on('live_updated', (data) => {
        console.log('📺 Live mis à jour (web-client):', data);
        this.emit('live_updated', data);
      });

      // Écouter tous les événements pour debug
      this.socket.onAny((eventName, ...args) => {
        console.log('📡 Événement reçu (web-client):', eventName, args);
      });

    } catch (error) {
      console.error('❌ Erreur connexion temps réel web-client:', error);
    }
  }

  // Obtenir l'URL du serveur WebSocket
  getSocketUrl() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.NODE_ENV === 'production' 
      ? window.location.host 
      : '127.0.0.1:3001'; // Forcer IPv4 au lieu de localhost
    return `${protocol}//${host}`;
  }

  // Envoyer un message
  send(type, payload = {}) {
    if (this.socket && this.isConnected) {
      this.socket.emit(type, payload);
    }
  }

  // Ajouter un listener
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  // Supprimer un listener
  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  // Émettre un événement local
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ Erreur dans le listener ${event}:`, error);
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

  // Obtenir le statut de connexion
  getConnectionStatus() {
    return this.isConnected;
  }
}

const realtimeService = new RealtimeService();
export default realtimeService;