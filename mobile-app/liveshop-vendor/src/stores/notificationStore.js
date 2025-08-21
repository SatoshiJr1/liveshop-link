// Store de notifications professionnel (architecture Redux-like)
class NotificationStore {
  constructor() {
    this.state = {
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      lastNotificationId: 0,
      isConnected: false
    };
    
    this.listeners = new Set();
    this.pollingInterval = null;
    this.token = null;
    this.baseUrl = 'http://localhost:3001/api';
    this.voiceEnabled = true; // État local des notifications vocales
    
    // Écouter les changements d'état des notifications vocales
    window.addEventListener('voiceNotificationToggle', (event) => {
      this.voiceEnabled = event.detail.enabled;
      console.log('🔊 État notifications vocales changé:', this.voiceEnabled ? 'ACTIVÉ' : 'DÉSACTIVÉ');
    });
  }

  // S'abonner aux changements
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Notifier tous les listeners
  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  // Actions
  setToken(token) {
    console.log('🔔 NotificationStore.setToken appelé avec:', token ? 'TOKEN_PRESENT' : 'NO_TOKEN');
    this.token = token;
    if (token) {
      this.connect();
    } else {
      this.disconnect();
    }
  }

  async connect() {
    if (this.state.isConnected) return;
    
    this.setState({ isLoading: true });
    
    try {
      // Charger les notifications initiales
      await this.loadNotifications();
      
      // Démarrer le polling
      this.startPolling();
      
      this.setState({ 
        isConnected: true, 
        isLoading: false 
      });
      
      console.log('🔔 NotificationStore connecté');
    } catch (error) {
      console.error('❌ Erreur connexion NotificationStore:', error);
      this.setState({ isLoading: false });
    }
  }

  disconnect() {
    this.stopPolling();
    this.setState({
      notifications: [],
      unreadCount: 0,
      lastNotificationId: 0,
      isConnected: false,
      isLoading: false
    });
    console.log('🔔 NotificationStore déconnecté');
  }

  async loadNotifications() {
    if (!this.token) {
      console.log('🔔 loadNotifications: Pas de token');
      return;
    }

    console.log('🔔 loadNotifications: Chargement des notifications...');
    
    try {
      const response = await fetch(`${this.baseUrl}/notifications`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      console.log('🔔 loadNotifications: Réponse status:', response.status);

      if (response.ok) {
        const data = await response.json();
        const notifications = data.notifications || [];
        
        console.log('🔔 loadNotifications: Notifications reçues:', notifications.length);
        
        const unreadCount = notifications.filter(n => !n.read).length;
        const lastId = notifications.length > 0 ? Math.max(...notifications.map(n => n.id)) : 0;
        
        this.setState({
          notifications,
          unreadCount,
          lastNotificationId: lastId
        });
      } else {
        console.error('❌ loadNotifications: Erreur HTTP:', response.status);
      }
    } catch (error) {
      console.error('❌ Erreur chargement notifications:', error);
    }
  }

  startPolling() {
    if (this.pollingInterval) return;
    
    this.pollingInterval = setInterval(async () => {
      if (!this.token) return;
      
      try {
        const response = await fetch(`${this.baseUrl}/notifications`, {
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          const allNotifications = data.notifications || [];
          
          // Trouver les nouvelles notifications
          const newNotifications = allNotifications.filter(n => n.id > this.state.lastNotificationId);
          
          if (newNotifications.length > 0) {
            console.log(`🆕 ${newNotifications.length} nouvelles notifications`);
            
            // Mettre à jour l'état
            const updatedNotifications = [...newNotifications, ...this.state.notifications];
            const unreadCount = updatedNotifications.filter(n => !n.read).length;
            const lastId = Math.max(...allNotifications.map(n => n.id));
            
            this.setState({
              notifications: updatedNotifications,
              unreadCount,
              lastNotificationId: lastId
            });
            
            // Jouer le son et émettre l'événement
            newNotifications.forEach(notification => {
              if (notification.type === 'new_order') {
                this.playSound();
                // Vérifier si les notifications vocales sont activées
                if (this.isVoiceEnabled()) {
                  this.speakNotification(notification);
                }
              }
            });
            
            // Émettre l'événement pour les toasts
            window.dispatchEvent(new CustomEvent('newNotifications', {
              detail: { notifications: newNotifications, count: newNotifications.length }
            }));
          }
        }
      } catch (error) {
        console.error('❌ Erreur polling notifications:', error);
      }
    }, 5000); // 5 secondes
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  async markAsRead(notificationIds = null) {
    if (!this.token) return;

    try {
      const response = await fetch(`${this.baseUrl}/notifications/mark-read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notificationIds })
      });

      if (response.ok) {
        // Mettre à jour l'état local
        const updatedNotifications = this.state.notifications.map(n => ({
          ...n,
          read: notificationIds ? notificationIds.includes(n.id) : true
        }));
        
        this.setState({
          notifications: updatedNotifications,
          unreadCount: 0
        });
      }
    } catch (error) {
      console.error('❌ Erreur marquage notifications:', error);
    }
  }

  playSound() {
    try {
      // Créer un son de notification simple (beep)
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      
      console.log('🔔 Son de notification joué');
    } catch (error) {
      console.log('🔔 Erreur création son:', error.message);
    }
  }

  isVoiceEnabled() {
    // Utiliser l'état local qui est mis à jour en temps réel
    return this.voiceEnabled;
  }

  speakNotification(notification) {
    try {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance();
        
        // Configuration de la voix
        utterance.lang = 'fr-FR';
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        
        // Message vocal pour les nouvelles commandes
        if (notification.type === 'new_order' && notification.data?.order) {
          const order = notification.data.order;
          const product = order.product; // Le produit est dans order.product
          const message = `Nouvelle commande de ${order.customer_name}. ${product?.name || 'Produit'}. Quantité ${order.quantity}. Adresse ${order.customer_address}`;
          utterance.text = message;
        } else {
          utterance.text = notification.message || 'Nouvelle notification';
        }
        
        // Arrêter toute synthèse en cours
        window.speechSynthesis.cancel();
        
        // Lancer la synthèse
        window.speechSynthesis.speak(utterance);
        
        console.log('🗣️ Synthèse vocale lancée:', utterance.text);
      }
    } catch (error) {
      console.log('🗣️ Erreur synthèse vocale:', error.message);
    }
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notify();
  }

  getState() {
    return this.state;
  }

  // Nettoyer
  destroy() {
    this.disconnect();
    this.listeners.clear();
  }
}

// Instance singleton globale
const notificationStore = new NotificationStore();
export default notificationStore; 