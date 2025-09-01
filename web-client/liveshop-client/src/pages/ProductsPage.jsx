  import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Star, MessageCircle, Heart, Share2, Eye, Package, Clock, X } from 'lucide-react';
import { getPublicLink } from '../config/domains';
import realtimeService from '../services/realtimeService';

const ProductsPage = () => {
  const { linkId } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState('connecting');

  useEffect(() => {
    console.log('🚀 ProductsPage monté - linkId:', linkId);
    fetchProducts();
    setupRealtime();
    
    return () => {
      // Nettoyer les écouteurs WebSocket
      realtimeService.removeAllListeners();
    };
  }, [linkId]);

  // Configuration du WebSocket en temps réel
  const setupRealtime = () => {
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
          // 🔧 CORRECTION : Convertir en nombre pour la comparaison
          const productId = parseInt(data.product_id);
          console.log('🔧 Suppression - ID reçu:', data.product_id, 'ID converti:', productId);
          
          setProducts(prev => {
            console.log('🔍 DEBUG - IDs des produits dans létat local:', prev.map(p => ({ id: p.id, name: p.name, type: typeof p.id })));
            console.log('🔍 DEBUG - Produit à supprimer:', productId, 'type:', typeof productId);
            
            // 🔧 CORRECTION : Comparer en convertissant les deux IDs en nombres
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
          // 🔧 CORRECTION : Convertir en nombre pour la comparaison
          const productId = parseInt(data.product_id);
          console.log('🔧 Épinglage - ID reçu:', data.product_id, 'ID converti:', productId);
          
          setProducts(prev => {
            console.log('🔍 DEBUG - IDs des produits dans létat local:', prev.map(p => ({ id: p.id, name: p.name, type: typeof p.id })));
            console.log('🔍 DEBUG - Produit à épingler:', productId, 'type:', typeof productId);
            
            // 🔧 CORRECTION : Comparer en convertissant les deux IDs en nombres
            const updated = prev.map(p => 
              parseInt(p.id) === productId ? { ...p, is_pinned: data.is_pinned } : p
            );
            console.log('🔧 Produits après épinglage:', updated.length);
            return updated;
          });
          setRealtimeStatus('active');
          
          const action = data.is_pinned ? 'épinglé' : 'désépinglé';
          showRealtimeNotification(`Produit ${action} !`, 'info');
        }
      });

      // Vérifier le statut de connexion
      const checkConnection = setInterval(() => {
        const status = realtimeService.getConnectionStatus();
        setRealtimeStatus(status.isConnected ? 'active' : 'disconnected');
        
        if (status.isConnected) {
          clearInterval(checkConnection);
        }
      }, 1000);

    } catch (error) {
      console.error('❌ Erreur configuration WebSocket:', error);
      setRealtimeStatus('error');
    }
  };

  // Afficher une notification en temps réel
  const showRealtimeNotification = (message, type = 'info') => {
    // Créer une notification temporaire
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
      type === 'success' ? 'bg-green-500 text-white' :
      type === 'warning' ? 'bg-yellow-500 text-white' :
      type === 'error' ? 'bg-red-500 text-white' :
      'bg-blue-500 text-white'
    }`;
    notification.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium">${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-white hover:text-gray-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Supprimer automatiquement après 3 secondes
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 3000);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const apiUrl = window.location.hostname.includes('livelink.store') 
        ? `https://api.livelink.store/api/public/${linkId}/products`
        : `http://localhost:3001/api/public/${linkId}/products`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('Vendeur non trouvé');
      }
      
      const data = await response.json();
      setProducts(data.products);
      setSeller(data.seller);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderProduct = (productId) => {
    navigate(`/${linkId}/order/${productId}`);
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedProduct(null);
  };

  const shareShop = () => {
    const shopUrl = getPublicLink(linkId);
    if (navigator.share) {
      navigator.share({
        title: `Boutique de ${seller?.name}`,
        text: `Découvrez les produits de ${seller?.name} en direct !`,
        url: shopUrl
      });
    } else {
      navigator.clipboard.writeText(shopUrl);
    }
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
            <p className="text-slate-600 font-medium">Chargement de la boutique...</p>
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
            <h1 className="text-2xl font-semibold text-slate-800">Boutique non trouvée</h1>
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
      {/* Header moderne et épuré */}
      <header className="header">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <h1 className="header-title flex items-center gap-2">
                  <span role="img" aria-label="shopping">🛍️</span>
                  {seller?.name}
                </h1>
              </div>
              <p className="header-desc">
                Découvrez nos produits et commandez en toute simplicité
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {/* Indicateur de temps réel */}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm ${
                realtimeStatus === 'active' ? 'bg-green-100 text-green-700' :
                realtimeStatus === 'connecting' ? 'bg-yellow-100 text-yellow-700' :
                realtimeStatus === 'disconnected' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  realtimeStatus === 'active' ? 'bg-green-500 animate-pulse' :
                  realtimeStatus === 'connecting' ? 'bg-yellow-500 animate-spin' :
                  realtimeStatus === 'disconnected' ? 'bg-red-500' :
                  'bg-gray-500'
                }`}></div>
                <span>
                  {realtimeStatus === 'active' ? 'Temps réel actif' :
                   realtimeStatus === 'connecting' ? 'Connexion...' :
                   realtimeStatus === 'disconnected' ? 'Déconnecté' :
                   'Erreur'}
                </span>
              </div>
              
              <Button 
                onClick={shareShop}
                variant="outline" 
                size="sm"
                className="header-share"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Partager
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Filtres avec design moderne */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-center space-x-3">
          <Button
            onClick={() => setSelectedCategory('all')}
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="lg"
            className={selectedCategory === 'all' 
              ? 'bg-gray-800 hover:bg-gray-900 text-white rounded-xl px-8 py-3 font-medium' 
              : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700 hover:text-gray-900 rounded-xl px-8 py-3 font-medium'
            }
          >
            Tous les produits ({products.length})
          </Button>
          <Button
            onClick={() => setSelectedCategory('live')}
            variant={selectedCategory === 'live' ? 'default' : 'outline'}
            size="lg"
            className={selectedCategory === 'live' 
              ? 'bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-8 py-3 font-medium' 
              : 'bg-white hover:bg-orange-50 border-orange-200 text-gray-700 hover:text-gray-900 rounded-xl px-8 py-3 font-medium'
            }
          >
            <Star className="w-4 h-4 mr-2" />
            ⭐ Épinglés ({products.filter(p => p.is_pinned).length})
          </Button>
        </div>
      </div>

      {/* Grille de produits */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-slate-400" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-800 mb-3">
              {selectedCategory === 'live' ? 'Aucun produit épinglé' : 'Aucun produit disponible'}
            </h2>
            <p className="text-slate-600 max-w-md mx-auto leading-relaxed">
              {selectedCategory === 'live' 
                ? 'Aucun produit n\'est actuellement mis en avant.'
                : 'Le vendeur n\'a pas encore ajouté de produits.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product, index) => (
              <Card 
                key={product.id} 
                className="card group overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Badge Épinglé */}
                {product.is_pinned && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="badge-pinned bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg">
                      <Star className="w-3 h-3 mr-1" />
                      ⭐ Épinglé
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="pb-4">
                  {/* Image du produit */}
                  {product.image_url ? (
                    <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-blue-100 mb-4 relative">
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  ) : (
                    <div className="aspect-square rounded-2xl bg-gradient-to-br from-slate-100 to-blue-100 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
                      <Package className="w-16 h-16 text-slate-400" />
                    </div>
                  )}
                  
                  {/* Titre et prix */}
                  <CardTitle className="card-title line-clamp-2 group-hover:text-blue-600 transition-colors duration-200 leading-tight">
                    {product.name}
                  </CardTitle>
                  
                  <div className="flex items-center justify-between mt-4">
                    <span className="card-price">
                      {product.price.toLocaleString()} FCFA
                    </span>
                    {product.stock_quantity > 0 ? (
                      <Badge className="card-stock">
                        <span role="img" aria-label="stock">✅</span> Stock: {product.stock_quantity}
                      </Badge>
                    ) : (
                      <Badge className="card-rupture">
                        <span role="img" aria-label="rupture">❌</span> Rupture
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                {/* Description */}
                {product.description && (
                  <CardContent className="pt-0">
                    <CardDescription className="line-clamp-3 text-gray-600 leading-relaxed">
                      {product.description}
                    </CardDescription>
                  </CardContent>
                )}
                
                {/* Actions */}
                <CardFooter className="pt-4 space-x-3">
                  <Button 
                    onClick={() => handleOrderProduct(product.id)}
                    className={`btn-primary flex-1 ${product.stock_quantity === 0 ? 'bg-gray-400 cursor-not-allowed' : ''}`}
                    disabled={product.stock_quantity === 0}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2 animate-bounce" />
                    {product.stock_quantity === 0 ? 'Rupture' : 'Commander'}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewProduct(product)}
                    className="bg-white hover:bg-gray-50 border-gray-200 text-gray-600 hover:text-gray-700 rounded-xl p-3 transition-all duration-300"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Widget de commentaires flottant */}
      <div className="fixed bottom-8 right-8 z-20">
        <Button 
          onClick={() => navigate(`/${linkId}/comments`)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl p-4 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>

      {/* Modal de visualisation des photos */}
      {showImageModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Header de la modal */}
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                {selectedProduct.name}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeImageModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Contenu de la modal */}
            <div className="p-6">
              {/* Image principale */}
              {selectedProduct.image_url ? (
                <div className="mb-6">
                  <img
                    src={selectedProduct.image_url}
                    alt={selectedProduct.name}
                    className="w-full h-96 object-cover rounded-xl"
                  />
                </div>
              ) : (
                <div className="w-full h-96 bg-gray-100 rounded-xl flex items-center justify-center mb-6">
                  <Package className="w-24 h-24 text-gray-400" />
                </div>
              )}
              
              {/* Informations du produit */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {selectedProduct.name}
                  </h4>
                  <p className="text-gray-600">
                    {selectedProduct.description || 'Aucune description disponible'}
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600">
                    {selectedProduct.price?.toLocaleString()} FCFA
                  </span>
                  <span className="text-sm text-gray-500">
                    Stock: {selectedProduct.stock_quantity}
                  </span>
                </div>
                
                {selectedProduct.is_pinned && (
                  <Badge className="bg-orange-500 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    ⭐ Épinglé
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Footer de la modal */}
            <div className="flex space-x-3 p-6 border-t bg-gray-50">
              <Button
                onClick={() => {
                  closeImageModal();
                  handleOrderProduct(selectedProduct.id);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={selectedProduct.stock_quantity === 0}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Commander maintenant
              </Button>
              <Button
                variant="outline"
                onClick={closeImageModal}
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Effet de particules subtiles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-blue-300 rounded-full animate-pulse opacity-20"></div>
        <div className="absolute top-1/3 right-1/4 w-0.5 h-0.5 bg-indigo-300 rounded-full animate-ping opacity-30"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-slate-300 rounded-full animate-bounce opacity-20"></div>
      </div>
    </div>
  );
};

export default ProductsPage; 