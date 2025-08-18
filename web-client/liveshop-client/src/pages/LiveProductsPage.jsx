import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star, MessageCircle, Share2, ArrowLeft } from 'lucide-react';

export default function LiveProductsPage() {
  const { linkId, liveId } = useParams();
  const [products, setProducts] = useState([]);
  const [seller, setSeller] = useState(null);
  const [live, setLive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Récupère les infos du live et du vendeur
        const liveRes = await fetch(`http://localhost:3001/api/lives/${liveId}`);
        const liveData = await liveRes.json();
        setLive(liveData.live || liveData);
        // Récupère les produits associés au live
        const prodRes = await fetch(`http://localhost:3001/api/lives/${liveId}/products`);
        const prodData = await prodRes.json();
        setProducts(Array.isArray(prodData) ? prodData : (prodData.products || []));
        // Récupère le vendeur par public_link_id
        const sellerRes = await fetch(`http://localhost:3001/api/public/sellers/${linkId}`);
        const sellerData = await sellerRes.json();
        setSeller(sellerData.seller || sellerData);
      } catch {
        setError('Erreur lors du chargement des produits du live.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [linkId, liveId]);

  const shareLive = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `Live de ${seller?.name}`,
        text: `Découvrez les produits en live !`,
        url
      });
    } else {
      navigator.clipboard.writeText(url);
      // TODO: toast
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header moderne sans gradient */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => navigate(`/${linkId}`)}
                variant="ghost" 
                size="sm"
                className="text-gray-600 hover:bg-gray-100 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              <div className="h-8 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {seller?.name}
                </h1>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  {live?.title || 'Produits en direct'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={shareLive}
                variant="outline" 
                size="sm"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Partager
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal avec design moderne */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-6"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-pink-600 rounded-full animate-spin mx-auto" style={{animationDelay: '-0.5s'}}></div>
            </div>
            <p className="text-gray-600 font-medium">Chargement des produits...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">😕</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">{error}</h2>
            <p className="text-gray-600">Une erreur s'est produite lors du chargement.</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">📦</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Aucun produit pour ce live</h2>
            <p className="text-gray-600">Aucun produit n'est disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <div 
                key={product.id} 
                className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden transform hover:-translate-y-1 border border-gray-100"
              >
                {/* Image du produit */}
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {/* Overlay gradient au hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Badge Live */}
                  <div className="absolute top-4 right-4">
                    <span className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-full font-semibold flex items-center gap-2 shadow-sm">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      LIVE
                    </span>
                  </div>
                  
                  {/* Badge de stock */}
                  {product.stock_quantity > 0 ? (
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                        Stock: {product.stock_quantity}
                      </span>
                    </div>
                  ) : (
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                        Rupture
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Informations produit avec design moderne */}
                <div className="p-6">
                  <h3 className="font-bold text-gray-900 mb-3 text-lg line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                    {product.name}
                  </h3>
                  
                  {product.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  
                  {/* Prix avec design moderne */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-gray-900">
                      {product.price.toLocaleString()} FCFA
                    </span>
                  </div>
                  
                  {/* Bouton Commander avec gradient */}
                                      <Button 
                      onClick={() => navigate(`/${linkId}/order/${product.id}`)}
                      className={`w-full px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 transform hover:scale-105 ${
                        product.stock_quantity > 0 
                          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={product.stock_quantity === 0}
                    >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {product.stock_quantity === 0 ? 'Indisponible' : 'Commander'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 