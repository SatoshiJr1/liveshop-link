import React, { useState, useEffect } from 'react';
import { Bell, X, Check, AlertCircle, ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

const NotificationToast = ({ notification, onClose, onViewOrder }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Animation d'entrée
    setIsAnimating(true);
    
    // Auto-fermeture après 8 secondes
    const timer = setTimeout(() => {
      handleClose();
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  const handleViewOrder = () => {
    if (onViewOrder && notification.data?.order?.id) {
      onViewOrder(notification.data.order.id);
    }
    handleClose();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_order':
        return <ShoppingCart className="w-5 h-5 text-green-600" />;
      case 'order_status_update':
        return <Check className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-purple-600" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'new_order':
        return 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800';
      case 'order_status_update':
        return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800';
      default:
        return 'border-purple-200 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-800';
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full transition-all duration-300 ${
      isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <Card className={`shadow-lg border-2 ${getNotificationColor(notification.type)}`}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              {getNotificationIcon(notification.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {notification.title}
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {notification.message}
              </p>
              
              {notification.type === 'new_order' && notification.data?.order && (
                <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded border">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Commande #{notification.data.order.id}
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {notification.data.order.customer_name} - {notification.data.order.total_price?.toLocaleString()} FCFA
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-400">
                  {new Date(notification.created_at).toLocaleTimeString()}
                </span>
                
                {notification.type === 'new_order' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleViewOrder}
                    className="text-xs h-7 px-2"
                  >
                    Voir la commande
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationToast; 