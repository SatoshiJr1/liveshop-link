import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/api';
import webSocketService from '../services/websocket';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ShoppingBag, 
  Package, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Truck,
  Copy,
  ExternalLink,
  RefreshCw,
  BarChart3,
  Download,
  Plus,
  Eye,
  FileText,
  Users,
  DollarSign,
  Activity,
  Mic,
  TestTube,
  Coins
} from 'lucide-react';
import VoiceControls from '../components/VoiceControls';
import { getPublicLink } from '../config/domains';


export default function DashboardPage() {
  const { seller, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ 
    totalCA: 0, 
    totalOrders: 0, 
    topProduct: null,
    total_revenue: 0,
    total_orders: 0,
    pending_orders: 0,
    paid_orders: 0
  });
  const [credits, setCredits] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoUpdating, setAutoUpdating] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(`http://localhost:3001/api/public/sellers/${seller.id}/report`);
        const csv = await res.text();
        // Simple stats parsing (for demo)
        const lines = csv.split('\n').slice(1).filter(Boolean);
        let totalCA = 0, totalOrders = 0, productCount = {};
        lines.forEach(line => {
          const cols = line.split(',');
          const total = parseFloat(cols[5]) || 0;
          const prod = cols[3];
          totalCA += total;
          totalOrders++;
          productCount[prod] = (productCount[prod] || 0) + 1;
        });
        const topProduct = Object.entries(productCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
        setStats(prev => ({ 
          ...prev,
          totalCA, 
          totalOrders, 
          topProduct,
          total_revenue: totalCA,
          total_orders: totalOrders
        }));
      } catch {
        // Garder les stats existantes en cas d'erreur
      }
    }
    if (seller?.id) fetchStats();
  }, [seller]);

  useEffect(() => {
    fetchDashboardData();
    
    // 🚫 SUPPRIMÉ : Rafraîchissement automatique toutes les 30 secondes
    // ✅ REMPLACÉ PAR : WebSocket en temps réel uniquement
    
    // Pas d'intervalle - on compte sur le WebSocket pour les mises à jour
    // return () => clearInterval(interval);
  }, []);

  // Écouter les nouvelles commandes en temps réel
  useEffect(() => {
    if (seller) {
      // Écouter les nouvelles commandes
      webSocketService.onNewOrder(() => {
        console.log('🔄 Nouvelle commande reçue, mise à jour du dashboard...');
        setAutoUpdating(true);
        // Mise à jour intelligente - pas de rafraîchissement complet
        setTimeout(() => setAutoUpdating(false), 2000);
      });

      // Écouter les mises à jour de statut
      webSocketService.onOrderStatusUpdate(() => {
        console.log('🔄 Statut mis à jour, mise à jour du dashboard...');
        setAutoUpdating(true);
        // Mise à jour intelligente - pas de rafraîchissement complet
        setTimeout(() => setAutoUpdating(false), 2000);
      });

      return () => {
        webSocketService.off('new_order');
        webSocketService.off('order_status_update');
      };
    }
  }, [seller]);

  const fetchDashboardData = async () => {
    try {
      setDashboardLoading(true);
      
      // 🔧 OPTIMISATION : Appels API intelligents
      const [statsData, ordersData] = await Promise.all([
        ApiService.getOrderStats(),
        ApiService.getOrders()
      ]);
      
      // Crédits déjà chargés dans AuthContext, pas besoin de recharger

      // 🔧 OPTIMISATION : Mise à jour conditionnelle
      setStats(prev => {
        const newStats = { ...prev, ...statsData.stats };
        // Ne mettre à jour que si les données ont changé
        return JSON.stringify(prev) === JSON.stringify(newStats) ? prev : newStats;
      });
      
      setRecentOrders(ordersData.orders.slice(0, 5)); // 5 dernières commandes
      
      // Crédits déjà gérés par AuthContext
      
      console.log('✅ Dashboard mis à jour via WebSocket/manuel');
    } catch (error) {
      console.error('❌ Erreur lors du chargement du dashboard:', error);
    } finally {
      setDashboardLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const copyPublicLink = () => {
    const link = getPublicLink(seller.public_link_id);
    navigator.clipboard.writeText(link).then(() => {
      // Notification de succès
      const event = new CustomEvent('showToast', {
        detail: {
          type: 'success',
          message: 'Lien copié dans le presse-papiers !'
        }
      });
      window.dispatchEvent(event);
    }).catch(() => {
      // Notification d'erreur
      const event = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message: 'Erreur lors de la copie du lien'
        }
      });
      window.dispatchEvent(event);
    });
  };

  const openPublicLink = () => {
    const link = getPublicLink(seller.public_link_id);
    window.open(link, '_blank');
  };

  const handleDownloadGlobalReport = () => {
    window.open(`http://localhost:3001/api/public/sellers/${seller.id}/report`, '_blank');
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      'paid': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      'delivered': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'En attente',
      'paid': 'Payé',
      'delivered': 'Livré'
    };
    return labels[status] || status;
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full px-4 py-6 lg:py-8">
        {/* Header avec salutation et actions */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-4 lg:p-6 text-white mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 lg:mb-6">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-2xl lg:text-3xl font-bold">Bonjour, {seller.name} 👋</h1>
              <p className="text-purple-100 text-base lg:text-lg">Voici un aperçu de votre boutique</p>
            </div>
            <div className="flex items-center gap-2">
              {autoUpdating && (
                <div className="flex items-center gap-1 text-green-200 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Mise à jour...
                </div>
              )}
              <Button
                onClick={handleRefresh}
                variant="secondary"
                size="sm"
                disabled={refreshing}
                className="bg-white/20 hover:bg-white/30"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Lien public - Design amélioré */}
          <div className="bg-white/10 rounded-xl p-3 lg:p-4">
            <h3 className="font-semibold mb-3 flex items-center text-sm lg:text-base">
              <ExternalLink className="w-4 h-4 mr-2" />
              Votre lien de boutique
            </h3>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="bg-white/20 px-3 py-2 rounded-lg text-xs lg:text-sm flex-1 truncate font-mono text-center sm:text-left flex items-center justify-center sm:justify-start">
                <span className="text-purple-200">{getPublicLink(seller.public_link_id).replace(`/${seller.public_link_id}`, '/')}</span>
                <span className="text-white font-bold">{seller.public_link_id}</span>
              </div>
              <div className="flex justify-center sm:justify-start space-x-2">
                <Button 
                  onClick={copyPublicLink} 
                  size="sm" 
                  variant="secondary" 
                  className="bg-white/20 hover:bg-white/30 transition-all duration-200 hover:scale-105"
                  title="Copier le lien"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button 
                  onClick={openPublicLink} 
                  size="sm" 
                  variant="secondary" 
                  className="bg-white/20 hover:bg-white/30 transition-all duration-200 hover:scale-105"
                  title="Ouvrir la boutique"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-300">Chiffre d'affaires</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg lg:text-2xl font-bold text-green-600">
                {stats?.total_revenue?.toLocaleString() || stats.totalCA.toLocaleString()} FCFA
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total des ventes</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-300">Commandes totales</CardTitle>
              <ShoppingBag className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg lg:text-2xl font-bold text-purple-600">
                {stats?.total_orders || stats.totalOrders}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Toutes les commandes</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-300">En attente</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg lg:text-2xl font-bold text-yellow-600">
                {stats?.pending_orders || 0}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Commandes en cours</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-300">Payées</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg lg:text-2xl font-bold text-blue-600">
                {stats?.paid_orders || 0}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Commandes finalisées</p>
            </CardContent>
          </Card>
        </div>

        {/* Carte des crédits séparée */}
        {/* {credits && (
          <div className="mb-6 lg:mb-8">
            <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-green-100 mb-1">Crédits Disponibles</h3>
                    <p className="text-green-100 text-sm">Solde actuel de votre compte</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white mb-1">
                      {credits.balance}
                    </div>
                    <p className="text-green-100 text-sm">crédits</p>
                  </div>
                  <div className="text-center">
                    <Coins className="w-12 h-12 text-green-200" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )} */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            {/* Commandes récentes */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-xl dark:text-white">
                  <Package className="w-5 h-5 mr-2 text-purple-600" />
                  Commandes récentes
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Les 5 dernières commandes reçues
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300 text-lg mb-2">Aucune commande pour le moment</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Partagez votre lien de boutique pour recevoir vos premières commandes !
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-700/50">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">{order.customer_name}</h4>
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusLabel(order.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {order.product?.name} × {order.quantity}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(order.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-purple-600 text-lg">
                            {order.total_price.toLocaleString()} FCFA
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-xl dark:text-white">
                  <Activity className="w-5 h-5 mr-2 text-blue-600" />
                  Actions rapides
                </CardTitle>
                <CardDescription>
                  Accédez rapidement aux fonctionnalités principales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => navigate('/products')}
                    variant="outline" 
                    className="h-auto p-6 flex flex-col items-center space-y-2 hover:bg-purple-50 hover:border-purple-200 transition-all"
                  >
                    <Plus className="w-8 h-8 text-purple-600" />
                    <span className="font-medium">Gérer les produits</span>
                    <span className="text-xs text-gray-500">Ajouter, modifier, supprimer</span>
                  </Button>

                  <Button 
                    onClick={() => navigate('/orders')}
                    variant="outline" 
                    className="h-auto p-6 flex flex-col items-center space-y-2 hover:bg-blue-50 hover:border-blue-200 transition-all"
                  >
                    <ShoppingBag className="w-8 h-8 text-blue-600" />
                    <span className="font-medium">Voir les commandes</span>
                    <span className="text-xs text-gray-500">Gérer et suivre</span>
                  </Button>

                  <Button 
                    onClick={() => navigate('/lives')}
                    variant="outline" 
                    className="h-auto p-6 flex flex-col items-center space-y-2 hover:bg-green-50 hover:border-green-200 transition-all"
                  >
                    <Users className="w-8 h-8 text-green-600" />
                    <span className="font-medium">Gérer les lives</span>
                    <span className="text-xs text-gray-500">Créer, organiser</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne latérale - Rapports */}
          <div className="space-y-6 lg:space-y-8">
            {/* Contrôles des notifications vocales */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-lg lg:text-xl">
                  <Mic className="w-5 h-5 mr-2 text-purple-600" />
                  Notifications vocales
                </CardTitle>
                <CardDescription className="text-sm">
                  Configurez les annonces vocales pendant vos lives
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VoiceControls />
              </CardContent>
            </Card>

            {/* Section Rapports */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-lg lg:text-xl">
                  <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
                  Rapports & Analyses
                </CardTitle>
                <CardDescription className="text-sm">
                  Exportez vos données et visualisez vos performances
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleDownloadGlobalReport}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Rapport global (CSV)
                </Button>
                
                <Button 
                  onClick={() => navigate('/lives')}
                  variant="outline" 
                  className="w-full"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Rapports par live
                </Button>

                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-3 lg:p-4 border border-green-100">
                  <h4 className="font-medium text-green-800 mb-2 text-sm lg:text-base">📊 Graphiques à venir</h4>
                  <p className="text-xs lg:text-sm text-green-700">
                    Bientôt disponible : graphiques de ventes, tendances, et analyses détaillées
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Top produit */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <TrendingUp className="w-4 h-4 mr-2 text-orange-600" />
                  Produit vedette
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 mb-2">
                    {stats.topProduct || 'Aucun produit'}
                  </div>
                  <p className="text-sm text-gray-500">
                    Produit le plus commandé
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Vue rapide boutique */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Eye className="w-4 h-4 mr-2 text-purple-600" />
                  Vue rapide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={openPublicLink}
                  variant="outline" 
                  className="w-full"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Voir ma boutique
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

