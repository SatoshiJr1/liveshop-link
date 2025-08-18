import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  RefreshCw, 
  Eye, 
  Printer, 
  QrCode, 
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  XCircle,
  Truck, 
  Trash2,
  DollarSign,
  Package,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import ApiService from '../services/api';
import webSocketService from '../services/websocket';
import QRCodeModal from '../components/QRCodeModal';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';

const OrdersPage = () => {
  const { refreshCredits } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedOrderForQR, setSelectedOrderForQR] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [orderToDelete, setOrderToDelete] = useState(null);
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(6); // Utiliser la limite par défaut de l'API
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    fetchOrders();
    
    // Rafraîchissement automatique toutes les 30 secondes
    const interval = setInterval(() => {
      fetchOrders();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Écouter les nouvelles commandes en temps réel
  useEffect(() => {
    // Écouter les nouvelles commandes
    webSocketService.onNewOrder((data) => {
      console.log('🔄 Nouvelle commande reçue, mise à jour de la liste...');
      // Rafraîchir immédiatement les données
      fetchOrders();
    });

    // Écouter les mises à jour de statut
    webSocketService.onOrderStatusUpdate((data) => {
      console.log('🔄 Statut mis à jour, mise à jour de la liste...');
      // Rafraîchir immédiatement les données
      fetchOrders();
    });

    return () => {
      webSocketService.off('new_order');
      webSocketService.off('order_status_update');
    };
  }, []);

  // Rafraîchir quand on change de page ou de filtre
  useEffect(() => {
    fetchOrders();
  }, [currentPage, activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Déterminer le statut à filtrer
      let status = null;
      if (activeTab !== 'all') {
        status = activeTab;
      }
      
      const data = await ApiService.getOrders(status, currentPage, ordersPerPage);
      
      // Gérer les deux formats de réponse
      if (data.orders && data.pagination) {
        // Format avec pagination
      setOrders(data.orders);
        setCurrentPage(data.pagination.currentPage);
        setTotalPages(data.pagination.totalPages);
        setTotalOrders(data.pagination.totalOrders || data.orders.length);
      } else {
        // Format sans pagination (fallback)
        setOrders(data.orders || data);
        setCurrentPage(1);
        setTotalPages(1);
        setTotalOrders(data.orders?.length || data.length || 0);
      }
      
      console.log('📊 Données commandes:', {
        orders: data.orders?.length || 0,
        pagination: data.pagination,
        currentPage,
        activeTab
      });
      
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      const data = await ApiService.getOrderDetail(orderId);
      setSelectedOrder(data.order);
      setShowOrderDialog(true);
    } catch (error) {
      console.error('Erreur lors du chargement de la commande:', error);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      // Vérifier les crédits avant de traiter la commande
      const creditCheck = await ApiService.checkCredits('PROCESS_ORDER');
      
      if (!creditCheck.data.hasEnough) {
        alert(`Crédits insuffisants ! Vous avez ${creditCheck.data.currentBalance} crédits, mais il en faut ${creditCheck.data.requiredCredits} pour traiter une commande.`);
        return;
      }
      
      await ApiService.updateOrderStatus(orderId, newStatus);
      
      // Rafraîchir les crédits après traitement de la commande
      await refreshCredits();
      
      // Mettre à jour l'état local
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus }
            : order
        )
      );
      
      // Mettre à jour la commande sélectionnée si elle est ouverte
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
      
      toast.success(`Statut de la commande #${orderId} mis à jour`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      await ApiService.deleteOrder(orderId);
      
      // Mettre à jour l'état local
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
      
      // Fermer la modale si elle était ouverte
      if (selectedOrder && selectedOrder.id === orderId) {
        setShowOrderDialog(false);
        setSelectedOrder(null);
      }
      
      toast.success(`Commande #${orderId} supprimée`);
      setOrderToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression de la commande');
    }
  };

  const handlePrintTicket = async (orderId) => {
    try {
      // Récupérer le token d'authentification
      const token = localStorage.getItem('liveshop_token');
      if (!token) {
        toast.error('Token d\'authentification manquant');
        return;
      }

      // URL dynamique basée sur l'environnement
      const protocol = window.location.protocol;
      const hostname = window.location.hostname;
      const port = '3001';
      
      const ticketUrl = `${protocol}//${hostname}:${port}/api/orders/${orderId}/delivery-ticket`;
      console.log('🖨️ Téléchargement du ticket:', ticketUrl);
      
      // Créer un lien temporaire avec le token
      const link = document.createElement('a');
      link.href = ticketUrl;
      link.target = '_blank';
      
      // Ajouter le token dans les headers via une requête fetch
      const response = await fetch(ticketUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la génération du PDF');
      }
      
      // Créer un blob et télécharger
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      link.href = url;
      link.download = `livraison-${orderId}.pdf`;
      
      // Déclencher le téléchargement
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Nettoyer l'URL
      window.URL.revokeObjectURL(url);
      
      toast.success('Ticket téléchargé');
    } catch (error) {
      console.error('Erreur lors du téléchargement du ticket:', error);
      toast.error('Erreur lors du téléchargement du ticket');
    }
  };

  const handleShowQRCode = (orderId) => {
    setSelectedOrderForQR(orderId);
    setShowQRModal(true);
  };

  // Amélioration des icônes et couleurs des états
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 " />;
      case 'paid':
        return <DollarSign className="w-4 h-4 " />;
      case 'delivered':
        return <Truck className="w-4 h-4 " />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 " />;
      default:
        return <Package className="w-4 h-4 " />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-600';
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-600';
      case 'delivered':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-600';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-600';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-600';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'paid':
        return 'Payé';
      case 'delivered':
        return 'Livré & Payé';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  // Générer les numéros de pages à afficher
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Afficher toutes les pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Afficher un sous-ensemble des pages
      if (currentPage <= 3) {
        // Début
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Fin
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Milieu
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen ">
        <div className="text-center ">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto "></div>
          <p className="mt-4 text-gray-600 ">Chargement des commandes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 ">Commandes</h1>
          <p className="text-gray-600 ">Gérez toutes vos commandes en un seul endroit</p>
        </div>
        
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          className="flex items-center gap-2 "
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Actualisation...' : 'Actualiser'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 ">
        <button
          onClick={() => {
            setActiveTab('all');
            setCurrentPage(1);
          }}
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
            activeTab === 'all'
              ? 'bg-purple-100 text-purple-700 border-b-2 border-purple-600'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
          }`}
        >
          Toutes
          <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs ">
            {totalOrders}
          </span>
        </button>
        
        <button
          onClick={() => {
            setActiveTab('pending');
            setCurrentPage(1);
          }}
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
            activeTab === 'pending'
              ? 'bg-purple-100 text-purple-700 border-b-2 border-purple-600'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
          }`}
        >
          En attente
        </button>
        
        <button
          onClick={() => {
            setActiveTab('paid');
            setCurrentPage(1);
          }}
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
            activeTab === 'paid'
              ? 'bg-purple-100 text-purple-700 border-b-2 border-purple-600'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
          }`}
        >
          Payées
        </button>
        
        <button
          onClick={() => {
            setActiveTab('delivered');
            setCurrentPage(1);
          }}
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
            activeTab === 'delivered'
              ? 'bg-purple-100 text-purple-700 border-b-2 border-purple-600'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
          }`}
        >
          Livrées
        </button>
      </div>

      {/* Orders Grid */}
      {orders.length === 0 ? (
        <div className="text-center py-12 ">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4 " />
          <h3 className="text-lg font-medium text-gray-900 mb-2 ">Aucune commande</h3>
                <p className="text-gray-600 ">
                  {activeTab === 'all' 
              ? 'Vous n\'avez pas encore reçu de commandes.'
              : `Aucune commande ${getStatusLabel(activeTab).toLowerCase()}.`
                  }
                </p>
        </div>
          ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
          {orders.map((order) => (
                <Card key={order.id} className="hover: transition-shadow ">
              <CardHeader className="pb-3 ">
                <div className="flex items-center justify-between ">
                  <CardTitle className="text-lg ">Commande #{order.id}</CardTitle>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 ">{getStatusLabel(order.status)}</span>
                      </Badge>
                    </div>
                <p className="text-sm text-gray-500 ">
                  {new Date(order.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4 ">
                {/* Customer Info */}
                      <div>
                  <h4 className="font-semibold text-gray-900 ">{order.customer_name}</h4>
                  <p className="text-sm text-gray-600 ">{order.customer_phone}</p>
                  <p className="text-sm text-gray-500 truncate ">{order.customer_address}</p>
                      </div>

                {/* Product Info */}
                      <div>
                  <p className="font-medium text-gray-900 ">{order.product?.name}</p>
                  <p className="text-sm text-gray-600 ">
                    Quantité: {order.quantity} | {order.total_price.toLocaleString()} FCFA
                  </p>
                    </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 ">
                        <Button
                          onClick={() => handleViewOrder(order.id)}
                    size="sm"
                    variant="outline"
                    className="flex-1 "
                  >
                    <Eye className="w-4 h-4 mr-1 " />
                    Voir
                  </Button>
                  
                  <Button
                    onClick={() => handlePrintTicket(order.id)}
                    size="sm"
                    variant="outline"
                  >
                    <Printer className="w-4 h-4 " />
                  </Button>
                  
                  <Button
                    onClick={() => handleShowQRCode(order.id)}
                    size="sm"
                          variant="outline"
                  >
                    <QrCode className="w-4 h-4 " />
                  </Button>

                  {/* Delete Button with Alert Dialog */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                          size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 "
                        onClick={() => setOrderToDelete(order)}
                      >
                        <Trash2 className="w-4 h-4 " />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer la commande</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer la commande #{orderToDelete?.id} ? 
                          Cette action est irréversible et supprimera définitivement la commande.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteOrder(orderToDelete?.id)}
                          className="bg-red-600 hover:bg-red-700 "
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

      {/* Pagination optimisée pour mobile */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8 px-4">
          {/* Boutons Précédent/Suivant - Plus grands sur mobile */}
          <Button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            variant="outline"
            className="flex items-center gap-2 px-6 py-3 rounded-lg border-gray-200 hover:bg-gray-50 disabled:opacity-50 w-full sm:w-auto text-sm sm:text-base"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Précédent</span>
            <span className="sm:hidden">Préc.</span>
          </Button>
          
          {/* Indicateur de page - Simplifié sur mobile */}
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
              Page {currentPage} / {totalPages}
            </span>
            
            {/* Numéros de page - Limités sur mobile */}
            <div className="hidden sm:flex items-center gap-1">
              {getPageNumbers().map((page, index) => (
                <Button
                  key={index}
                  onClick={() => typeof page === 'number' && handlePageChange(page)}
                  variant={currentPage === page ? 'default' : 'outline'}
                  disabled={page === '...'}
                  className={`w-10 h-10 rounded-lg ${
                    currentPage === page 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {page}
                </Button>
              ))}
            </div>
          </div>
          
          <Button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            variant="outline"
            className="flex items-center gap-2 px-6 py-3 rounded-lg border-gray-200 hover:bg-gray-50 disabled:opacity-50 w-full sm:w-auto text-sm sm:text-base"
          >
            <span className="hidden sm:inline">Suivant</span>
            <span className="sm:hidden">Suiv.</span>
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="max-w-2xl ">
          <DialogHeader>
            <DialogTitle>Détails de la commande #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Commande passée le {selectedOrder && new Date(selectedOrder.created_at).toLocaleDateString('fr-FR')}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 ">
              {/* Status */}
              <div className="flex items-center justify-between ">
                <Badge className={getStatusColor(selectedOrder.status)} size="lg">
                  {getStatusIcon(selectedOrder.status)}
                  <span className="ml-2 ">{getStatusLabel(selectedOrder.status)}</span>
                </Badge>
                <Select
                  value={selectedOrder.status}
                  onValueChange={(value) => handleUpdateStatus(selectedOrder.id, value)}
                >
                  <SelectTrigger className="w-40 ">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="paid">Payé</SelectItem>
                    <SelectItem value="delivered">Livré & Payé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                    <div>
                  <h4 className="font-semibold text-gray-900 mb-2 ">Informations client</h4>
                  <div className="space-y-1 text-sm ">
                    <p><span className="font-medium ">Nom:</span> {selectedOrder.customer_name}</p>
                    <p><span className="font-medium ">Téléphone:</span> {selectedOrder.customer_phone}</p>
                    <p><span className="font-medium ">Adresse:</span> {selectedOrder.customer_address}</p>
                  </div>
                    </div>
                
                    <div>
                  <h4 className="font-semibold text-gray-900 mb-2 ">Détails commande</h4>
                  <div className="space-y-1 text-sm ">
                    <p><span className="font-medium ">Produit:</span> {selectedOrder.product?.name}</p>
                    <p><span className="font-medium ">Quantité:</span> {selectedOrder.quantity}</p>
                    <p><span className="font-medium ">Prix unitaire:</span> {selectedOrder.product?.price?.toLocaleString()} FCFA</p>
                    <p><span className="font-medium ">Total:</span> {selectedOrder.total_price.toLocaleString()} FCFA</p>
                  </div>
                    </div>
                  </div>

              {/* Payment Info */}
                  <div>
                <h4 className="font-semibold text-gray-900 mb-2 ">Paiement</h4>
                <div className="space-y-1 text-sm ">
                  <p><span className="font-medium ">Méthode:</span> {selectedOrder.payment_method}</p>
                  {selectedOrder.payment_proof_url && (
                    <p>
                      <span className="font-medium ">Preuve:</span>{' '}
                      <a 
                        href={selectedOrder.payment_proof_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:underline "
                      >
                        Voir la preuve
                      </a>
                    </p>
                  )}
                </div>
              </div>

              {/* Comment */}
              {selectedOrder.comment && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 ">Commentaire</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg ">
                    {selectedOrder.comment}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 ">
                <Button
                  onClick={() => handlePrintTicket(selectedOrder.id)}
                  className="flex-1 "
                >
                  <Printer className="w-4 h-4 mr-2 " />
                  Télécharger PDF
                </Button>
                <Button
                  onClick={() => handleShowQRCode(selectedOrder.id)}
                  variant="outline"
                  className="flex-1 "
                >
                  <QrCode className="w-4 h-4 mr-2 " />
                  Voir QR Code
                </Button>
              </div>

              {/* Delete Action */}
              <div className="pt-4 border-t border-gray-200 ">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 "
                    >
                      <Trash2 className="w-4 h-4 mr-2 " />
                      Supprimer cette commande
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer la commande #{selectedOrder.id}</AlertDialogTitle>
                      <AlertDialogDescription>
                        Êtes-vous absolument sûr de vouloir supprimer cette commande ? 
                        Cette action est irréversible et supprimera définitivement toutes les données associées.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteOrder(selectedOrder.id)}
                        className="bg-red-600 hover:bg-red-700 "
                      >
                        Oui, supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        orderId={selectedOrderForQR}
      />
    </div>
  );
};

export default OrdersPage;

