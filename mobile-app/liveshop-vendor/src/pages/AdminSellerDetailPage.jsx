import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  ArrowLeft,
  User,
  Package,
  ShoppingBag,
  Coins,
  Calendar,
  Phone,
  Mail,
  Shield,
  UserCheck,
  UserX,
  Plus,
  Minus,
  Eye,
  Edit
} from 'lucide-react';
import apiService from '../services/api';

const AdminSellerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    loadSellerDetails();
  }, [id]);

  const loadSellerDetails = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminSellerDetails(id);
      setSeller(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      await apiService.updateSeller(seller.id, { is_active: !seller.is_active });
      loadSellerDetails();
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
    }
  };

  const handleUpdateCredits = async (amount, reason) => {
    try {
      await apiService.updateSellerCredits(seller.id, amount, reason);
      loadSellerDetails();
    } catch (error) {
      console.error('Erreur lors de la mise à jour des crédits:', error);
    }
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'superadmin': return 'bg-purple-500 text-white';
      case 'admin': return 'bg-blue-500 text-white';
      case 'seller': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 ">
        <div className="flex items-center justify-center h-64 ">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 "></div>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="container mx-auto p-4 ">
        <div className="text-center ">
          <h2 className="text-2xl font-bold text-gray-900 ">Vendeur non trouvé</h2>
          <Button onClick={() => navigate('/admin/sellers')} className="mt-4 ">
            Retour à la liste
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6 ">
      {/* Header */}
      <div className="flex items-center justify-between ">
        <Button 
          variant="outline" 
          onClick={() => navigate('/admin/sellers')}
          className="flex items-center space-x-2 "
        >
          <ArrowLeft className="w-4 h-4 " />
          <span>Retour</span>
        </Button>
        
        <div className="flex items-center space-x-2 ">
          <Button
            onClick={() => setShowActions(!showActions)}
            variant="outline"
          >
            <Edit className="w-4 h-4 mr-2 " />
            Actions
          </Button>
        </div>
      </div>

      {/* Actions rapides */}
      {showActions && (
        <Card>
          <CardContent className="p-6 ">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
              <Button
                onClick={handleToggleStatus}
                variant={seller.is_active ? "destructive" : "default"}
                className="flex items-center space-x-2 "
              >
                {seller.is_active ? (
                  <>
                    <UserX className="w-4 h-4 " />
                    <span>Suspendre</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 " />
                    <span>Activer</span>
                  </>
                )}
              </Button>

              <Button
                onClick={() => handleUpdateCredits(100, 'Bonus admin')}
                className="flex items-center space-x-2 "
              >
                <Plus className="w-4 h-4 " />
                <span>+100 crédits</span>
              </Button>

              <Button
                onClick={() => handleUpdateCredits(-50, 'Sanction admin')}
                variant="destructive"
                className="flex items-center space-x-2 "
              >
                <Minus className="w-4 h-4 " />
                <span>-50 crédits</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informations du vendeur */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ">
        {/* Profil */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 ">
              <User className="w-5 h-5 " />
              <span>Profil</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 ">
            <div className="flex items-center space-x-4 ">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xl ">
                {seller.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold ">{seller.name}</h3>
                <div className="flex items-center space-x-2 mt-1 ">
                  <Badge className={getRoleColor(seller.role)}>
                    {seller.role}
                  </Badge>
                  <Badge className={getStatusColor(seller.is_active)}>
                    {seller.is_active ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2 ">
              <div className="flex items-center space-x-2 ">
                <Phone className="w-4 h-4 text-gray-500 " />
                <span className="text-sm ">{seller.phone_number}</span>
              </div>
              <div className="flex items-center space-x-2 ">
                <Shield className="w-4 h-4 text-gray-500 " />
                <span className="text-sm ">ID: {seller.public_link_id}</span>
              </div>
              <div className="flex items-center space-x-2 ">
                <Calendar className="w-4 h-4 text-gray-500 " />
                <span className="text-sm ">
                  Inscrit le {new Date(seller.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 ">
              <Coins className="w-5 h-5 " />
              <span>Statistiques</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 ">
            <div className="text-center ">
              <div className="text-3xl font-bold text-purple-600 ">
                {seller.credit_balance?.toLocaleString() || 0}
              </div>
              <p className="text-sm text-gray-600 ">Crédits disponibles</p>
            </div>

            <div className="grid grid-cols-2 gap-4 ">
              <div className="text-center ">
                <div className="text-2xl font-bold text-green-600 ">
                  {seller.products?.length || 0}
                </div>
                <p className="text-sm text-gray-600 ">Produits</p>
              </div>
              <div className="text-center ">
                <div className="text-2xl font-bold text-blue-600 ">
                  {seller.orders?.length || 0}
                </div>
                <p className="text-sm text-gray-600 ">Commandes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions rapides */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 ">
              <Shield className="w-5 h-5 " />
              <span>Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 ">
            <Button 
              onClick={() => setShowActions(!showActions)}
              variant="outline" 
              className="w-full justify-start "
            >
              <Edit className="w-4 h-4 mr-2 " />
              Gérer le vendeur
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start "
            >
              <Eye className="w-4 h-4 mr-2 " />
              Voir l'historique
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start "
            >
              <Shield className="w-4 h-4 mr-2 " />
              Changer le rôle
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Produits du vendeur */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 ">
            <Package className="w-5 h-5 " />
            <span>Produits ({seller.products?.length || 0})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {seller.products && seller.products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
              {seller.products.map((product) => (
                <div key={product.id} className="border rounded-lg p-4 ">
                  <h4 className="font-semibold ">{product.name}</h4>
                  <p className="text-sm text-gray-600 ">{product.price?.toLocaleString()} FCFA</p>
                  <p className="text-sm text-gray-500 ">Stock: {product.stock_quantity || 0}</p>
                  <p className="text-xs text-gray-400 ">
                    {new Date(product.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8 ">Aucun produit</p>
          )}
        </CardContent>
      </Card>

      {/* Commandes du vendeur */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 ">
            <ShoppingBag className="w-5 h-5 " />
            <span>Commandes ({seller.orders?.length || 0})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {seller.orders && seller.orders.length > 0 ? (
            <div className="space-y-3 ">
              {seller.orders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4 ">
                  <div className="flex items-center justify-between ">
                    <div>
                      <h4 className="font-semibold ">#{order.id} - {order.customer_name}</h4>
                      <p className="text-sm text-gray-600 ">{order.total_price?.toLocaleString()} FCFA</p>
                      <Badge variant="outline">{order.status}</Badge>
                    </div>
                    <p className="text-xs text-gray-400 ">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8 ">Aucune commande</p>
          )}
        </CardContent>
      </Card>

      {/* Historique des transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 ">
            <Coins className="w-5 h-5 " />
            <span>Historique des transactions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {seller.creditTransactions && seller.creditTransactions.length > 0 ? (
            <div className="space-y-3 ">
              {seller.creditTransactions.map((transaction) => (
                <div key={transaction.id} className="border rounded-lg p-4 ">
                  <div className="flex items-center justify-between ">
                    <div>
                      <p className="font-semibold ">{transaction.description}</p>
                      <p className="text-sm text-gray-600 ">{transaction.type}</p>
                    </div>
                    <div className="text-right ">
                      <p className={`font-bold ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.amount >= 0 ? '+' : ''}{transaction.amount}
                      </p>
                      <p className="text-xs text-gray-400 ">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8 ">Aucune transaction</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSellerDetailPage; 