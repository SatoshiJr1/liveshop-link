import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { ScrollArea } from '../components/ui/scroll-area';
import { 
  Coins, 
  CreditCard, 
  History, 
  TrendingUp, 
  Plus, 
  Minus, 
  ShoppingCart,
  Package,
  Wallet,
  Gift,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import apiService from '../services/api';

const CreditsPage = () => {
  const [credits, setCredits] = useState(null);
  const [packages, setPackages] = useState({});
  const [actionCosts, setActionCosts] = useState({});
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchaseDialog, setPurchaseDialog] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    loadCreditsData();
  }, []);

  const loadCreditsData = async () => {
    try {
      setLoading(true);
      const [creditsData, packagesData, historyData, statsData] = await Promise.all([
        apiService.getCredits(),
        apiService.getCreditPackages(),
        apiService.getCreditHistory(20),
        apiService.getCreditStats()
      ]);

      setCredits(creditsData.data);
      setPackages(packagesData.data.packages);
      setActionCosts(packagesData.data.actionCosts);
      setHistory(historyData.data.transactions);
      setStats(statsData.data);
    } catch (error) {
      console.error('Erreur lors du chargement des crédits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackage || !paymentMethod) {
      alert('Veuillez sélectionner un package et une méthode de paiement');
      return;
    }

    try {
      setPurchasing(true);
      const result = await apiService.purchaseCredits(selectedPackage, paymentMethod);
      alert(`Achat réussi ! ${result.data.purchasedCredits} crédits ajoutés.`);
      setPurchaseDialog(false);
      setSelectedPackage('');
      setPaymentMethod('');
      loadCreditsData(); // Recharger les données
    } catch (error) {
      alert(`Erreur lors de l'achat: ${error.message}`);
    } finally {
      setPurchasing(false);
    }
  };

  const getActionIcon = (actionType) => {
    const icons = {
      ADD_PRODUCT: <Plus className="w-4 h-4 " />,
      PROCESS_ORDER: <ShoppingCart className="w-4 h-4 " />,
      PIN_PRODUCT: <Package className="w-4 h-4 " />,
      GENERATE_CUSTOMER_CARD: <CreditCard className="w-4 h-4 " />
    };
    return icons[actionType] || <Coins className="w-4 h-4 " />;
  };

  const getActionColor = (actionType) => {
    const colors = {
      ADD_PRODUCT: 'bg-blue-100 text-blue-800',
      PROCESS_ORDER: 'bg-green-100 text-green-800',
      PIN_PRODUCT: 'bg-purple-100 text-purple-800',
      GENERATE_CUSTOMER_CARD: 'bg-orange-100 text-orange-800'
    };
    return colors[actionType] || 'bg-gray-100 text-gray-800';
  };

  const getTransactionIcon = (type) => {
    const icons = {
      purchase: <CreditCard className="w-4 h-4 text-green-600 " />,
      consumption: <Minus className="w-4 h-4 text-red-600 " />,
      bonus: <Gift className="w-4 h-4 text-blue-600 " />,
      refund: <CheckCircle className="w-4 h-4 text-green-600 " />
    };
    return icons[type] || <Coins className="w-4 h-4 " />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 ">
        <div className="flex items-center justify-center h-64 ">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 "></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des Crédits</h1>
          <p className="text-gray-600 dark:text-gray-400">Gérez votre solde et vos transactions</p>
        </div>
        <Dialog open={purchaseDialog} onOpenChange={setPurchaseDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Acheter des crédits
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Acheter des crédits</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="package" className="text-sm font-medium">Package</Label>
                <Select value={selectedPackage} onValueChange={setSelectedPackage}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Sélectionner un package" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(packages).map(([key, pkg]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex flex-col">
                          <span className="font-medium">{key}</span>
                          <span className="text-sm text-gray-500">
                            {pkg.credits} crédits - {pkg.price.toLocaleString()} XOF
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="payment" className="text-sm font-medium">Méthode de paiement</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Sélectionner une méthode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wave">Wave</SelectItem>
                    <SelectItem value="orange_money">Orange Money</SelectItem>
                    <SelectItem value="free_money">Free Money</SelectItem>
                    <SelectItem value="cash">Espèces</SelectItem>
                    <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handlePurchase} 
                disabled={purchasing || !selectedPackage || !paymentMethod}
                className="w-full mt-6"
              >
                {purchasing ? 'Achat en cours...' : 'Acheter'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Solde principal */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-blue-100 text-sm sm:text-base">Solde actuel</p>
              <h2 className="text-2xl sm:text-3xl font-bold break-words">{credits?.balance || 0} crédits</h2>
              <p className="text-blue-100 text-xs sm:text-sm break-words">{credits?.sellerName}</p>
            </div>
            <div className="flex justify-center sm:justify-end">
              <Coins className="w-10 h-10 sm:w-12 sm:h-12 text-blue-200" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="packages" className="text-xs sm:text-sm">Packages</TabsTrigger>
          <TabsTrigger value="history" className="text-xs sm:text-sm">Historique</TabsTrigger>
          <TabsTrigger value="stats" className="text-xs sm:text-sm">Statistiques</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Coûts des actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Coûts des actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(actionCosts).map(([action, cost]) => (
                  <div key={action} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {getActionIcon(action)}
                      <span className="text-sm font-medium break-words">
                        {action === 'ADD_PRODUCT' && 'Ajouter un produit'}
                        {action === 'PROCESS_ORDER' && 'Traiter une commande'}
                        {action === 'PIN_PRODUCT' && 'Épingler un produit'}
                        {action === 'GENERATE_CUSTOMER_CARD' && 'Fiche client'}
                      </span>
                    </div>
                    <Badge variant="secondary" className="ml-2 flex-shrink-0">{cost} crédit{cost > 1 ? 's' : ''}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Statistiques rapides */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total acheté</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold dark:text-white">{stats.totalPurchased}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Minus className="w-5 h-5 text-red-600" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total consommé</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold dark:text-white">{stats.totalConsumed}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="packages" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(packages).map(([key, pkg]) => (
              <Card key={key} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span className="capitalize break-words">{key}</span>
                    <Badge variant="outline" className="self-start sm:self-auto">{pkg.credits} crédits</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-xl sm:text-2xl font-bold text-green-600">
                      {pkg.price.toLocaleString()} XOF
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {pkg.credits} crédits pour {pkg.price.toLocaleString()} XOF
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      ~{(pkg.price / pkg.credits).toFixed(0)} XOF par crédit
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Historique des transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80 sm:h-96">
                <div className="space-y-3">
                  {history.map((transaction) => (
                    <div key={transaction.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {getTransactionIcon(transaction.type)}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm break-words dark:text-white">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(transaction.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right flex-shrink-0">
                        <p className={`font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount} crédits
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Solde: {transaction.balance_after}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="w-5 h-5" />
                    Solde actuel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.currentBalance}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">crédits disponibles</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Total acheté
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats.totalPurchased}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">crédits achetés</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                  <Minus className="w-5 h-5" />
                    Total consommé
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl sm:text-3xl font-bold text-red-600">{stats.totalConsumed}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">crédits utilisés</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5" />
                    Total bonus
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl sm:text-3xl font-bold text-purple-600">{stats.totalBonus}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">crédits bonus</p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CreditsPage; 