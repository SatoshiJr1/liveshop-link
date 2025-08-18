import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { 
  Users, 
  Search, 
  Filter, 
  Eye,
  Play, 
  Pause, 
  MoreHorizontal,
  Calendar,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  ShoppingCart,
  Package,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const AdminSellersPage = () => {
  const { seller } = useAuth();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [sellerDetails, setSellerDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [sellersRevenue, setSellersRevenue] = useState({});

  useEffect(() => {
    loadSellers();
  }, []);

  const loadSellers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminSellers();
      const sellersData = response.data.sellers;
      setSellers(sellersData);
      
      // Charger les chiffres d'affaires pour tous les vendeurs
      const revenueData = {};
      for (const seller of sellersData) {
        try {
          const ordersResponse = await apiService.getSellerOrders(seller.id);
          const orders = ordersResponse.data.orders || [];
          revenueData[seller.id] = calculateRevenueStats(orders);
        } catch (error) {
          console.error(`Erreur lors du chargement des commandes pour ${seller.name}:`, error);
          revenueData[seller.id] = {
            totalRevenue: 0,
            paidRevenue: 0,
            deliveredRevenue: 0,
            paidOrdersCount: 0,
            deliveredOrdersCount: 0,
            totalOrdersCount: 0
          };
        }
      }
      setSellersRevenue(revenueData);
    } catch (error) {
      console.error('Erreur lors du chargement des vendeurs:', error);
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
      
      const orders = ordersResponse.data.orders || [];
      const products = productsResponse.data.products || [];
      
      // Calculer les chiffres d'affaires
      const revenueStats = calculateRevenueStats(orders);
      
      setSellerDetails({
        orders: orders,
        products: products,
        revenue: revenueStats
      });
    } catch (error) {
      console.error('Erreur lors du chargement des détails vendeur:', error);
    }
  };

  const calculateRevenueStats = (orders) => {
    const paidOrders = orders.filter(order => order.status === 'paid');
    const deliveredOrders = orders.filter(order => order.status === 'delivered');
    
    const paidRevenue = paidOrders.reduce((sum, order) => sum + (parseInt(order.total_price) || 0), 0);
    const deliveredRevenue = deliveredOrders.reduce((sum, order) => sum + (parseInt(order.total_price) || 0), 0);
    const totalRevenue = paidRevenue + deliveredRevenue;
    
    return {
      totalRevenue,
      paidRevenue,
      deliveredRevenue,
      paidOrdersCount: paidOrders.length,
      deliveredOrdersCount: deliveredOrders.length,
      totalOrdersCount: orders.length
    };
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
      await loadSellers();
    } catch (error) {
      console.error('Erreur lors de l\'action sur le vendeur:', error);
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

  const filteredSellers = sellers.filter(seller => {
    const matchesSearch = seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         seller.phone_number.includes(searchTerm) ||
                         seller.public_link_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'active') return matchesSearch && seller.is_active;
    if (activeTab === 'inactive') return matchesSearch && !seller.is_active;
    return matchesSearch;
  });

  if (loading) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des Vendeurs</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {sellers.length} vendeurs au total • {sellers.filter(s => s.is_active).length} actifs
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Super Admin</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                  placeholder="Rechercher par nom, téléphone ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={activeTab === 'all' ? 'default' : 'outline'}
                onClick={() => setActiveTab('all')}
                size="sm"
            >
                Tous ({sellers.length})
              </Button>
              <Button
                variant={activeTab === 'active' ? 'default' : 'outline'}
                onClick={() => setActiveTab('active')}
                size="sm"
            >
                Actifs ({sellers.filter(s => s.is_active).length})
              </Button>
              <Button
                variant={activeTab === 'inactive' ? 'default' : 'outline'}
                onClick={() => setActiveTab('inactive')}
                size="sm"
              >
                Inactifs ({sellers.filter(s => !s.is_active).length})
            </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Liste des vendeurs */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
                <span>Liste des vendeurs</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
                {filteredSellers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucun vendeur trouvé</p>
                  </div>
                ) : (
                  filteredSellers.map((seller) => (
                    <div 
                      key={seller.id} 
                      className={`flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${
                        selectedSeller?.id === seller.id ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20' : ''
                      }`}
                      onClick={() => handleSellerAction(seller.id, 'view')}
                    >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {seller.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{seller.name}</p>
                          <p className="text-sm text-gray-500 flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {seller.phone_number}
                          </p>
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
                          {/* Chiffres d'affaires */}
                          {sellersRevenue[seller.id] && (
                            <div className="mt-1">
                              <p className="text-xs font-bold text-green-600">
                                {sellersRevenue[seller.id].totalRevenue.toLocaleString()} FCFA
                              </p>
                              <p className="text-xs text-gray-400">
                                {sellersRevenue[seller.id].totalOrdersCount} commandes
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          {seller.is_active ? (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSellerAction(seller.id, 'suspend');
                              }}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Pause className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSellerAction(seller.id, 'activate');
                              }}
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
                  ))
                )}
              </div>
            </CardContent>
          </Card>
                  </div>

        {/* Détails du vendeur sélectionné */}
        <div className="lg:col-span-1">
          {selectedSeller ? (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="w-5 h-5" />
                    <span>Détails</span>
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
              <CardContent className="space-y-6">
                {/* Informations du vendeur */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold text-xl">
                      {selectedSeller.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{selectedSeller.name}</h3>
                  <p className="text-sm text-gray-500">{selectedSeller.phone_number}</p>
                  <div className="mt-3 space-y-2">
                    <Badge className={getRoleColor(selectedSeller.role)}>
                      {selectedSeller.role}
                    </Badge>
                    <Badge className={getStatusColor(selectedSeller.is_active)}>
                      {selectedSeller.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                </div>

                {/* Statistiques */}
                {sellerDetails && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Package className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                        <p className="text-lg font-bold text-blue-600">{sellerDetails.products.length}</p>
                        <p className="text-xs text-gray-500">Produits</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <ShoppingCart className="w-6 h-6 mx-auto mb-2 text-green-600" />
                        <p className="text-lg font-bold text-green-600">{sellerDetails.revenue.totalOrdersCount}</p>
                        <p className="text-xs text-gray-500">Commandes</p>
                      </div>
                    </div>

                    {/* Chiffres d'affaires */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 dark:text-white">Chiffres d'affaires</h4>
                      
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total CA</span>
                          <span className="text-lg font-bold text-green-600">
                            {sellerDetails.revenue.totalRevenue.toLocaleString()} FCFA
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Payées:</span>
                            <span className="font-medium text-blue-600">
                              {sellerDetails.revenue.paidRevenue.toLocaleString()} FCFA
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Livrées:</span>
                            <span className="font-medium text-emerald-600">
                              {sellerDetails.revenue.deliveredRevenue.toLocaleString()} FCFA
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-2 text-center">
                          <p className="font-bold text-blue-600">{sellerDetails.revenue.paidOrdersCount}</p>
                          <p className="text-gray-500">Commandes payées</p>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded p-2 text-center">
                          <p className="font-bold text-emerald-600">{sellerDetails.revenue.deliveredOrdersCount}</p>
                          <p className="text-gray-500">Commandes livrées</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2">
                    <Button
                    onClick={() => handleSellerAction(selectedSeller.id, selectedSeller.is_active ? 'suspend' : 'activate')}
                    variant={selectedSeller.is_active ? 'destructive' : 'default'}
                    className="w-full"
                    >
                    {selectedSeller.is_active ? (
                        <>
                        <Pause className="w-4 h-4 mr-2" />
                          Suspendre
                        </>
                      ) : (
                        <>
                        <Play className="w-4 h-4 mr-2" />
                          Activer
                        </>
                      )}
                    </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Sélectionnez un vendeur pour voir les détails</p>
          </div>
        </CardContent>
      </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSellersPage; 