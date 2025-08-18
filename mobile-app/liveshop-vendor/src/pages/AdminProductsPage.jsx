import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { 
  Package, 
  Search, 
  Filter,
  Eye,
  Trash2,
  AlertTriangle,
  User,
  DollarSign,
  Calendar,
  Shield,
  X
} from 'lucide-react';
import apiService from '../services/api';

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeller, setFilterSeller] = useState('all');
  const [sellers, setSellers] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);

  useEffect(() => {
    loadProducts();
    loadSellers();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminProducts();
      console.log('Produits reçus:', response.data);
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSellers = async () => {
    try {
      const response = await apiService.getAdminSellers();
      setSellers(response.data.sellers);
    } catch (error) {
      console.error('Erreur lors du chargement des vendeurs:', error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    const product = products.find(p => p.id === productId);
    const productName = product?.name || `Produit ${productId}`;
    
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${productName}" ?`)) {
      try {
        console.log('🗑️ Suppression du produit:', productId);
        await apiService.deleteAdminProduct(productId);
        console.log('✅ Produit supprimé avec succès');
        loadProducts(); // Recharger la liste
      } catch (error) {
        console.error('❌ Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du produit');
      }
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeller = filterSeller === 'all' || product.seller_id?.toString() === filterSeller;
    
    return matchesSearch && matchesSeller;
  });

  const stats = {
    total: products.length,
    active: products.filter(p => p.is_active !== false).length,
    inactive: products.filter(p => p.is_active === false).length,
    totalValue: products.reduce((sum, p) => sum + ((parseInt(p.price) || 0) * (parseInt(p.stock_quantity) || 0)), 0)
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Modération des Produits</h1>
            <p className="text-green-100">Gestion et modération de tous les produits de la plateforme</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{products.length}</div>
            <p className="text-green-100 text-sm">produits total</p>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Actifs</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <Shield className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inactifs</p>
                <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Valeur totale</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.totalValue.toLocaleString()} FCFA
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={filterSeller}
              onChange={(e) => setFilterSeller(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="all">Tous les vendeurs</option>
              {sellers.map(seller => (
                <option key={seller.id} value={seller.id.toString()}>
                  {seller.name}
                </option>
              ))}
            </select>

            <Button onClick={loadProducts} variant="outline" className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Actualiser</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des produits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <span>Liste des produits ({filteredProducts.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Image du produit */}
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-semibold ${product.image_url ? 'hidden' : 'flex'}`}>
                      {product.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{product.name}</h3>
                        <Badge variant={product.is_active !== false ? "default" : "destructive"}>
                          {product.is_active !== false ? 'Actif' : 'Inactif'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{product.description}</p>
                      <p className="text-sm text-gray-500">
                        Vendeur: {product.seller?.name || product.Seller?.name || 'N/A'}
                      </p>
                      <div className="flex items-center space-x-4 mt-1">
                        <p className="text-sm font-medium text-green-600">
                          {product.price?.toLocaleString()} FCFA
                        </p>
                        <p className="text-sm text-gray-500">
                          Stock: {product.stock_quantity || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {new Date(product.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        ID: {product.id}
                      </p>
                    </div>

                    <button
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 flex items-center space-x-1"
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowProductModal(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                      <span>Détails</span>
                    </button>

                    <button
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 flex items-center space-x-1"
                      onClick={() => {
                        console.log('CLIC SUPPRIMER PRODUIT:', product.id);
                        handleDeleteProduct(product.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Supprimer</span>
                    </button>
                  </div>
                </div>

                {/* Catégories et tags */}
                {product.categories && product.categories.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium text-gray-700 mb-2">Catégories :</p>
                    <div className="flex flex-wrap gap-2">
                      {product.categories.map((category, index) => (
                        <Badge key={index} variant="outline">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal Détails Produit */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Détails du Produit</h3>
              <button 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                onClick={() => setShowProductModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Image et informations principales */}
              <div className="flex items-start space-x-6">
                {/* Image du produit */}
                {selectedProduct.image_url ? (
                  <img 
                    src={selectedProduct.image_url} 
                    alt={selectedProduct.name}
                    className="w-32 h-32 rounded-lg object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-semibold text-2xl ${selectedProduct.image_url ? 'hidden' : 'flex'}`}>
                  {selectedProduct.name.charAt(0).toUpperCase()}
                </div>
                
                <div className="flex-1">
                  <h4 className="text-2xl font-bold mb-2">{selectedProduct.name}</h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{selectedProduct.description}</p>
                  
                  <div className="flex items-center space-x-4">
                    <Badge variant={selectedProduct.is_active !== false ? "default" : "destructive"}>
                      {selectedProduct.is_active !== false ? 'Actif' : 'Inactif'}
                    </Badge>
                    <span className="text-2xl font-bold text-green-600">
                      {selectedProduct.price?.toLocaleString()} FCFA
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Informations détaillées */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h5 className="font-semibold mb-3 text-gray-700 dark:text-gray-300">Informations Générales</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">ID:</span>
                      <span className="font-medium">{selectedProduct.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Vendeur:</span>
                      <span className="font-medium">{selectedProduct.seller?.name || selectedProduct.Seller?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Stock:</span>
                      <span className="font-medium">{selectedProduct.stock_quantity || 0} unités</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Date création:</span>
                      <span className="font-medium">
                        {new Date(selectedProduct.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-semibold mb-3 text-gray-700 dark:text-gray-300">Statistiques</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Valeur stock:</span>
                      <span className="font-medium text-green-600">
                        {((selectedProduct.price || 0) * (selectedProduct.stock_quantity || 0)).toLocaleString()} FCFA
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Statut:</span>
                      <Badge variant={selectedProduct.is_active !== false ? "default" : "destructive"}>
                        {selectedProduct.is_active !== false ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Catégories */}
              {selectedProduct.categories && selectedProduct.categories.length > 0 && (
                <div>
                  <h5 className="font-semibold mb-3 text-gray-700 dark:text-gray-300">Catégories</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.categories.map((category, index) => (
                      <Badge key={index} variant="outline">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t">
                <button
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  onClick={() => setShowProductModal(false)}
                >
                  Fermer
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={() => {
                    handleDeleteProduct(selectedProduct.id);
                    setShowProductModal(false);
                  }}
                >
                  <Trash2 className="w-4 h-4 inline mr-2" />
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage; 