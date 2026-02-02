import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Star, MessageCircle, Heart, Share2, Eye, Package, Clock, X, Zap } from 'lucide-react';
import { getApiUrl, getPublicLink } from '../config/domains';
import realtimeService from '../services/realtimeService';
import CartModal from '../components/CartModal';
import MobileHeader from '../components/MobileHeader';
import MobileProductCard from '../components/MobileProductCard';
import { useCart } from '../contexts/CartContext';

const LiveProductsPageContent = () => {
  const { linkId, liveSlug } = useParams();
  const navigate = useNavigate();
  const { addToCart, items } = useCart();
  const [products, setProducts] = useState([]);
  const [seller, setSeller] = useState(null);
  const [live, setLive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState('connecting');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Configuration du WebSocket en temps réel
  const setupRealtime = useCallback(() => {
    try {
      // Se connecter au WebSocket
      realtimeService.connect();
      
      // Écouter les nouveaux produits
      realtimeService.onProductCreated((data) => {
        console.log('🆕 Nouveau produit reçu en temps réel:', data);
        
        // Vérifier que le produit appartient au bon vendeur
        if (data.seller_id === linkId) {
          setProducts(prev => [data.product, ...prev]);
          setRealtimeStatus('active');
          
          // Notification visuelle
          showRealtimeNotification('Nouveau produit ajouté !', 'success');
        }
      });

      // Écouter les produits modifiés
      realtimeService.onProductUpdated((data) => {
        console.log('✏️ Produit modifié en temps réel:', data);
        
        if (data.seller_id === linkId) {
          setProducts(prev => prev.map(p => 
            p.id === data.product.id ? data.product : p
          ));
          setRealtimeStatus('active');
          
          showRealtimeNotification('Produit mis à jour !', 'info');
        }
      });

      // Écouter les produits supprimés
      realtimeService.onProductDeleted((data) => {
        console.log('🗑️ Produit supprimé en temps réel:', data);
        
        if (data.seller_id === linkId) {
          const productId = parseInt(data.product_id);
          console.log('🔧 Suppression - ID reçu:', data.product_id, 'ID converti:', productId);
          
          setProducts(prev => {
            const filtered = prev.filter(p => parseInt(p.id) !== productId);
            console.log('🔧 Produits après suppression:', filtered.length, 'au lieu de', prev.length);
            return filtered;
          });
          setRealtimeStatus('active');
          
          showRealtimeNotification('Produit supprimé !', 'warning');
        }
      });

      // Écouter les produits épinglés
      realtimeService.onProductPinned((data) => {
        console.log('📌 Produit épinglé en temps réel:', data);
        
        if (data.seller_id === linkId) {
          const productId = parseInt(data.product_id);
          console.log('🔧 Épinglage - ID reçu:', data.product_id, 'ID converti:', productId);
          
          setProducts(prev => {
            const updated = prev.map(p => 
              parseInt(p.id) === productId ? { ...p, is_pinned: true } : p
            );
            return updated;
          });
          setRealtimeStatus('active');
          
          showRealtimeNotification('Produit épinglé !', 'info');
        }
      });

      // Gestion des événements de connexion
      realtimeService.onConnect(() => {
        console.log('🔗 WebSocket connecté');
        setRealtimeStatus('active');
      });

      realtimeService.onDisconnect(() => {
        console.log('🔌 WebSocket déconnecté');
        setRealtimeStatus('disconnected');
      });

      realtimeService.onError((error) => {
        console.error('❌ Erreur WebSocket:', error);
        setRealtimeStatus('error');
      });

    } catch (error) {
      console.error('❌ Erreur lors de la configuration du temps réel:', error);
      setRealtimeStatus('error');
    }
  }, [linkId]);

  // Fonction pour afficher les notifications
  const showRealtimeNotification = (message, type = 'info') => {
    // Créer une notification temporaire
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-white font-medium shadow-lg transform transition-all duration-300 ${
      type === 'success' ? 'bg-green-500' :
      type === 'error' ? 'bg-red-500' :
      type === 'warning' ? 'bg-yellow-500' :
      'bg-blue-500'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Supprimer après 3 secondes
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      notification.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  // Charger les données
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(getApiUrl(`/public/${linkId}/live/${liveSlug}`));
        const data = await response.json();
        
        if (response.ok) {
          setLive(data.live);
          setSeller(data.seller);
          setProducts(data.products || []);
          setRealtimeStatus('active');
        } else {
          setError(data.error || 'Erreur lors du chargement des produits du live.');
        }
      } catch (error) {
        console.error('Erreur fetch:', error);
        setError('Erreur lors du chargement des produits du live.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    setupRealtime();

    // Nettoyage à la fermeture
    return () => {
      realtimeService.disconnect();
    };
  }, [linkId, liveSlug, setupRealtime]);

  const handleOrderProduct = (productId) => {
    navigate(`/${linkId}/order/${productId}`);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    showRealtimeNotification(`${product.name} ajouté au panier !`, 'success');
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedProduct(null);
  };

  const shareLive = () => {
    const liveUrl = getPublicLink(linkId) + `/live/${liveSlug}`;
    if (navigator.share) {
      navigator.share({
        title: `Live de ${seller?.name}`,
        text: `Découvrez les produits en live !`,
        url: liveUrl
      });
    } else {
      navigator.clipboard.writeText(liveUrl);
    }
  };

  const handleToggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate(`/${linkId}/checkout`);
  };

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.is_pinned === (selectedCategory === 'live'));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-300 rounded-full animate-ping opacity-20"></div>
          </div>
          <div className="space-y-2">
            <p className="text-slate-600 font-medium">Chargement du live...</p>
            <div className="w-32 h-1 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md space-y-6">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
            <Package className="w-10 h-10 text-slate-400" />
          </div>
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold text-slate-800">Live non trouvé</h1>
            <p className="text-slate-600 leading-relaxed">{error}</p>
          </div>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-xl transition-all duration-300"
          >
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Espace pour le header fixe sur desktop */}
      <div className="hidden md:block h-24"></div>
      
      {/* Header mobile - visible seulement sur mobile */}
      <div className="md:hidden">
        <MobileHeader
          seller={seller}
          onShare={shareLive}
          onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
          isMenuOpen={isMenuOpen}
          realtimeStatus={realtimeStatus}
          onToggleCart={handleToggleCart}
          liveTitle={live?.title}
        />
      </div>

      {/* Header desktop - visible seulement sur desktop */}
      <header className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            {/* Logo et nom de la boutique */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span role="img" aria-label="shopping">🛍️</span>
                  {seller?.name}
                </h1>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  {live?.title || 'Produits en direct'}
                </p>
              </div>
            </div>
            
            {/* Actions à droite */}
            <div className="flex items-center space-x-4">
              {/* Bouton panier */}
              <Button 
                onClick={handleToggleCart}
                variant="outline" 
                size="sm"
                className="relative bg-blue-50/80 hover:bg-blue-100/80 border-blue-200/50 text-blue-700 hover:text-blue-800 px-4 py-2.5 backdrop-blur-sm"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Panier
                {items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-lg">
                    {items.length}
                  </span>
                )}
              </Button>
              
              {/* Bouton partager */}
              <Button 
                onClick={shareLive}
                variant="outline" 
                size="sm"
                className="bg-purple-50/80 hover:bg-purple-100/80 border-purple-200/50 text-purple-700 hover:text-purple-800 px-4 py-2.5 backdrop-blur-sm"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Partager
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Filtres mobile - visible seulement sur mobile */}
      <div className="md:hidden px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex gap-2">
          <Button
            onClick={() => setSelectedCategory('all')}
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            className={`flex-1 ${
              selectedCategory === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 border-gray-300'
            }`}
          >
            Tous ({products.length})
          </Button>
          <Button
            onClick={() => setSelectedCategory('live')}
            variant={selectedCategory === 'live' ? 'default' : 'outline'}
            size="sm"
            className={`flex-1 ${
              selectedCategory === 'live' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 border-gray-300'
            }`}
          >
            <Star className="w-4 h-4 mr-1" />
            Épinglés ({products.filter(p => p.is_pinned).length})
          </Button>
        </div>
      </div>

      {/* Filtres desktop - visible seulement sur desktop */}
      <div className="hidden md:block bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                onClick={() => setSelectedCategory('all')}
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                className={selectedCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border-gray-300'}
              >
                Tous les produits ({products.length})
              </Button>
              <Button
                onClick={() => setSelectedCategory('live')}
                variant={selectedCategory === 'live' ? 'default' : 'outline'}
                size="sm"
                className={selectedCategory === 'live' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border-gray-300'}
              >
                <Star className="w-4 h-4 mr-2" />
                Épinglés ({products.filter(p => p.is_pinned).length})
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-gray-400" />
          </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun produit trouvé</h3>
            <p className="text-gray-600">
              {selectedCategory === 'live' 
                ? 'Aucun produit épinglé pour le moment.' 
                : 'Aucun produit disponible pour ce live.'}
            </p>
          </div>
        ) : (
          <>
            {/* Version mobile - Grille 2 colonnes comme ProductsPage */}
            <div className="md:hidden grid grid-cols-2 gap-3">
              {filteredProducts.map((product) => (
                <MobileProductCard
                  key={product.id} 
                  product={product}
                  onOrder={() => handleOrderProduct(product.id)}
                />
              ))}
            </div>

            {/* Version desktop */}
            <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border-0 shadow-lg rounded-2xl overflow-hidden">
                  <div className="relative">
                    <div className="aspect-square bg-gray-100 overflow-hidden">
                      {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                    </div>
                  
                  {/* Badge Live */}
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      LIVE
                      </Badge>
                  </div>
                  
                  {/* Badge de stock */}
                    <div className="absolute bottom-3 left-3">
                  {product.stock_quantity > 0 ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200 px-3 py-1 rounded-full text-sm font-medium">
                        Stock: {product.stock_quantity}
                        </Badge>
                  ) : (
                        <Badge className="bg-red-100 text-red-700 border-red-200 px-3 py-1 rounded-full text-sm font-medium">
                        Rupture
                        </Badge>
                      )}
                    </div>
                </div>
                
                  <CardContent className="p-6">
                    <CardTitle className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                    </CardTitle>
                  
                  {product.description && (
                      <CardDescription className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {product.description}
                      </CardDescription>
                  )}
                  
                  <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-blue-600">
                      {product.price.toLocaleString()} FCFA
                    </span>
                  </div>
                  </CardContent>
                  
                  <CardFooter className="pt-4 space-x-2">
                                      <Button 
                      onClick={() => handleOrderProduct(product.id)}
                      className={`flex-1 h-11 text-sm font-semibold rounded-xl transition-all duration-300 ${
                        product.stock_quantity === 0
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg'
                      }`}
                      disabled={product.stock_quantity === 0}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      {product.stock_quantity === 0 ? 'Rupture' : 'Commander'}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock_quantity === 0}
                      className={`${
                        product.stock_quantity === 0
                          ? 'border-gray-300 text-gray-300 cursor-not-allowed'
                          : 'border-blue-500 text-blue-600 hover:bg-blue-50 hover:border-blue-600 hover:shadow-md'
                      } rounded-xl p-3 transition-all duration-300`}
                      aria-label="Ajouter au panier"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewProduct(product)}
                      className="border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md rounded-xl p-3 transition-all duration-300"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal d'image */}
      {showImageModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="relative">
              <img
                src={selectedProduct.image_url}
                alt={selectedProduct.name}
                className="w-full h-auto max-h-[60vh] object-cover"
              />
              <Button
                onClick={closeImageModal}
                className="absolute top-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-75 text-white"
                size="sm"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h3>
              {selectedProduct.description && (
                <p className="text-gray-600 mb-4">{selectedProduct.description}</p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-blue-600">
                  {selectedProduct.price.toLocaleString()} FCFA
                </span>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleAddToCart(selectedProduct)}
                    variant="outline"
                    className="border-blue-500 text-blue-600 hover:bg-blue-50"
                    >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Ajouter au panier
                  </Button>
                  <Button
                    onClick={() => {
                      closeImageModal();
                      handleOrderProduct(selectedProduct.id);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Commander
                  </Button>
                </div>
              </div>
            </div>
          </div>
          </div>
        )}

      {/* Modal du panier */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleCheckout}
      />
    </div>
  );
};

export default LiveProductsPageContent;