import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { 
  Coins, 
  Search, 
  Filter,
  Eye,
  Plus,
  Minus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  User,
  Activity,
  X
} from 'lucide-react';
import apiService from '../services/api';

const AdminCreditsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSeller, setFilterSeller] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showAddCredits, setShowAddCredits] = useState(false);
  const [selectedSellerForCredits, setSelectedSellerForCredits] = useState('');
  const [creditAmount, setCreditAmount] = useState('');
  const [creditReason, setCreditReason] = useState('');

  useEffect(() => {
    loadTransactions();
    loadSellers();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      console.log('Chargement des transactions...');
      const response = await apiService.getAdminTransactions();
      console.log('Réponse transactions:', response);
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error('Erreur lors du chargement des transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSellers = async () => {
    try {
      console.log('Chargement des vendeurs...');
      const response = await apiService.getAdminSellers();
      console.log('Réponse vendeurs:', response);
      setSellers(response.data.sellers);
    } catch (error) {
      console.error('Erreur lors du chargement des vendeurs:', error);
    }
  };

  const handleAddCredits = async () => {
    if (!selectedSellerForCredits || !creditAmount || !creditReason) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    try {
      await apiService.updateSellerCredits(
        selectedSellerForCredits, 
        parseInt(creditAmount), 
        creditReason
      );
      setShowAddCredits(false);
      setSelectedSellerForCredits('');
      setCreditAmount('');
      setCreditReason('');
      loadTransactions();
      loadSellers();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de crédits:', error);
    }
  };

  const handleRemoveCredits = async () => {
    if (!selectedSellerForCredits || !creditAmount || !creditReason) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    try {
      await apiService.updateSellerCredits(
        selectedSellerForCredits, 
        -parseInt(creditAmount), 
        creditReason
      );
      setShowAddCredits(false);
      setSelectedSellerForCredits('');
      setCreditAmount('');
      setCreditReason('');
      loadTransactions();
      loadSellers();
    } catch (error) {
      console.error('Erreur lors du retrait de crédits:', error);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'purchase': return 'bg-green-100 text-green-800';
      case 'consumption': return 'bg-red-100 text-red-800';
      case 'bonus': return 'bg-blue-100 text-blue-800';
      case 'refund': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'purchase': return <Plus className="w-4 h-4" />;
      case 'consumption': return <Minus className="w-4 h-4" />;
      case 'bonus': return <TrendingUp className="w-4 h-4" />;
      case 'refund': return <TrendingDown className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'purchase': return 'Achat';
      case 'consumption': return 'Consommation';
      case 'bonus': return 'Bonus';
      case 'refund': return 'Remboursement';
      default: return type;
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.Seller?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesSeller = filterSeller === 'all' || transaction.seller_id?.toString() === filterSeller;
    
    return matchesSearch && matchesType && matchesSeller;
  });

  const stats = {
    total: transactions.length,
    purchases: transactions.filter(t => t.type === 'purchase').length,
    consumptions: transactions.filter(t => t.type === 'consumption').length,
    bonuses: transactions.filter(t => t.type === 'bonus').length,
    totalCreditsAdded: transactions
      .filter(t => ['purchase', 'bonus', 'refund'].includes(t.type))
      .reduce((sum, t) => sum + t.amount, 0),
    totalCreditsConsumed: transactions
      .filter(t => t.type === 'consumption')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
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
      <div className="bg-gradient-to-r from-yellow-600 to-orange-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Gestion des Crédits</h1>
            <p className="text-yellow-100">Administration globale du système de crédits</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-yellow-100 text-sm">transactions total</p>
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
              <Coins className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Achats</p>
                <p className="text-2xl font-bold text-green-600">{stats.purchases}</p>
              </div>
              <Plus className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Consommations</p>
                <p className="text-2xl font-bold text-red-600">{stats.consumptions}</p>
              </div>
              <Minus className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bonus</p>
                <p className="text-2xl font-bold text-blue-600">{stats.bonuses}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Crédits ajoutés</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.totalCreditsAdded.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Crédits consommés</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.totalCreditsConsumed.toLocaleString()}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Coins className="w-5 h-5" />
            <span>Actions rapides</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={() => setShowAddCredits(true)} 
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter des crédits</span>
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setShowAddCredits(true)} 
              className="flex items-center space-x-2"
            >
              <Minus className="w-4 h-4" />
              <span>Retirer des crédits</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal Ajout/Retrait de crédits */}
      {showAddCredits && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Gestion des crédits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Vendeur</label>
                <select
                  value={selectedSellerForCredits}
                  onChange={(e) => setSelectedSellerForCredits(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">Sélectionner un vendeur</option>
                  {sellers.map(seller => (
                    <option key={seller.id} value={seller.id}>
                      {seller.name} ({seller.credit_balance} crédits)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Montant</label>
                <Input
                  type="number"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  placeholder="Nombre de crédits"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Raison</label>
                <Input
                  value={creditReason}
                  onChange={(e) => setCreditReason(e.target.value)}
                  placeholder="Raison de l'opération"
                />
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={handleAddCredits}
                  className="flex-1"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
                <Button 
                  onClick={handleRemoveCredits}
                  variant="destructive"
                  className="flex-1"
                >
                  <Minus className="w-4 h-4 mr-2" />
                  Retirer
                </Button>
                <Button 
                  onClick={() => setShowAddCredits(false)}
                  variant="outline"
                >
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtres */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher une transaction..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="all">Tous les types</option>
              <option value="purchase">Achats</option>
              <option value="consumption">Consommations</option>
              <option value="bonus">Bonus</option>
              <option value="refund">Remboursements</option>
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

            <Button onClick={loadTransactions} variant="outline" className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Actualiser</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Historique des transactions ({filteredTransactions.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {transaction.type.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{transaction.seller?.name || transaction.Seller?.name || 'N/A'}</h3>
                        <Badge className={getTypeColor(transaction.type)}>
                          <div className="flex items-center space-x-1">
                            {getTypeIcon(transaction.type)}
                            <span>{getTypeText(transaction.type)}</span>
                          </div>
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        Solde avant: {transaction.balance_before?.toLocaleString()} → 
                        Après: {transaction.balance_after?.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <p className={`text-lg font-bold ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.amount >= 0 ? '+' : ''}{transaction.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(transaction.created_at).toLocaleTimeString()}
                      </p>
                    </div>

                    <button
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center space-x-1"
                      onClick={() => setSelectedTransaction(transaction)}
                    >
                      <Eye className="w-4 h-4" />
                      <span>Détails</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal Détails Transaction */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Détails de la Transaction</h2>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* En-tête de la transaction */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {selectedTransaction.type.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {getTypeText(selectedTransaction.type)}
                  </h3>
                  <p className="text-gray-600">
                    {selectedTransaction.seller?.name || selectedTransaction.Seller?.name || 'N/A'}
                  </p>
                  <Badge className={getTypeColor(selectedTransaction.type)}>
                    <div className="flex items-center space-x-1">
                      {getTypeIcon(selectedTransaction.type)}
                      <span>{getTypeText(selectedTransaction.type)}</span>
                    </div>
                  </Badge>
                </div>
              </div>

              {/* Informations détaillées */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Montant</label>
                    <p className={`text-2xl font-bold ${selectedTransaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedTransaction.amount >= 0 ? '+' : ''}{selectedTransaction.amount.toLocaleString()} crédits
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="text-gray-900">{selectedTransaction.description || 'Aucune description'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type d'action</label>
                    <p className="text-gray-900">{selectedTransaction.action_type || 'N/A'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Statut</label>
                    <Badge className={selectedTransaction.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {selectedTransaction.status === 'completed' ? 'Terminé' : selectedTransaction.status}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Solde avant</label>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedTransaction.balance_before?.toLocaleString()} crédits
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Solde après</label>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedTransaction.balance_after?.toLocaleString()} crédits
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Méthode de paiement</label>
                    <p className="text-gray-900">{selectedTransaction.payment_method || 'N/A'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Référence de paiement</label>
                    <p className="text-gray-900">{selectedTransaction.payment_reference || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Informations temporelles */}
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date de création</label>
                    <p className="text-gray-900">
                      {new Date(selectedTransaction.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Heure</label>
                    <p className="text-gray-900">
                      {new Date(selectedTransaction.created_at).toLocaleTimeString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Métadonnées si disponibles */}
              {selectedTransaction.metadata && Object.keys(selectedTransaction.metadata).length > 0 && (
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Informations supplémentaires</label>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify(selectedTransaction.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedTransaction(null)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCreditsPage; 