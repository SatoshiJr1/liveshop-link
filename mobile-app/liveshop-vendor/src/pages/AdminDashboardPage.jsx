import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Eye,
  Trash2, 
  Search, 
  Filter,
  X,
  Shield,
  Activity,
  Settings,
  BarChart3,
  UserCheck,
  XCircle,
  Pause,
  Play,
  Tag
} from 'lucide-react';
import apiService from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

const AdminDashboardPage = () => {
  const { seller } = useAuth();
  
  const [dashboardData, setDashboardData] = useState({
    totalSellers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [sellers, setSellers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [sellerProducts, setSellerProducts] = useState([]);

  // États pour les modals
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [dashboardResponse, sellersResponse, ordersResponse, productsResponse] = await Promise.all([
        apiService.getAdminDashboard(),
        apiService.getAdminSellers(),
        apiService.getAdminOrders(),
        apiService.getAdminProducts()
      ]);

      setDashboardData(dashboardResponse.data);
      setSellers(sellersResponse.data.sellers);
      setOrders(ordersResponse.data.orders);
      setProducts(productsResponse.data.products);
    } catch (error) {
      console.error('Erreur lors du chargement des données admin:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSellerDetails = async (sellerId) => {
    try {
      const [ordersResponse, productsResponse] = await Promise.all([
        apiService.getSellerOrders(sellerId),
        apiService.getSellerProducts(sellerId)
      ]);
      setSellerOrders(ordersResponse.data.orders || []);
      setSellerProducts(productsResponse.data.products || []);
    } catch (error) {
      console.error('Erreur lors du chargement des détails vendeur:', error);
    }
  };

  const handleSellerAction = async (sellerId, action) => {
    try {
      switch (action) {
        case 'suspend':
          await apiService.suspendSeller(sellerId);
          break;
        case 'activate':
          await apiService.activateSeller(sellerId);
          break;
        case 'view':
          const seller = sellers.find(s => s.id === sellerId);
          setSelectedSeller(seller);
          await loadSellerDetails(sellerId);
          break;
      }
      await loadAdminData(); // Recharger les données
    } catch (error) {
      console.error('Erreur lors de l\'action sur le vendeur:', error);
    }
  };

  const handleProductAction = (productId, action) => {
    alert(`Action ${action} sur produit ${productId}`);
    
    if (action === 'view') {
      const product = products.find(p => p.id === productId);
      setSelectedProduct(product);
      setShowProductModal(true);
    }
  };

  const handleOrderAction = (orderId, action) => {
    alert(`Action ${action} sur commande ${orderId}`);
    
    if (action === 'view') {
      const order = orders.find(o => o.id === orderId);
      setSelectedOrder(order);
      setShowOrderModal(true);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'superadmin': return 'bg-purple-500 text-white';
      case 'admin': return 'bg-blue-500 text-white';
      case 'seller': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header moderne */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Tableau de bord Super Admin
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Bienvenue, {seller?.name || 'Super Admin'}
            </p>
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-500 to-blue-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Vendeurs</p>
                  <p className="text-2xl font-bold text-white">{dashboardData.overview?.totalSellers || 0}</p>
                </div>
                <Users className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-500 to-green-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Produits</p>
                  <p className="text-2xl font-bold text-white">{dashboardData.overview?.totalProducts || 0}</p>
                </div>
                <Package className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-500 to-orange-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Commandes</p>
                  <p className="text-2xl font-bold text-white">{dashboardData.overview?.totalOrders || 0}</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-500 to-purple-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Revenus (FCFA)</p>
                  <p className="text-2xl font-bold text-white">
                    {(dashboardData.overview?.totalRevenue || 0).toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Onglets principaux */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-gray-800">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Vue d'ensemble</span>
          </TabsTrigger>
          <TabsTrigger value="sellers" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Gestion Vendeurs</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center space-x-2">
            <ShoppingCart className="w-4 h-4" />
            <span>Commandes</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center space-x-2">
            <Package className="w-4 h-4" />
            <span>Produits</span>
          </TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activité récente */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Activité récente</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Vendeurs actifs</span>
                  <Badge variant="secondary">{dashboardData?.overview?.activeSellers || 0}</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Commandes aujourd'hui</span>
                  <Badge variant="secondary">{dashboardData?.overview?.todayOrders || 0}</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Revenus du jour</span>
                  <Badge variant="secondary">
                    {(dashboardData?.overview?.todayRevenue || 0).toLocaleString()} FCFA
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Actions rapides</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => setActiveTab('sellers')}
                  className="w-full justify-start" 
                  variant="outline"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Gérer les vendeurs
                </Button>
                <Button 
                  onClick={() => setActiveTab('orders')}
                  className="w-full justify-start" 
                  variant="outline"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Suivre les commandes
                </Button>
                <Button 
                  onClick={() => setActiveTab('products')}
                  className="w-full justify-start" 
                  variant="outline"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Modérer les produits
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Gestion des vendeurs */}
        <TabsContent value="sellers" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                  <span>Gestion des vendeurs ({sellers.length})</span>
              </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Search className="w-4 h-4 mr-2" />
                    Rechercher
                  </Button>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtrer
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sellers.map((seller) => (
                  <div key={seller.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {seller.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{seller.name}</p>
                        <p className="text-sm text-gray-500">{seller.phone_number}</p>
                        <p className="text-xs text-gray-400">ID: {seller.public_link_id}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getRoleColor(seller.role)}>
                        {seller.role}
                      </Badge>
                      <Badge className={getStatusColor(seller.is_active)}>
                        {seller.is_active ? 'Actif' : 'Inactif'}
                      </Badge>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{seller.credit_balance} crédits</p>
                        <p className="text-xs text-gray-500">
                          {new Date(seller.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          onClick={() => handleSellerAction(seller.id, 'view')}
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {seller.is_active ? (
                          <Button
                            onClick={() => handleSellerAction(seller.id, 'suspend')}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Pause className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleSellerAction(seller.id, 'activate')}
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700"
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Détails du vendeur sélectionné */}
          {selectedSeller && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <UserCheck className="w-5 h-5" />
                    <span>Détails de {selectedSeller.name}</span>
                </CardTitle>
                  <Button
                    onClick={() => setSelectedSeller(null)}
                    variant="ghost"
                    size="sm"
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="orders" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="orders">Commandes ({sellerOrders.length})</TabsTrigger>
                    <TabsTrigger value="products">Produits ({sellerProducts.length})</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="orders" className="space-y-4">
                    {sellerOrders.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        Aucune commande pour ce vendeur
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {sellerOrders.slice(0, 10).map((order) => (
                          <div key={order.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">#{order.id}</p>
                              <p className="text-sm text-gray-500">{order.customer_name}</p>
                              <p className="text-xs text-gray-400">
                                {new Date(order.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge className={getOrderStatusColor(order.status)}>
                                {order.status}
                              </Badge>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                                {order.total_price?.toLocaleString()} FCFA
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="products" className="space-y-4">
                    {sellerProducts.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        Aucun produit pour ce vendeur
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {sellerProducts.slice(0, 10).map((product) => (
                          <div key={product.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                              <p className="text-sm text-gray-500">{product.description}</p>
                              <p className="text-xs text-gray-400">Prix: {product.price?.toLocaleString()} FCFA</p>
                            </div>
                            <div className="text-right">
                              <Badge variant={product.is_active ? "default" : "secondary"}>
                                {product.is_active ? 'Actif' : 'Inactif'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Commandes */}
        <TabsContent value="orders" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5" />
                  <span>Suivi des commandes ({orders.length})</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Search className="w-4 h-4 mr-2" />
                    Rechercher
                  </Button>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtrer
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Aucune commande trouvée
                  </div>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-semibold">
                          #{order.id}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{order.customer_name}</p>
                          <p className="text-sm text-gray-500">{order.customer_phone}</p>
                          <p className="text-xs text-gray-400">
                            Vendeur: {order.seller?.name || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-400">
                            Produit: {order.product?.name || 'N/A'} | Qté: {order.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={getOrderStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {order.total_price?.toLocaleString()} FCFA
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <button 
                          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                          onClick={() => {
                            console.log('CLIC COMMANDE:', order.id);
                            alert(`CLIC sur commande ${order.id}`);
                            handleOrderAction(order.id, 'view');
                          }}
                        >
                          👁️ Détails
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Produits */}
        <TabsContent value="products" className="space-y-6">
          <Card className="border-0 shadow-sm">
              <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Package className="w-5 h-5" />
                  <span>Modération des produits ({products.length})</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Search className="w-4 h-4 mr-2" />
                    Rechercher
                  </Button>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtrer
                  </Button>
                </div>
              </div>
              </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {products.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Aucun produit trouvé
                  </div>
                ) : (
                  products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-center space-x-4">
                        {/* Image du produit ou avatar avec lettre */}
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
                        <div className={`w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold ${product.image_url ? 'hidden' : 'flex'}`}>
                          {product.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.description}</p>
                          <p className="text-xs text-gray-400">
                            Vendeur: {product.seller?.name || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-400">
                            Stock: {product.stock_quantity || 0} | Catégorie: {product.category || 'Général'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={product.status === 'active' ? "default" : "secondary"}>
                          {product.status === 'active' ? 'Actif' : 'Inactif'}
                        </Badge>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {product.price?.toLocaleString()} FCFA
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(product.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button 
                            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                            onClick={() => {
                              console.log('CLIC PRODUIT:', product.id);
                              alert(`CLIC sur produit ${product.id}`);
                              handleProductAction(product.id, 'view');
                            }}
                          >
                            👁️ Détails
                          </button>
                          <button 
                            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                            onClick={() => {
                              console.log('CLIC SUPPRIMER:', product.id);
                              alert(`SUPPRIMER produit ${product.id}`);
                              handleProductAction(product.id, 'delete');
                            }}
                          >
                            🗑️ Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Détails du Produit</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowProductModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                {selectedProduct.image_url ? (
                  <img 
                    src={selectedProduct.image_url} 
                    alt={selectedProduct.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold">
                    {selectedProduct.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedProduct.name}</p>
                  <p className="text-sm text-gray-500">{selectedProduct.description}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-300">Prix:</p>
                  <p className="text-gray-600 dark:text-gray-400">{selectedProduct.price?.toLocaleString()} FCFA</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-300">Stock:</p>
                  <p className="text-gray-600 dark:text-gray-400">{selectedProduct.stock_quantity || 0}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-300">Catégorie:</p>
                  <p className="text-gray-600 dark:text-gray-400">{selectedProduct.category || 'Général'}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-300">Statut:</p>
                  <Badge variant={selectedProduct.status === 'active' ? "default" : "secondary"}>
                    {selectedProduct.status === 'active' ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-300">Vendeur:</p>
                  <p className="text-gray-600 dark:text-gray-400">{selectedProduct.seller?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-300">Date création:</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {new Date(selectedProduct.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowProductModal(false)}
                  className="flex-1"
                >
                  Fermer
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    handleProductAction(selectedProduct.id, 'delete');
                    setShowProductModal(false);
                  }}
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Détails de la Commande #{selectedOrder.id}</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowOrderModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-300">Client:</p>
                  <p className="text-gray-600 dark:text-gray-400">{selectedOrder.customer_name}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-300">Téléphone:</p>
                  <p className="text-gray-600 dark:text-gray-400">{selectedOrder.customer_phone}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-300">Vendeur:</p>
                  <p className="text-gray-600 dark:text-gray-400">{selectedOrder.seller?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-300">Statut:</p>
                  <Badge className={getOrderStatusColor(selectedOrder.status)}>
                    {selectedOrder.status}
                  </Badge>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-300">Prix Total:</p>
                  <p className="text-lg font-bold text-green-600">{selectedOrder.total_price?.toLocaleString()} FCFA</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-300">Date:</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {new Date(selectedOrder.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Produits commandés:</p>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{selectedOrder.product?.name || 'Produit non spécifié'}</p>
                      <p className="text-sm text-gray-500">Quantité: {selectedOrder.quantity}</p>
                    </div>
                    <p className="font-semibold">{selectedOrder.total_price?.toLocaleString()} FCFA</p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowOrderModal(false)}
                  className="flex-1"
                >
                  Fermer
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    handleOrderAction(selectedOrder.id, 'update_status');
                    setShowOrderModal(false);
                  }}
                  className="flex-1"
                >
                  <Tag className="w-4 h-4 mr-2" />
                  Mettre à jour
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    handleOrderAction(selectedOrder.id, 'delete');
                    setShowOrderModal(false);
                  }}
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage; 