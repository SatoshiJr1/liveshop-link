import React, { useState, useEffect } from 'react';
import { Bell, X, ShoppingCart, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotificationToast = ({ notification, onClose, onViewOrder }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-fermer après 10 secondes
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Attendre l'animation
    }, 10000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleViewOrder = () => {
    onViewOrder(notification.order.id);
    handleClose();
  };

  if (!notification) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'new_order':
        return <ShoppingCart className="w-5 h-5 text-green-600 " />;
      case 'order_status_update':
        return <CheckCircle className="w-5 h-5 text-blue-600 " />;
      default:
        return <Bell className="w-5 h-5 text-purple-600 " />;
    }
  };

  const getTitle = () => {
    switch (notification.type) {
      case 'new_order':
        return 'Nouvelle commande !';
      case 'order_status_update':
        return 'Statut mis à jour';
      default:
        return 'Notification';
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case 'new_order':
        return 'bg-green-50 border-green-200';
      case 'order_status_update':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-purple-50 border-purple-200';
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`${getBgColor()} border rounded-lg  p-4`}>
        <div className="flex items-start space-x-3 ">
          <div className="flex-shrink-0 ">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0 ">
            <div className="flex items-center justify-between ">
              <h4 className="text-sm font-semibold text-gray-900 ">
                {getTitle()}
              </h4>
              <button
                onClick={handleClose}
                className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 "
              >
                <X className="w-4 h-4 " />
              </button>
            </div>
            
            <p className="mt-1 text-sm text-gray-600 ">
              {notification.message}
            </p>
            
            {notification.order && (
              <div className="mt-2 text-xs text-gray-500 ">
                <div className="flex items-center space-x-2 ">
                  <span>Client: {notification.order.customer_name}</span>
                  <span>•</span>
                  <span>{notification.order.total_price != null ? notification.order.total_price.toLocaleString() + ' FCFA' : 'Montant inconnu'}</span>
                </div>
                {notification.order.product && (
                  <div className="mt-1 ">
                    Produit: {notification.order.product.name}
                  </div>
                )}
              </div>
            )}
            
            {notification.type === 'new_order' && (
              <div className="mt-3 flex space-x-2 ">
                <Button
                  onClick={handleViewOrder}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 "
                >
                  Voir la commande
                </Button>
                <Button
                  onClick={handleClose}
                  variant="outline"
                  size="sm"
                  className="text-xs px-3 py-1 "
                >
                  Fermer
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationToast; 