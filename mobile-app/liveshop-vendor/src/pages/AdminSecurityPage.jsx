import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Shield, 
  Users, 
  Activity,
  AlertTriangle,
  Lock,
  Eye,
  Settings,
  UserCheck,
  UserX,
  Clock,
  AlertCircle
} from 'lucide-react';
import apiService from '../services/api';

const AdminSecurityPage = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('all');

  useEffect(() => {
    loadSellers();
  }, []);

  const loadSellers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminSellers();
      setSellers(response.data.sellers);
    } catch (error) {
      console.error('Erreur lors du chargement des vendeurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (sellerId, newRole) => {
    try {
      await apiService.updateSeller(sellerId, { role: newRole });
      loadSellers();
    } catch (error) {
      console.error('Erreur lors du changement de rôle:', error);
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

  const filteredSellers = selectedRole === 'all' 
    ? sellers 
    : sellers.filter(seller => seller.role === selectedRole);

  const stats = {
    total: sellers.length,
    superadmin: sellers.filter(s => s.role === 'superadmin').length,
    admin: sellers.filter(s => s.role === 'admin').length,
    seller: sellers.filter(s => s.role === 'seller').length,
    active: sellers.filter(s => s.is_active).length,
    inactive: sellers.filter(s => !s.is_active).length
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

  return (
    <div className="container mx-auto p-4 space-y-6 ">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-700 rounded-lg p-6 text-white ">
        <div className="flex items-center justify-between ">
          <div>
            <h1 className="text-2xl font-bold mb-2 ">Sécurité & Rôles</h1>
            <p className="text-red-100 ">Gestion des rôles et surveillance de la sécurité</p>
          </div>
          <div className="text-right ">
            <div className="text-3xl font-bold ">{sellers.length}</div>
            <p className="text-red-100 text-sm ">utilisateurs total</p>
          </div>
        </div>
      </div>

      {/* Statistiques de sécurité */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 ">
        <Card>
          <CardContent className="p-4 ">
            <div className="flex items-center justify-between ">
              <div>
                <p className="text-sm text-gray-600 ">Total</p>
                <p className="text-2xl font-bold ">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500 " />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 ">
            <div className="flex items-center justify-between ">
              <div>
                <p className="text-sm text-gray-600 ">SuperAdmin</p>
                <p className="text-2xl font-bold text-purple-600 ">{stats.superadmin}</p>
              </div>
              <Shield className="w-8 h-8 text-purple-500 " />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 ">
            <div className="flex items-center justify-between ">
              <div>
                <p className="text-sm text-gray-600 ">Admin</p>
                <p className="text-2xl font-bold text-blue-600 ">{stats.admin}</p>
              </div>
              <Lock className="w-8 h-8 text-blue-500 " />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 ">
            <div className="flex items-center justify-between ">
              <div>
                <p className="text-sm text-gray-600 ">Vendeurs</p>
                <p className="text-2xl font-bold text-green-600 ">{stats.seller}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-500 " />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 ">
            <div className="flex items-center justify-between ">
              <div>
                <p className="text-sm text-gray-600 ">Actifs</p>
                <p className="text-2xl font-bold text-green-600 ">{stats.active}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-500 " />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 ">
            <div className="flex items-center justify-between ">
              <div>
                <p className="text-sm text-gray-600 ">Inactifs</p>
                <p className="text-2xl font-bold text-red-600 ">{stats.inactive}</p>
              </div>
              <UserX className="w-8 h-8 text-red-500 " />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-6 ">
          <div className="flex items-center space-x-4 ">
            <label className="text-sm font-medium ">Filtrer par rôle :</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="border rounded-lg px-3 py-2 "
            >
              <option value="all">Tous les rôles</option>
              <option value="superadmin">SuperAdmin</option>
              <option value="admin">Admin</option>
              <option value="seller">Vendeur</option>
            </select>

            <Button onClick={loadSellers} variant="outline" className="flex items-center space-x-2 ">
              <Settings className="w-4 h-4 " />
              <span>Actualiser</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des utilisateurs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 ">
            <Shield className="w-5 h-5 " />
            <span>Gestion des rôles ({filteredSellers.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 ">
            {filteredSellers.map((sellerItem) => (
              <div key={sellerItem.id} className="border rounded-lg p-4 hover:bg-gray-50 ">
                <div className="flex items-center justify-between ">
                  <div className="flex items-center space-x-4 ">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold ">
                      {sellerItem.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 ">
                        <h3 className="font-semibold ">{sellerItem.name}</h3>
                        <Badge className={getRoleColor(sellerItem.role)}>
                          {sellerItem.role}
                        </Badge>
                        <Badge className={getStatusColor(sellerItem.is_active)}>
                          {sellerItem.is_active ? 'Actif' : 'Inactif'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 ">{sellerItem.phone_number}</p>
                      <p className="text-xs text-gray-400 ">ID: {sellerItem.public_link_id}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ">
                    <div className="text-right ">
                      <p className="text-sm font-semibold ">{sellerItem.credit_balance} crédits</p>
                      <p className="text-xs text-gray-500 ">
                        {new Date(sellerItem.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex flex-col space-y-1 ">
                      <select
                        value={sellerItem.role}
                        onChange={(e) => handleRoleChange(sellerItem.id, e.target.value)}
                        className="text-xs border rounded px-2 py-1 "
                        disabled={sellerItem.phone_number === '+221771842787'}
                      >
                        <option value="seller">Vendeur</option>
                        <option value="admin">Admin</option>
                        <option value="superadmin">SuperAdmin</option>
                      </select>
                      
                      <Button
                        size="sm"
                        variant={sellerItem.is_active ? "destructive" : "default"}
                        onClick={() => handleRoleChange(sellerItem.id, { is_active: !sellerItem.is_active })}
                        disabled={sellerItem.phone_number === '+221771842787'}
                      >
                        {sellerItem.is_active ? 'Suspendre' : 'Activer'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alertes de sécurité */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 ">
            <AlertTriangle className="w-5 h-5 " />
            <span>Alertes de sécurité</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 ">
            {sellers.filter(s => s.credit_balance < 10).map(seller => (
              <div key={seller.id} className="flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg ">
                <AlertCircle className="w-5 h-5 text-red-500 " />
                <div>
                  <p className="font-medium text-red-800 ">
                    {seller.name} - Crédits faibles ({seller.credit_balance})
                  </p>
                  <p className="text-sm text-red-600 ">Vendeur avec peu de crédits</p>
                </div>
              </div>
            ))}

            {sellers.filter(s => !s.is_active).map(seller => (
              <div key={seller.id} className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg ">
                <UserX className="w-5 h-5 text-yellow-500 " />
                <div>
                  <p className="font-medium text-yellow-800 ">
                    {seller.name} - Compte suspendu
                  </p>
                  <p className="text-sm text-yellow-600 ">Vendeur inactif</p>
                </div>
              </div>
            ))}

            {sellers.filter(s => s.credit_balance < 10).length === 0 && 
             sellers.filter(s => !s.is_active).length === 0 && (
              <div className="text-center py-8 text-gray-500 ">
                <Shield className="w-12 h-12 mx-auto mb-4 text-green-500 " />
                <p>Aucune alerte de sécurité</p>
                <p className="text-sm ">Tous les comptes sont en bon état</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSecurityPage; 