import React, { useState, useEffect } from 'react';
import { Bell, X, Check, AlertCircle } from 'lucide-react';
import { useNotificationStore } from '../hooks/useNotificationStore';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import NotificationToast from './NotificationToast';

const NotificationIndicator = () => {
  const { notifications, unreadCount, markAsRead, isConnected } = useNotificationStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeToasts, setActiveToasts] = useState([]);

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

  // Marquage automatique comme lu à l'ouverture
  useEffect(() => {
    if (showNotifications && unreadCount > 0) {
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
    const handleNewNotifications = (event) => {
      const { notifications: newNotifications } = event.detail;
      
      newNotifications.forEach(notification => {
        const toastId = `toast-${notification.id}-${Date.now()}`;
        setActiveToasts(prev => [...prev, { id: toastId, notification }]);
        
        // Supprimer le toast après 8 secondes
        setTimeout(() => {
          setActiveToasts(prev => prev.filter(toast => toast.id !== toastId));
        }, 8000);
      });
    };

    window.addEventListener('newNotifications', handleNewNotifications);
    return () => window.removeEventListener('newNotifications', handleNewNotifications);
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
      {/* Bouton de notification - Design moderne et responsive */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowNotifications(!showNotifications)}
        className={`relative p-2.5 md:p-3 rounded-full transition-all duration-200 hover:bg-purple-50 hover:scale-105 ${
          showNotifications ? 'bg-purple-100 text-purple-600' : 'hover:text-purple-600'
        }`}
      >
        <Bell className="w-4 h-4 md:w-5 md:h-5" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1">
            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 md:h-6 md:w-6 flex items-center justify-center shadow-lg animate-bounce">
              {unreadCount > 99 ? '99+' : unreadCount}
            </div>
          </div>
        )}
        {isConnected && !unreadCount && (
          <div className="absolute -top-1 -right-1 h-2.5 w-2.5 md:h-3 md:w-3 bg-green-500 rounded-full animate-pulse shadow-lg"></div>
        )}
      </Button>

      {/* Panneau de notifications - Design moderne et responsive */}
      {showNotifications && (
        <div className="absolute left-[-58%] transform -translate-x-1/2 top-12 w-80 sm:w-80 md:w-96 max-w-80 sm:max-w-sm z-50 animate-in slide-in-from-top-2 duration-200">
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

      {/* Toasts de notifications en temps réel */}
      {activeToasts.map((toast, index) => (
        <div key={toast.id} style={{ top: `${4 + (index * 120)}rem` }}>
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