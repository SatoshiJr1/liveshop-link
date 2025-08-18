import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { 
  ShoppingBag, 
  Search, 
  Filter,
  Eye,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  DollarSign,
  User,
  Calendar,
  X,
  Package
} from 'lucide-react';
import apiService from '../services/api';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeller, setFilterSeller] = useState('all');
  const [sellers, setSellers] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    loadOrders();
    loadSellers();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminOrders();
      console.log('Commandes reçues:', response.data);
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'delivered': return <Truck className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'paid': return 'Payée';
      case 'delivered': return 'Livrée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_phone?.includes(searchTerm) ||
      order.id?.toString().includes(searchTerm);
    
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSeller = filterSeller === 'all' || order.seller_id?.toString() === filterSeller;
    
    return matchesSearch && matchesStatus && matchesSeller;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    paid: orders.filter(o => o.status === 'paid').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    totalRevenue: orders.reduce((sum, o) => sum + (parseInt(o.total_price) || 0), 0)
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
      <div className="bg-gradient-to-r from-orange-600 to-red-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Supervision des Commandes</h1>
            <p className="text-orange-100">Surveillance de toutes les commandes de la plateforme</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{orders.length}</div>
            <p className="text-orange-100 text-sm">commandes totales</p>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <ShoppingBag className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Payées</p>
                <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Livrées</p>
                <p className="text-2xl font-bold text-blue-600">{stats.delivered}</p>
              </div>
              <Truck className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Annulées</p>
                <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenus</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.totalRevenue.toLocaleString()} FCFA
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher une commande..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="paid">Payées</option>
              <option value="delivered">Livrées</option>
              <option value="cancelled">Annulées</option>
            </select>

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

            <Button onClick={loadOrders} variant="outline" className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Actualiser</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des commandes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5" />
            <span>Liste des commandes ({filteredOrders.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-semibold">
                      #{order.id}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{order.customer_name}</h3>
                        <Badge className={getStatusColor(order.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(order.status)}
                            <span>{getStatusText(order.status)}</span>
                          </div>
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{order.customer_phone}</p>
                      <p className="text-sm text-gray-500">
                        Vendeur: {order.seller?.name || order.Seller?.name || 'N/A'}
                      </p>
                      <p className="text-sm font-medium text-purple-600">
                        {order.total_price?.toLocaleString()} FCFA
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.created_at).toLocaleTimeString()}
                      </p>
                    </div>

                    <button
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 flex items-center space-x-1"
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowOrderModal(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                      <span>Détails</span>
                    </button>
                  </div>
                </div>

                {/* Produits de la commande */}
                {order.Products && order.Products.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium text-gray-700 mb-2">Produits :</p>
                    <div className="flex flex-wrap gap-2">
                      {order.Products.map((product, index) => (
                        <Badge key={index} variant="outline" className="flex items-center space-x-1">
                          <Package className="w-3 h-3" />
                          <span>{product.name}</span>
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

      {/* Modal Détails Commande */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Détails de la Commande #{selectedOrder.id}</h3>
              <button 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                onClick={() => setShowOrderModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Informations principales */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h5 className="font-semibold mb-3 text-gray-700 dark:text-gray-300">Informations Client</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Nom:</span>
                      <span className="font-medium">{selectedOrder.customer_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Téléphone:</span>
                      <span className="font-medium">{selectedOrder.customer_phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Vendeur:</span>
                      <span className="font-medium">{selectedOrder.seller?.name || selectedOrder.Seller?.name || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-semibold mb-3 text-gray-700 dark:text-gray-300">Informations Commande</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Statut:</span>
                      <Badge className={getStatusColor(selectedOrder.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(selectedOrder.status)}
                          <span>{getStatusText(selectedOrder.status)}</span>
                        </div>
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Prix total:</span>
                      <span className="font-bold text-green-600 text-lg">
                        {selectedOrder.total_price?.toLocaleString()} FCFA
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Date création:</span>
                      <span className="font-medium">
                        {new Date(selectedOrder.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Heure:</span>
                      <span className="font-medium">
                        {new Date(selectedOrder.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Produits de la commande */}
              {selectedOrder.Products && selectedOrder.Products.length > 0 && (
                <div>
                  <h5 className="font-semibold mb-3 text-gray-700 dark:text-gray-300">Produits commandés</h5>
                  <div className="space-y-3">
                    {selectedOrder.Products.map((product, index) => (
                      <div key={index} className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {/* Image du produit */}
                            {product.image_url ? (
                              <img 
                                src={product.image_url} 
                                alt={product.name}
                                className="w-12 h-12 rounded object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className={`w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center text-white font-semibold ${product.image_url ? 'hidden' : 'flex'}`}>
                              {product.name.charAt(0).toUpperCase()}
                            </div>
                            
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-gray-500">
                                {product.price?.toLocaleString()} FCFA x {product.quantity || 1}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              {((product.price || 0) * (product.quantity || 1)).toLocaleString()} FCFA
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t">
                <button
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  onClick={() => setShowOrderModal(false)}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage; 