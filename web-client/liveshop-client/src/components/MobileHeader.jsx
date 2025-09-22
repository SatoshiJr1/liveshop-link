import React from 'react';
import { useCart } from '../contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Share2, 
  MessageCircle,
  Menu,
  X
} from 'lucide-react';

const MobileHeader = ({ 
  seller, 
  onShare, 
  onToggleMenu, 
  isMenuOpen,
  realtimeStatus,
  onToggleCart
}) => {
  const { totalItems } = useCart();

  return (
    <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
      {/* Status bar spacer */}
      <div className="h-6 bg-gray-900"></div>
      
      {/* Header principal */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo et nom de la boutique */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-semibold text-gray-900 truncate">
                {seller?.name || 'Boutique'}
              </h1>
              <p className="text-xs text-gray-500">Commande en direct</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Indicateur temps réel */}
            <div className={`w-2 h-2 rounded-full ${
              realtimeStatus === 'active' ? 'bg-green-500 animate-pulse' :
              realtimeStatus === 'connecting' ? 'bg-yellow-500 animate-spin' :
              realtimeStatus === 'disconnected' ? 'bg-red-500' :
              'bg-gray-500'
            }`}></div>

            {/* Bouton partager */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onShare}
              className="w-9 h-9 p-0 text-gray-600 hover:text-gray-900"
            >
              <Share2 className="w-4 h-4" />
            </Button>

            {/* Bouton panier */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCart}
              className="w-9 h-9 p-0 text-gray-600 hover:text-gray-900 relative"
            >
              <ShoppingCart className="w-4 h-4" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-blue-500 text-white border-0">
                  {totalItems}
                </Badge>
              )}
            </Button>

            {/* Bouton commentaires */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = `/${window.location.pathname.split('/')[1]}/comments`}
              className="w-9 h-9 p-0 text-gray-600 hover:text-gray-900"
            >
              <MessageCircle className="w-4 h-4" />
            </Button>

            {/* Bouton menu */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleMenu}
              className="w-9 h-9 p-0 text-gray-600 hover:text-gray-900"
            >
              {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Devise */}
      <div className="px-4 pb-2">
        <p className="text-xs text-gray-500">Tous les prix en : XOF</p>
      </div>
    </div>
  );
};

export default MobileHeader;
