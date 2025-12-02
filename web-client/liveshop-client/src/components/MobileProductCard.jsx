import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Star, 
  Package,
  Plus,
  Minus,
  Maximize2,
  Info,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import ImageLightbox from './ImageLightbox';

const MobileProductCard = ({ product, onOrder }) => {
  const { addToCart, items, updateQuantity } = useCart();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [showAttributes, setShowAttributes] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Vérifier si le produit est dans le panier
  const cartItem = items.find(item => item.id === product.id);
  const isInCart = !!cartItem;

  // Construire le tableau d'images du produit
  const productImages = useMemo(() => {
    const imgs = [];
    
    // Ajouter les images du tableau images si disponible
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      product.images.forEach(img => {
        const url = typeof img === 'string' ? img : img.url || img.optimizedUrl || img.thumbnailUrl;
        if (url) imgs.push(url);
      });
    }
    
    // Fallback sur image_url si pas d'images multiples
    if (imgs.length === 0 && product.image_url) {
      imgs.push(product.image_url);
    }
    
    return imgs;
  }, [product.images, product.image_url]);

  const hasMultipleImages = productImages.length > 1;

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => prev === 0 ? productImages.length - 1 : prev - 1);
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => prev === productImages.length - 1 ? 0 : prev + 1);
  };

  const handleAddToCart = () => {
    addToCart(product);
  };

  const handleUpdateQuantity = (newQuantity) => {
    updateQuantity(product.id, newQuantity);
  };

  // Extraire et formater les attributs
  const getProductAttributes = () => {
    if (!product.attributes) return [];
    
    try {
      const attrs = typeof product.attributes === 'string' 
        ? JSON.parse(product.attributes) 
        : product.attributes;
      
      if (!attrs || typeof attrs !== 'object') return [];
      
      // S'assurer que chaque valeur est une string
      return Object.entries(attrs)
        .filter(([key, value]) => value && typeof value !== 'object')
        .map(([key, value]) => [key, String(value)]);
    } catch (e) {
      console.error('Erreur parsing attributs:', e);
      return [];
    }
  };

  const attributes = getProductAttributes();
  const hasAttributes = attributes.length > 0;

  // Helper pour les couleurs d'attributs
  const getAttributeColor = (key) => {
    const colorMap = {
      size: 'bg-blue-100 text-blue-700',
      taille: 'bg-blue-100 text-blue-700',
      color: 'bg-purple-100 text-purple-700',
      couleur: 'bg-purple-100 text-purple-700',
      material: 'bg-green-100 text-green-700',
      matériel: 'bg-green-100 text-green-700',
      weight: 'bg-orange-100 text-orange-700',
      poids: 'bg-orange-100 text-orange-700'
    };
    return colorMap[key.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  const formatAttributeKey = (key) => {
    const keyMap = {
      size: 'Taille',
      color: 'Couleur',
      material: 'Matériel',
      weight: 'Poids'
    };
    return keyMap[key.toLowerCase()] || key.charAt(0).toUpperCase() + key.slice(1);
  };

  return (
    <>
    <Card className="bg-white border-0 shadow-sm rounded-2xl overflow-hidden">
      <CardContent className="p-0">
        {/* Image du produit avec galerie */}
        <div className="relative group">
          {productImages.length > 0 ? (
            <div 
              className="aspect-square bg-gray-100 cursor-pointer relative overflow-hidden"
              onClick={() => setLightboxOpen(true)}
            >
              <img
                src={productImages[currentImageIndex]}
                alt={`${product.name} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {/* Overlay hover avec icône zoom */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                <Maximize2 className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Flèches de navigation si plusieurs images */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Points indicateurs si plusieurs images */}
              {hasMultipleImages && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {productImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(index);
                      }}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex 
                          ? 'bg-white scale-125' 
                          : 'bg-white/50 hover:bg-white/80'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Badge nombre d'images */}
              {hasMultipleImages && (
                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                  {currentImageIndex + 1}/{productImages.length}
                </div>
              )}
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

          {/* Attributs du produit - UX optimisée mobile */}
          {hasAttributes && (
            <div className="mb-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                {attributes.slice(0, showAttributes ? attributes.length : 3).map(([key, value]) => (
                  <span 
                    key={key}
                    className={`${getAttributeColor(key)} text-xs px-2 py-0.5 rounded-full inline-flex items-center`}
                  >
                    {String(value)}
                  </span>
                ))}
                
                {attributes.length > 3 && !showAttributes && (
                  <button
                    onClick={() => setShowAttributes(true)}
                    className="text-xs text-gray-500 hover:text-blue-600 px-1"
                  >
                    +{attributes.length - 3}
                  </button>
                )}
              </div>
            </div>
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

    {/* Lightbox pour visualiser les images */}
    <ImageLightbox
      imageUrl={product.image_url}
      images={productImages}
      productName={product.name}
      isOpen={lightboxOpen}
      onClose={() => setLightboxOpen(false)}
      initialIndex={currentImageIndex}
    />
    </>
  );
};

export default MobileProductCard;
