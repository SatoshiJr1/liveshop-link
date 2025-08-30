import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Star, MessageCircle, Heart, Share2, Eye, Package, Clock, Wifi, WifiOff } from 'lucide-react';
import { realtimeService } from '@/config/supabase';
import { getApiUrl, getPublicLink } from '../config/domains';
import { useRealtimeService } from '../services/realtimeService';

const ProductsPage = () => {
  const { linkId } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [realtimeStatus, setRealtimeStatus] = useState('disconnected');
  const [realtimeChannel, setRealtimeChannel] = useState(null);

  useEffect(() => {
    console.log('🚀 ProductsPage monté - linkId:', linkId);
    
    fetchProducts();
    setupRealtime();
    
    return () => {
      console.log('🧹 Nettoyage ProductsPage...');
      if (realtimeChannel) {
        realtimeService.unsubscribe(realtimeChannel);
      }
    };
  }, [linkId]);

  // Configuration du temps réel avec Supabase
  const setupRealtime = () => {
    console.log('🔧 Configuration du temps réel Supabase...');
    
    try {
      // S'abonner aux changements de produits
      const channel = realtimeService.subscribeToProducts((payload) => {
        console.log('🔄 Événement temps réel reçu:', payload);
        
        switch (payload.eventType) {
          case 'INSERT':
            handleProductCreated(payload.new);
            break;
          case 'UPDATE':
            handleProductUpdated(payload.new);
            break;
          case 'DELETE':
            handleProductDeleted(payload.old);
            break;
          default:
            console.log('📡 Événement non géré:', payload.eventType);
        }
      });
      
      setRealtimeChannel(channel);
      setRealtimeStatus('connected');
      console.log('✅ Temps réel Supabase configuré');
      alert('🔌 Temps réel Supabase connecté ! Les mises à jour seront instantanées.');
      
    } catch (error) {
      console.error('❌ Erreur configuration temps réel:', error);
      setRealtimeStatus('error');
    }
  };

  // Gestion des événements temps réel
  const handleProductCreated = (newProduct) => {
    console.log('🆕 Nouveau produit créé:', newProduct);
    setProducts(prev => [newProduct, ...prev]);
    alert(`🆕 Nouveau produit: ${newProduct.name}`);
  };

  const handleProductUpdated = (updatedProduct) => {
    console.log('✏️ Produit mis à jour:', updatedProduct);
    setProducts(prev => prev.map(product => 
      product.id === updatedProduct.id ? updatedProduct : product
    ));
    alert(`✏️ Produit mis à jour: ${updatedProduct.name}`);
  };

  const handleProductDeleted = (deletedProduct) => {
    console.log('🗑️ Produit supprimé:', deletedProduct);
    setProducts(prev => prev.filter(product => product.id !== deletedProduct.id));
    alert(`🗑️ Produit supprimé: ${deletedProduct.name}`);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/public/${linkId}/products`);
      
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
              {/* Indicateur temps réel */}
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200">
                {realtimeStatus === 'connected' ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-600 font-medium">Temps réel</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500 font-medium">Hors ligne</span>
                  </>
                )}
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
                : 'bg-white hover:bg-gray-50 border-orange-200 text-gray-700 hover:text-gray-900 rounded-xl px-8 py-3 font-medium'
              }
            >
              <Star className="w-4 h-4 mr-2" />
              En Live ({products.filter(p => p.is_pinned).length})
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
              {selectedCategory === 'live' ? 'Aucun produit en live' : 'Aucun produit disponible'}
            </h2>
            <p className="text-slate-600 max-w-md mx-auto leading-relaxed">
              {selectedCategory === 'live' 
                ? 'Aucun produit n\'est actuellement mis en avant en live.'
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
                {/* Badge Live */}
                {product.is_pinned && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="badge-live">
                      <Star className="w-3 h-3 mr-1" />
                      En Live
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
                    className="bg-white hover:bg-gray-50 border-gray-200 text-gray-600 hover:text-gray-700 rounded-xl p-3 transition-all duration-300"
                  >
                    <Heart className="w-4 h-4" />
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

      {/* Effet de particules subtiles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-blue-300 rounded-full animate-pulse opacity-20"></div>
        <div className="absolute top-1/3 right-1/4 w-0.5 h-0.5 bg-indigo-300 rounded-full animate-ping opacity-30"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-slate-300 rounded-full animate-bounce opacity-20 "></div>
      </div>
    </div>
    //*jhkuikhgyhtghhtyytu
  );
};

export default ProductsPage;

