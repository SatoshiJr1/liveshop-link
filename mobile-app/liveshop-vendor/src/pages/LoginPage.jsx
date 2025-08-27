import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import RegisterSteps from '@/components/RegisterSteps';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Store, Lock, ArrowRight, Check, Phone, Lightbulb, User } from 'lucide-react';
import PinInput from '@/components/ui/PinInput';

const LoginPage = () => {
  const { login, register, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [activeTab, setActiveTab] = useState('login'); // 'login' ou 'register'
  const navigate = useNavigate();

  // Fonction pour formater le numéro de téléphone
  const formatPhoneNumber = (value) => {
    // Supprimer tous les caractères non numériques sauf le +
    let cleaned = value.replace(/[^\d+]/g, '');
    
    // Si ça ne commence pas par +221, l'ajouter automatiquement
    if (!cleaned.startsWith('+221')) {
      // Si ça commence par 221, ajouter le +
      if (cleaned.startsWith('221')) {
        cleaned = '+' + cleaned;
      } else {
        // Sinon, ajouter +221
        cleaned = '+221' + cleaned.replace(/^\+/, '');
      }
    }
    
    // Limiter à 13 caractères (+221 + 9 chiffres)
    if (cleaned.length > 13) {
      cleaned = cleaned.substring(0, 13);
    }
    
    return cleaned;
  };

  // Fonction pour gérer le changement du numéro de téléphone
  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  // Fonction pour obtenir l'affichage du numéro (sans le préfixe pour l'input)
  const getDisplayPhone = () => {
    if (phone.startsWith('+221')) {
      return phone.substring(4); // Retourne seulement les chiffres après +221
    }
    return phone;
  };

  // Fonction pour obtenir le numéro complet
  const getFullPhone = () => {
    if (phone.startsWith('+221')) {
      return phone;
    }
    return '+221' + phone;
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    
    // Charger les données sauvegardées si "Se souvenir" était activé
    const savedPhone = localStorage.getItem('remembered_phone');
    const savedRememberMe = localStorage.getItem('remember_me') === 'true';
    
    if (savedRememberMe && savedPhone) {
      setPhone(savedPhone);
      setRememberMe(true);
    }
    const prefill = localStorage.getItem('prefill_phone');
    if (prefill) {
      setActiveTab('login');
      setPhone(prefill);
      try { localStorage.removeItem('prefill_phone'); } catch {}
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    const fullPhone = getFullPhone();
    
    if (!fullPhone.trim() || !/^\+\d{8,15}$/.test(fullPhone.trim())) {
      setError('Veuillez saisir votre numéro au format international (ex: +221771234567)');
      return;
    }
    if (!/^[0-9]{4}$/.test(pin)) {
      setError('Veuillez saisir votre code PIN à 4 chiffres');
      return;
    }
    setLoading(true);
    setError('');
    
    // Sauvegarder les données si "Se souvenir" est activé
    if (rememberMe) {
      localStorage.setItem('remembered_phone', fullPhone.trim());
      localStorage.setItem('remember_me', 'true');
    } else {
      localStorage.removeItem('remembered_phone');
      localStorage.removeItem('remember_me');
    }
    
    const result = await login(fullPhone.trim(), pin);
    if (!result.success) {
      setError(result.error || 'Numéro ou code PIN incorrect');
    } else {
      navigate('/dashboard');
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    // Rediriger vers la page d'inscription dédiée
    navigate('/register');
  };

  const handleForgot = () => {
    window.location.href = '/reset-pin';
  };

  const handleBackToLogin = () => {
    setActiveTab('login');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-blue-600 flex items-center justify-center p-4 ">
      <div className="w-full max-w-md ">
        {/* Header avec logo */}
        <div className="text-center mb-8 ">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4  ">
            <Store className="w-8 h-8 text-purple-600 " />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 ">LiveShop Link</h1>
          <p className="text-purple-100 ">Espace Vendeur</p>
        </div>

        {/* Carte principale */}
        <Card className="shadow-2xl border-0 ">
          <CardHeader className="text-center pb-4 ">
            <CardTitle className="text-2xl font-bold text-gray-900 ">Bienvenue</CardTitle>
            <CardDescription className="text-gray-600 ">
              Connectez-vous ou créez votre compte vendeur
            </CardDescription>
          </CardHeader>

          {/* Onglets */}
          <div className="px-6 pb-4 ">
            <div className="flex bg-gray-100 rounded-lg p-1 ">
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'login'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Connexion
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'register'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Inscription
              </button>
            </div>
          </div>

          <CardContent className="px-6 pb-6 ">
            {activeTab === 'login' ? (
              // Formulaire de connexion
              <>
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm ">
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleLogin} className="space-y-4 ">
                  <div className="space-y-2 ">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700 ">
                      Numéro de téléphone
                    </Label>
                    <div className="relative ">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
                        <Phone className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-500 text-sm font-medium">+221</span>
                      </div>
                      <input
                        id="phone"
                        type="tel"
                        placeholder="XX XXX XX XX"
                        value={getDisplayPhone()}
                        onChange={handlePhoneChange}
                        className="w-full pl-20 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white "
                        autoComplete="off"
                        required
                      />
                    </div>
                    
                  </div>

                  <div className="space-y-2 ">
                    <Label htmlFor="pin" className="text-sm font-medium text-gray-700">
                      Code PIN
                    </Label>
                    <div className="flex justify-center ">
                      <PinInput value={pin} onChange={setPin} length={4} />
                    </div>
                  </div>
                  
                  {/* Option "Se souvenir" */}
                  <div className="flex items-center space-x-2 ">
                    <button
                      type="button"
                      onClick={() => setRememberMe(!rememberMe)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        rememberMe 
                          ? 'bg-purple-600 border-purple-600' 
                          : 'border-gray-300 hover:border-purple-400'
                      }`}
                    >
                      {rememberMe && <Check className="w-3 h-3 text-white " />}
                    </button>
                    <Label 
                      className="text-sm text-gray-600 cursor-pointer "
                      onClick={() => setRememberMe(!rememberMe)}
                    >
                      Se souvenir de moi
                    </Label>
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-lg font-medium "
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 "></div>
                        Connexion...
                      </>
                    ) : (
                      <>
                        Se connecter
                        <ArrowRight className="ml-2 h-4 w-4 " />
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-4   flex  justify-between items-center ">
                  <button
                    type="button"
                    onClick={handleForgot}
                    className="text-sm text-blue-600 hover:underline block "
                  >
                    Mot de passe oublié ?
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/register')}
                    className="text-sm text-purple-600 hover:underline block "
                  >
                    Créer un compte
                  </button>
                </div>
              </>
            ) : (
              // Formulaire d'inscription
              <>
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm ">
                    {error}
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 ">
                  <div className="flex items-center justify-center mb-2 ">
                    <Lightbulb className="w-5 h-5 text-yellow-500 mr-2 " />
                  </div>
                  <p className="text-sm text-blue-800 ">
                    Nouveau sur LiveShop Link ? Suivez les 3 étapes ci-dessous pour créer votre compte.
                  </p>
                </div>

                {/* Composant des 3 étapes d'inscription */}
                <RegisterSteps onDone={(createdPhone) => { try { if (createdPhone) localStorage.setItem('prefill_phone', createdPhone); } catch {} setActiveTab('login'); const prefill = localStorage.getItem('prefill_phone'); if (prefill) setPhone(prefill); }} />

                <div className="mt-4 text-center ">
                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    className="text-sm text-purple-600 hover:underline "
                  >
                    Retour à la connexion
                  </button>
                </div>
              </>
            )}
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

export default LoginPage;

