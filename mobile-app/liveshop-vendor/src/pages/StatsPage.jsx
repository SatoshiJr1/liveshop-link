import { useState, useEffect } from 'react';
import ApiService from '../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  ShoppingBag, 
  Package, 
  DollarSign,
  Calendar,
  Clock,
  Users,
  Star
} from 'lucide-react';

const StatsPage = () => {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatsData();
  }, []);

  const fetchStatsData = async () => {
    try {
      setLoading(true);
      const [statsData, ordersData, productsData] = await Promise.all([
        ApiService.getOrderStats(),
        ApiService.getOrders(),
        ApiService.getProducts()
      ]);

      setStats(statsData.stats);
      setOrders(ordersData.orders || ordersData);
      // Gérer les deux formats possibles de réponse pour les produits
      const productsArray = productsData.products || productsData;
      setProducts(Array.isArray(productsArray) ? productsArray : []);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTopProducts = () => {
    const productSales = {};
    
    if (!Array.isArray(orders)) return [];
    
    orders.forEach(order => {
      if (order.product) {
        const productId = order.product.id;
        if (!productSales[productId]) {
          productSales[productId] = {
            product: order.product,
            totalQuantity: 0,
            totalRevenue: 0,
            orderCount: 0
          };
        }
        productSales[productId].totalQuantity += order.quantity || 0;
        productSales[productId].totalRevenue += order.total_price || 0;
        productSales[productId].orderCount += 1;
      }
    });

    return Object.values(productSales)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);
  };

  const getRecentActivity = () => {
    if (!Array.isArray(orders)) return [];
    
    return orders
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 3);
  };

  const getMonthlyStats = () => {
    if (!Array.isArray(orders)) return { orders: 0, revenue: 0 };
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthlyOrders = orders.filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    });

    const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + (order.total_price || 0), 0);
    
    return {
      orders: monthlyOrders.length,
      revenue: monthlyRevenue
    };
  };

  const topProducts = getTopProducts();
  const recentActivity = getRecentActivity();
  const monthlyStats = getMonthlyStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen ">
        <div className="text-center ">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4 "></div>
          <p className="text-gray-600 ">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 ">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-purple-600 text-2xl">📊</span>
        <h1 className="text-2xl font-bold text-gray-900 ">Statistiques</h1>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 gap-4 ">
        <Card className="p-2">
          <CardContent className="flex flex-col items-center justify-center">
            <span className="text-gray-400 mb-1"><ShoppingBag className="h-6 w-6" /></span>
            <div className="text-3xl font-extrabold text-gray-900">{stats?.total_orders || 0}</div>
            <div className="text-xs text-gray-500 font-medium">Commandes</div>
          </CardContent>
        </Card>
        <Card className="p-2">
          <CardContent className="flex flex-col items-center justify-center">
            <span className="text-green-400 mb-1"><DollarSign className="h-6 w-6" /></span>
            <div className="text-3xl font-extrabold text-green-600">{stats?.total_revenue?.toLocaleString() || 0} FCFA</div>
            <div className="text-xs text-gray-500 font-medium">Chiffre d'affaires</div>
          </CardContent>
        </Card>
        <Card className="p-2">
          <CardContent className="flex flex-col items-center justify-center">
            <span className="text-blue-400 mb-1"><Package className="h-6 w-6" /></span>
            <div className="text-3xl font-extrabold text-blue-600">{Array.isArray(products) ? products.length : 0}</div>
            <div className="text-xs text-gray-500 font-medium">Produits</div>
          </CardContent>
        </Card>
        <Card className="p-2">
          <CardContent className="flex flex-col items-center justify-center">
            <span className="text-purple-400 mb-1"><TrendingUp className="h-6 w-6" /></span>
            <div className="text-3xl font-extrabold text-purple-600">{stats?.total_orders > 0 ? Math.round((stats.paid_orders / stats.total_orders) * 100) : 0}%</div>
            <div className="text-xs text-gray-500 font-medium">Conversion</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center "><Star className="w-5 h-5 mr-2 text-yellow-500 " />Top produits</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <div className="text-center py-8 "><Package className="w-12 h-12 text-gray-400 mx-auto mb-4 " /><p className="text-gray-600 ">Aucune vente</p></div>
            ) : (
              <div className="space-y-3 ">
                {topProducts.slice(0,3).map((item, index) => (
                  <div key={item.product.id} className="flex items-center gap-3 ">
                    <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-lg font-bold text-purple-600 ">{index+1}</span>
                    <div className="flex-1 ">
                      <h4 className="font-medium text-gray-900 ">{item.product.name}</h4>
                      <div className="text-xs text-gray-500 ">{item.totalQuantity} vendus</div>
                    </div>
                    <div className="text-right "><span className="font-semibold text-purple-600 ">{item.totalRevenue.toLocaleString()} FCFA</span></div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center "><Clock className="w-5 h-5 mr-2 text-blue-500 " />Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 "><ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4 " /><p className="text-gray-600 ">Aucune activité</p></div>
            ) : (
              <div className="space-y-2 ">
                {recentActivity.map((order) => (
                  <div key={order.id} className="flex items-center justify-between ">
                    <div className="flex-1 ">
                      <span className="font-medium text-gray-900 ">{order.customer_name}</span>
                      <span className="text-xs text-gray-500 ml-2 ">{order.product?.name} × {order.quantity}</span>
                      <span className="block text-xs text-gray-400 ">{new Date(order.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="text-right ">
                      <Badge className={order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : order.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                        {order.status === 'pending' ? 'En attente' : order.status === 'paid' ? 'Payé' : 'Livré'}
                      </Badge>
                      <div className="text-sm font-semibold text-purple-600 mt-1 ">{order.total_price.toLocaleString()} FCFA</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 ">
            <div className="text-center p-2 bg-yellow-50 rounded-lg ">
              <div className="text-xl font-bold text-yellow-600 ">{stats?.pending_orders || 0}</div>
              <div className="text-xs text-yellow-800 ">En attente</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded-lg ">
              <div className="text-xl font-bold text-green-600 ">{stats?.paid_orders || 0}</div>
              <div className="text-xs text-green-800 ">Payées</div>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded-lg ">
              <div className="text-xl font-bold text-blue-600 ">{(stats?.total_orders || 0) - (stats?.pending_orders || 0) - (stats?.paid_orders || 0)}</div>
              <div className="text-xs text-blue-800 ">Livrées</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsPage;

