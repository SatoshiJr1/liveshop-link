import { useState, useEffect } from 'react';
import notificationStore from '../stores/notificationStore';

export const useNotificationStore = () => {
  const [state, setState] = useState(notificationStore.getState());

  useEffect(() => {
    // S'abonner aux changements du store
    const unsubscribe = notificationStore.subscribe(setState);
    
    // Nettoyer l'abonnement
    return unsubscribe;
  }, []);

  return {
    ...state,
    markAsRead: notificationStore.markAsRead.bind(notificationStore),
    playSound: notificationStore.playSound.bind(notificationStore),
    setToken: notificationStore.setToken.bind(notificationStore)
  };
}; 