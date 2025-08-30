import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Star, MessageCircle, Heart, Share2, Eye, Package, Clock } from 'lucide-react';
import { getPublicLink } from '../config/domains';

const ProductsPage = () => {
  const { linkId } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    console.log('🚀 ProductsPage monté - linkId:', linkId);
    fetchProducts();
  }, [linkId]);

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
              <Button 
                onClick={shareShop}
                variant="outline" 
                size="sm"
                className="bg-white/80 hover:bg-white backdrop-blur-sm border border-gray-200 text-gray-700 hover:text-gray-900 transition-all duration-200"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Partager
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Filtres de catégories */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <div className="flex justify-center space-x-2">
          {['all', 'live', 'regular'].map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="rounded-full px-6"
            >
              {category === 'all' && 'Tous les produits'}
              {category === 'live' && 'En live'}
              {category === 'regular' && 'Produits normaux'}
            </Button>
          ))}
        </div>
      </div>

      {/* Grille des produits */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="p-0">
                <div className="aspect-square bg-gray-100 relative overflow-hidden rounded-t-lg">
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {product.is_pinned && (
                    <Badge className="absolute top-3 right-3 bg-red-500 text-white">
                      🔴 EN LIVE
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="p-4">
                <CardTitle className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {product.name}
                </CardTitle>
                <CardDescription className="text-gray-600 mb-3 line-clamp-2">
                  {product.description}
                </CardDescription>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {product.price?.toLocaleString()} FCFA
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">4.5</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>Stock: {product.stock_quantity}</span>
                  <span>•</span>
                  <span>{new Date(product.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0">
                <div className="flex space-x-2 w-full">
                  <Button 
                    onClick={() => handleOrderProduct(product.id)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Commander
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">📦</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Aucun produit trouvé</h2>
            <p className="text-gray-600">Aucun produit ne correspond à cette catégorie.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage; 