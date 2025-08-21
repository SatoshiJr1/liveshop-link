import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { seller, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [lastNotificationId, setLastNotificationId] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Refs pour éviter les boucles
  const pollingRef = useRef(null);
  const tokenRef = useRef(null);
  const sellerIdRef = useRef(null);

  // Récupérer le token une seule fois
  const token = localStorage.getItem('liveshop_token');

  // Initialisation unique
  useEffect(() => {
    if (isInitialized || authLoading || !token || !seller) return;

    console.log('🔔 NotificationProvider - Initialisation unique');
    setIsInitialized(true);
    tokenRef.current = token;
    sellerIdRef.current = seller.id;
    
    // Charger les notifications initiales
    loadInitialNotifications();
    
    // Démarrer le polling
    startPolling();
  }, [authLoading, token, seller, isInitialized]);

  // Nettoyage à la déconnexion
  useEffect(() => {
    if (!token && isInitialized) {
      console.log('🔔 NotificationProvider - Déconnexion détectée');
      stopPolling();
      setNotifications([]);
      setUnreadCount(0);
      setLastNotificationId(0);
      setIsInitialized(false);
    }
  }, [token, isInitialized]);

  // Charger les notifications initiales
  const loadInitialNotifications = useCallback(async () => {
    if (!tokenRef.current) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/notifications', {
        headers: {
          'Authorization': `Bearer ${tokenRef.current}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const newNotifications = data.notifications || [];
        
        setNotifications(newNotifications);
        setUnreadCount(newNotifications.filter(n => !n.read).length);
        
        if (newNotifications.length > 0) {
          const maxId = Math.max(...newNotifications.map(n => n.id));
          setLastNotificationId(maxId);
        }
        
        console.log(`🔔 ${newNotifications.length} notifications chargées`);
      }
    } catch (error) {
      console.error('❌ Erreur chargement notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Vérifier les nouvelles notifications
  const checkNewNotifications = useCallback(async () => {
    if (!tokenRef.current || !sellerIdRef.current) return;
    
    try {
      const response = await fetch('http://localhost:3001/api/notifications', {
        headers: {
          'Authorization': `Bearer ${tokenRef.current}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const allNotifications = data.notifications || [];
        
        // Trouver les nouvelles notifications
        const newNotifications = allNotifications.filter(n => n.id > lastNotificationId);
        
        if (newNotifications.length > 0) {
          console.log(`🆕 ${newNotifications.length} nouvelles notifications détectées`);
          
          // Ajouter les nouvelles notifications
          setNotifications(prev => [...newNotifications, ...prev]);
          setUnreadCount(prev => prev + newNotifications.length);
          
          // Mettre à jour le dernier ID
          const maxId = Math.max(...allNotifications.map(n => n.id));
          setLastNotificationId(maxId);
          
          // Jouer le son et émettre l'événement
          newNotifications.forEach(notification => {
            if (notification.type === 'new_order') {
              playNotificationSound();
            }
          });
          
          // Émettre l'événement pour les toasts
          window.dispatchEvent(new CustomEvent('newNotifications', {
            detail: { notifications: newNotifications, count: newNotifications.length }
          }));
        }
      }
    } catch (error) {
      console.error('❌ Erreur vérification notifications:', error);
    }
  }, [lastNotificationId]);

  // Démarrer le polling
  const startPolling = useCallback(() => {
    if (pollingRef.current) return;
    
    console.log('🔄 Démarrage du polling des notifications');
    pollingRef.current = setInterval(checkNewNotifications, 5000); // 5 secondes
  }, [checkNewNotifications]);

  // Arrêter le polling
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
      console.log('🛑 Polling arrêté');
    }
  }, []);

  // Marquer comme lu
  const markAsRead = useCallback(async (notificationIds = null) => {
    if (!tokenRef.current) return;
    
    try {
      const response = await fetch('http://localhost:3001/api/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenRef.current}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notificationIds })
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => ({
            ...n,
            read: notificationIds ? notificationIds.includes(n.id) : true
          }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('❌ Erreur marquage notifications:', error);
    }
  }, []);

  // Jouer le son
  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio('/audio/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignorer les erreurs de son
      });
    } catch (error) {
      // Ignorer les erreurs de son
    }
  }, []);

  // Actualiser manuellement
  const refreshData = useCallback(() => {
    loadInitialNotifications();
    window.dispatchEvent(new CustomEvent('forceRefresh'));
  }, [loadInitialNotifications]);

  // Vérifier les mises à jour récentes
  const hasRecentUpdates = useCallback(() => {
    return unreadCount > 0;
  }, [unreadCount]);

  // Nettoyage au démontage
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  const value = {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    refreshData,
    hasRecentUpdates,
    playNotificationSound,
    isInitialized
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 