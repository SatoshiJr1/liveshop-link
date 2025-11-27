import React, { useState, useEffect } from 'react';
import { Bell, X, Check, AlertCircle } from 'lucide-react';
import { useNotificationStore } from '../hooks/useNotificationStore';
import audioService from '../services/audioService';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import NotificationToast from './NotificationToast';

const NotificationIndicator = ({ 
  showNotifications: externalShowNotifications, 
  setShowNotifications: externalSetShowNotifications 
}) => {
  const [forceUpdate, setForceUpdate] = useState(0);
  const [internalShowNotifications, setInternalShowNotifications] = useState(false);
  const [activeToasts, setActiveToasts] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [lastProcessedEventId, setLastProcessedEventId] = useState(null);
  
  // Relire le store à chaque forceUpdate
  const storeData = useNotificationStore();
  const { notifications = [], unreadCount = 0, markAsRead, isConnected } = storeData;

  // Log à chaque render pour debug
  console.log('🎨 [INDICATOR-RENDER] NotificationIndicator render, forceUpdate:', forceUpdate, 'notifications:', notifications.length, 'unreadCount:', unreadCount);

  // Utiliser les props externes si disponibles, sinon l'état interne
  const showNotifications = externalShowNotifications !== undefined ? externalShowNotifications : internalShowNotifications;
  const setShowNotifications = externalSetShowNotifications || setInternalShowNotifications;

  // Force update au montage et écoute des refresh
  useEffect(() => {
    console.log('🎊 [INDICATOR-MOUNT] NotificationIndicator monté, notifications actuelles:', notifications.length);
    
    // Écouter les demandes de force refresh et FORCER un re-render
    const handleForceRefresh = () => {
      console.log('🔄 [INDICATOR-REFRESH] Force refresh reçu, force re-render...');
      setForceUpdate(prev => {
        const newValue = prev + 1;
        console.log('🔄 [INDICATOR-FORCE-UPDATE] forceUpdate:', prev, '→', newValue);
        return newValue;
      });
    };
    
    window.addEventListener('forceRefreshNotifications', handleForceRefresh);
    
    return () => {
      window.removeEventListener('forceRefreshNotifications', handleForceRefresh);
    };
  }, []); // Dépendances vides pour ne s'abonner qu'une fois

  // Détecter les changements de taille d'écran
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${days}j`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_order':
        return <AlertCircle className="w-4 h-4 text-green-600" />;
      case 'order_status_update':
        return <Check className="w-4 h-4 text-blue-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'new_order':
        return 'bg-green-50 border-green-200';
      case 'order_status_update':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  // Marquage automatique comme lu à l'ouverture + activation audio
  useEffect(() => {
    if (showNotifications && unreadCount > 0) {
      // Activer l'audio au premier clic (requis par les navigateurs)
      if (!audioService.enabled) {
        audioService.setEnabled(true);
        console.log('🔊 Audio activé automatiquement');
      }
      
      // Marquer automatiquement toutes les notifications comme lues
      markAsRead();
    }
  }, [showNotifications, unreadCount, markAsRead]);

  const handleMarkAllAsRead = () => {
    markAsRead();
    setShowNotifications(false);
  };

  const handleMarkAsRead = (notificationId) => {
    markAsRead([notificationId]);
  };

  // Écouter les nouvelles notifications pour afficher les toasts
  useEffect(() => {
    console.log('🎊 NotificationIndicator - Configuration listener newNotifications');
    
    const handleNewNotifications = (event) => {
      console.log('🎊 NotificationIndicator - Événement newNotifications reçu:', event.detail);
      const { notifications: newNotifications } = event.detail;
      
      // Créer un ID unique pour cet événement
      const eventId = `${Date.now()}-${JSON.stringify(newNotifications)}`;
      
      // Vérifier si on a déjà traité cet événement
      if (lastProcessedEventId === eventId) {
        console.log('⚠️ Événement déjà traité, ignoré:', eventId);
        return;
      }
      
      setLastProcessedEventId(eventId);
      console.log('🎊 NotificationIndicator - Nombre de notifications:', newNotifications?.length);
      
      if (newNotifications && newNotifications.length > 0) {
        newNotifications.forEach((notification, index) => {
          console.log('🎊 NotificationIndicator - Création toast pour:', notification);
          const toastId = `toast-${notification.id}-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`;
          
          setActiveToasts(prev => {
            // Vérifier si un toast avec cette notification existe déjà
            const existingToast = prev.find(toast => toast.notification.id === notification.id);
            if (existingToast) {
              console.log('⚠️ Toast déjà existant pour notification:', notification.id);
              return prev;
            }
            
            console.log('🎊 NotificationIndicator - Ajout toast, total:', prev.length + 1);
            return [...prev, { id: toastId, notification }];
          });
          
          // Supprimer le toast après 8 secondes
          setTimeout(() => {
            setActiveToasts(prev => prev.filter(toast => toast.id !== toastId));
          }, 8000);
        });
        
        // 🔔 Mettre à jour le store de notifications pour le badge
        console.log('🔔 Mise à jour du store de notifications...');
        // Émettre un événement pour mettre à jour le store
        window.dispatchEvent(new CustomEvent('updateNotificationStore', {
          detail: { notifications: newNotifications }
        }));
      } else {
        console.warn('⚠️ NotificationIndicator - Pas de notifications dans l\'événement');
      }
    };

    window.addEventListener('newNotifications', handleNewNotifications);
    return () => {
      console.log('🎊 NotificationIndicator - Suppression listener newNotifications');
      window.removeEventListener('newNotifications', handleNewNotifications);
    };
  }, []);

  const handleViewOrder = (orderId) => {
    // Navigation vers la page des commandes
    window.location.href = `/orders/${orderId}`;
  };

  const handleViewAllOrders = () => {
    // Navigation vers la page générale des commandes
    window.location.href = '/orders';
  };

  const handleCloseToast = (toastId) => {
    setActiveToasts(prev => prev.filter(toast => toast.id !== toastId));
  };

  return (
    <div className="relative">

      {/* Overlay pour fermer le panneau */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        />
      )}

      {/* Panneau de notifications - Position fixe depuis le header */}
      {showNotifications && (
        <div className="fixed top-16 right-4 w-80 sm:w-80 md:w-96 max-w-80 sm:max-w-sm z-50 animate-in slide-in-from-top-2 duration-200">
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-md rounded-2xl overflow-hidden">
            {/* Header avec gradient - Compact */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="p-1.5 bg-white/20 rounded-full">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    {isConnected && (
                      <div className="flex items-center gap-1.5 text-white/80 text-xs">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="hidden sm:inline">Connecté</span>
                        <span className="sm:hidden">En ligne</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 md:gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNotifications(false)}
                    className="text-white/90 hover:text-white hover:bg-white/20 p-1.5 md:p-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Contenu des notifications - Compact */}
            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                    <Bell className="w-6 h-6 text-purple-500" />
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Aucune notification</h4>
                  <p className="text-gray-500 text-xs">Vous serez notifié ici des nouvelles commandes</p>
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {notifications.slice(0, 10).map((notification) => (
                    <div
                      key={notification.id}
                      className={`group relative p-3 rounded-xl border transition-all duration-300 hover:shadow-md cursor-pointer ${
                        !notification.read 
                          ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-sm' 
                          : 'bg-white border-gray-100 hover:border-gray-200'
                      }`}
                      onClick={() => {
                        // Marquer comme lu et rediriger si c'est une commande
                        if (notification.type === 'new_order' && notification.data?.order?.id) {
                          handleMarkAsRead(notification.id);
                          handleViewOrder(notification.data.order.id);
                        } else {
                          handleMarkAsRead(notification.id);
                        }
                      }}
                    >
                      {/* Indicateur de lecture */}
                      {!notification.read && (
                        <div className="absolute top-2 md:top-3 right-2 md:right-3 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      )}
                      
                      <div className="flex items-start gap-3 md:gap-4">
                        {/* Icône avec fond coloré */}
                        <div className={`p-1.5 md:p-2 rounded-full ${
                          notification.type === 'new_order' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-blue-100 text-blue-600'
                        }`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                            {notification.title}
                          </h4>
                          <p className="text-xs sm:text-sm text-gray-600 mb-2 leading-relaxed line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                              {formatTime(notification.created_at)}
                            </span>
                            {notification.type === 'new_order' && (
                              <span className="text-blue-600 font-medium text-xs hidden sm:inline">
                                Cliquer pour voir
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer avec statistiques et bouton voir toutes les commandes */}
            {notifications.length > 0 && (
              <div className="border-t border-gray-100 p-3 bg-gray-50/50">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>{notifications.length} notification{notifications.length > 1 ? 's' : ''}</span>
                  <span>{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</span>
                </div>
                {notifications.some(n => n.type === 'new_order') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleViewAllOrders}
                    className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm py-2 h-10"
                  >
                    <span className="hidden sm:inline">Voir toutes les commandes</span>
                    <span className="sm:hidden">Voir commandes</span>
                  </Button>
                )}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Overlay pour fermer */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        />
      )}

      {/* Toasts responsives avec Tailwind */}
      {activeToasts.map((toast, index) => (
        <div 
          key={toast.id} 
          className={`
            fixed z-50 transition-all duration-300 ease-out
            /* Mobile: sous le header, pleine largeur */
            left-3 right-3
            /* Tablet: coin supérieur droit */
            md:left-auto md:right-4 md:w-96
            /* Desktop: optimisé */
            lg:right-6 lg:w-80
          `}
          style={{ 
            // Position verticale responsive
            top: isMobile 
              ? `${5 + (index * 4.5)}rem` // Mobile: empiler vers le bas sous le header
              : `${1 + (index * 0.5)}rem`, // Desktop/Tablet: léger décalage depuis le top
            zIndex: 50 + index,
            animationDelay: `${index * 150}ms`
          }}
        >
          <NotificationToast
            notification={toast.notification}
            onClose={() => handleCloseToast(toast.id)}
            onViewOrder={handleViewOrder}
          />
        </div>
      ))}
    </div>
  );
};

export default NotificationIndicator; 