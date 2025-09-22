import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Star, 
  Package,
  Plus,
  Minus
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const MobileProductCard = ({ product, onOrder }) => {
  const { addToCart, items, updateQuantity } = useCart();
  
  // Vérifier si le produit est dans le panier
  const cartItem = items.find(item => item.id === product.id);
  const isInCart = !!cartItem;

  const handleAddToCart = () => {
    addToCart(product);
  };

  const handleUpdateQuantity = (newQuantity) => {
    updateQuantity(product.id, newQuantity);
  };

  return (
    <Card className="bg-white border-0 shadow-sm rounded-2xl overflow-hidden">
      <CardContent className="p-0">
        {/* Image du produit */}
        <div className="relative">
          {product.image_url ? (
            <div className="aspect-square bg-gray-100">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-square bg-gray-100 flex items-center justify-center">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
          )}

          {/* Badge épinglé */}
          {product.is_pinned && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg">
                <Star className="w-3 h-3 mr-1" />
                Épinglé
              </Badge>
            </div>
          )}

          {/* Badge stock */}
          <div className="absolute top-3 left-3">
            {product.stock_quantity > 0 ? (
              <Badge className="bg-green-500 text-white border-0">
                Stock: {product.stock_quantity}
              </Badge>
            ) : (
              <Badge className="bg-red-500 text-white border-0">
                Rupture
              </Badge>
            )}
          </div>
        </div>

        {/* Contenu du produit */}
        <div className="p-4">
          {/* Nom du produit */}
          <h3 className="font-semibold text-gray-900 text-base line-clamp-2 mb-2">
            {product.name}
          </h3>

          {/* Prix */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold text-blue-600">
              {product.price.toLocaleString()} FCFA
            </span>
          </div>

          {/* Description (optionnelle) */}
          {product.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {product.description}
            </p>
          )}

          {/* Actions */}
          <div className="space-y-2">
            {isInCart ? (
              /* Contrôles de quantité si dans le panier */
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateQuantity(cartItem.quantity - 1)}
                  className="w-8 h-8 p-0 rounded-full border-gray-200"
                >
                  <Minus className="w-3 h-3" />
                </Button>
                
                <span className="flex-1 text-center text-sm font-medium text-gray-700">
                  {cartItem.quantity} dans le panier
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateQuantity(cartItem.quantity + 1)}
                  className="w-8 h-8 p-0 rounded-full border-gray-200"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              /* Boutons d'action principaux */
              <div className="flex items-center gap-2">
                {/* Bouton commander (compact, bleu, sans icône) */}
                <Button
                  onClick={() => onOrder(product.id)}
                  disabled={product.stock_quantity === 0}
                  className={`flex-1 h-9 px-3 text-sm font-semibold rounded-lg ${
                    product.stock_quantity === 0 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                  }`}
                >
                  Commander
                </Button>

                {/* Icône panier seule */}
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity === 0}
                  variant="outline"
                  size="sm"
                  className={`${
                    product.stock_quantity === 0 
                      ? 'border-gray-300 text-gray-300 cursor-not-allowed' 
                      : 'border-blue-500 text-blue-600 hover:bg-blue-50 hover:border-blue-600'
                  } w-10 h-10 p-0 rounded-full flex items-center justify-center`}
                  aria-label="Ajouter au panier"
                >
                  <ShoppingCart className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileProductCard;
