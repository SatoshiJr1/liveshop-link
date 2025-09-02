import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { LogOut, X, User } from 'lucide-react';
import Checkbox from '@/components/ui/checkbox';

const LogoutPage = () => {
  const { seller, logout } = useAuth();
  const navigate = useNavigate();
  const [keepRememberMe, setKeepRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    
    // Si l'utilisateur ne veut pas garder "Se souvenir", supprimer les données
    if (!keepRememberMe) {
      localStorage.removeItem('remembered_phone');
      localStorage.removeItem('remember_me');
    }
    
    // Attendre un peu pour l'animation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    logout();
    navigate('/login');
    setLoading(false);
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4 ">
      <div className="w-full max-w-md ">
        <div className="text-center mb-8 ">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 ">
            <User className="w-8 h-8 text-purple-600 " />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 ">LiveShop Link</h1>
          <p className="text-purple-100 ">Espace Vendeur</p>
        </div>
        
        <Card className="shadow-2xl ">
          <CardHeader className="text-center ">
            <CardTitle className="text-2xl flex items-center justify-center gap-2 ">
              <LogOut className="w-6 h-6 text-red-500 " />
              Déconnexion
            </CardTitle>
            <CardDescription>
              Êtes-vous sûr de vouloir vous déconnecter ?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 ">
            {/* Informations utilisateur */}
            <div className="bg-gray-50 rounded-lg p-4 ">
              <div className="flex items-center gap-3 ">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center ">
                  <User className="w-5 h-5 text-purple-600 " />
                </div>
                <div>
                  <p className="font-medium text-gray-900 ">{seller?.name}</p>
                  <p className="text-sm text-gray-500 ">{seller?.phone_number}</p>
                </div>
              </div>
            </div>

            {/* Option "Se souvenir" */}
            <div className="space-y-3 ">
              <Label className="text-sm font-medium text-gray-700 ">
                Options de déconnexion
              </Label>
              
              <Checkbox
                id="keep-remember-me"
                checked={keepRememberMe}
                onChange={setKeepRememberMe}
                label="Garder mes informations de connexion"
              />
              
              <p className="text-xs text-gray-500 ">
                {keepRememberMe 
                  ? "Votre numéro de téléphone sera conservé pour la prochaine connexion."
                  : "Vos informations de connexion seront supprimées."
                }
              </p>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-3 ">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1 "
                disabled={loading}
              >
                <X className="w-4 h-4 mr-2 " />
                Annuler
              </Button>
              
              <Button
                onClick={handleLogout}
                className="flex-1 bg-red-600 hover:bg-red-700 "
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 "></div>
                    Déconnexion...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4 mr-2 " />
                    Se déconnecter
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center mt-6 ">
          <p className="text-purple-100 text-sm ">
            © 2025 LiveShop Link - Votre solution de live commerce
          </p>
        </div>
      </div>
    </div>
  );
};

export default LogoutPage; 