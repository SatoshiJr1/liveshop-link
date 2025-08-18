import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import webSocketService from '../services/websocket';
import voiceNotification from '../utils/voiceNotification';
import apiService from '../services/api';
import { toast } from 'sonner';
import { Bell, X, LogOut, Menu, Sun, Moon } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from '../contexts/ThemeContext';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Home, 
  Package, 
  ShoppingBag, 
  BarChart3, 
  Store,
  Coins,
  Shield,
  Users,
  Lock,
  CreditCard
} from 'lucide-react';
import NotificationToast from './NotificationToast';
import ThemeToggle from './ThemeToggle';

const Layout = ({ children }) => {

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { seller, credits, refreshCredits, isAdmin } = useAuth();
  
  const navigation = isAdmin ? [
    // Navigation pour SuperAdmin
    { id: 'admin', name: 'Tableau de bord', icon: Home, path: '/admin' },
    { id: 'sellers', name: 'Gestion Vendeurs', icon: Users, path: '/admin/sellers' },
    { id: 'orders', name: 'Supervision Commandes', icon: ShoppingBag, path: '/admin/orders' },
    { id: 'products', name: 'Modération Produits', icon: Package, path: '/admin/products' },
    { id: 'credits', name: 'Gestion Crédits', icon: Coins, path: '/admin/credits' },
    { id: 'security', name: 'Sécurité', icon: Lock, path: '/admin/security' },
  ] : [
    // Navigation pour vendeurs normaux (sans crédits - accessible via header)
    { id: 'dashboard', name: 'Accueil', icon: Home, path: '/dashboard' },
    { id: 'products', name: 'Produits', icon: Package, path: '/products' },
    { id: 'orders', name: 'Commandes', icon: ShoppingBag, path: '/orders' },
    { id: 'stats', name: 'Stats', icon: BarChart3, path: '/stats' },
    { id: 'lives', name: 'Lives', icon: Store, path: '/lives' },
    // Paiements retiré de la barre de navigation; accessible via menu
  ];

  // Rafraîchir les crédits périodiquement (seulement pour les vendeurs)
  useEffect(() => {
    if (!seller || isAdmin) return;
    
    const interval = setInterval(refreshCredits, 30000);
    
    return () => clearInterval(interval);
  }, [seller, refreshCredits, isAdmin]);

  // Initialiser les notifications WebSocket
  useEffect(() => {
    if (!seller) return;

    const initializeNotifications = async () => {
      try {
        // Se connecter au WebSocket
        await webSocketService.connect(localStorage.getItem('liveshop_token'));
        
        // Écouter les nouvelles commandes
        webSocketService.onNewOrder((data) => {
          console.log('🛒 Nouvelle commande reçue dans Layout:', data);
          
          const notification = {
            id: Date.now(),
            type: 'new_order',
            title: `Nouvelle commande #${data.order?.id}`,
            message: `Nouvelle commande de ${data.order?.customer_name} - ${data.order?.total_price?.toLocaleString()} FCFA`,
            order: data.order,
            timestamp: new Date()
          };
          
          // Ajouter la notification à la liste
          setNotifications(prev => [notification, ...prev.slice(0, 4)]);
          
          // Afficher un toast
          toast.success(`Nouvelle commande #${data.order?.id}`, {
            description: `${data.order?.customer_name} - ${data.order?.total_price?.toLocaleString()} FCFA`,
            duration: 8000,
            action: {
              label: 'Voir',
              onClick: () => navigate('/orders')
            }
          });
          
          // Jouer un son de notification
          playNotificationSound();
          
          // Notification vocale
          try {
            console.log('🔊 Tentative d\'annonce vocale dans Layout...');
            voiceNotification.announceNewOrder(data.order || data).then(() => {
              console.log('✅ Annonce vocale terminée dans Layout');
            }).catch((error) => {
              console.error('❌ Erreur dans l\'annonce vocale Layout:', error);
            });
          } catch (error) {
            console.error('❌ Erreur notification vocale Layout:', error);
          }
        });

        // Écouter les mises à jour de statut
        webSocketService.onOrderStatusUpdate((data) => {
          console.log('📊 Mise à jour de statut reçue dans Layout:', data);
          
          const notification = {
            id: Date.now(),
            type: 'order_status_update',
            title: `Commande #${data.id} mise à jour`,
            message: `Statut: ${data.status}`,
            order: data,
            timestamp: new Date()
          };
          
          setNotifications(prev => [notification, ...prev.slice(0, 4)]);
          
          toast.info(`Commande #${data.id} mise à jour`, {
            description: `Nouveau statut: ${data.status}`,
            duration: 5000
          });
        });

        // Écouter les notifications générales
        webSocketService.onNotification((data) => {
          console.log('🔔 Notification générale reçue dans Layout:', data);
          
          const notification = {
            id: Date.now(),
            type: 'notification',
            title: data.title || 'Notification',
            message: data.message || 'Nouvelle notification',
            data: data,
            timestamp: new Date()
          };
          
          setNotifications(prev => [notification, ...prev.slice(0, 4)]);
          
          toast(data.title || 'Notification', {
            description: data.message,
            duration: 5000
          });
        });

        console.log('✅ Notifications WebSocket initialisées');
      } catch (error) {
        console.error('❌ Erreur initialisation notifications:', error);
      }
    };

    initializeNotifications();

    // Cleanup à la déconnexion
    return () => {
      webSocketService.off('new_order');
      webSocketService.off('order_status_update');
      webSocketService.off('notification');
    };
  }, [seller, navigate]);

  // Jouer un son de notification
  const playNotificationSound = () => {
    try {
      // Créer un audio context pour jouer un son simple
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch {
      console.log('Son de notification non supporté');
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const handleViewOrder = (orderId) => {
    navigate(`/orders/${orderId}`);
    setShowNotifications(false);
  };

  const handleCreditsClick = () => {
    navigate('/credits');
  };

  const handleCloseNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  // Fonction pour obtenir le nom d'affichage selon la taille d'écran
  const getDisplayName = (item) => {
    if (isAdmin) return item.name;
    
    // Noms courts pour mobile, longs pour desktop
    const shortNames = {
      'dashboard': 'Accueil',
      'products': 'Produits', 
      'orders': 'Commandes',
      'stats': 'Stats',
      'lives': 'Lives'
    };
    
    return shortNames[item.id] || item.name;
  };

  // Détermine la page active à partir de l'URL
  const getActivePage = () => {
    const path = location.pathname.replace(/^\//, '');
    const found = navigation.find(item => path.startsWith(item.id));
    return found ? found.id : 'dashboard';
  };
  const activePage = getActivePage();

  // Fermer le menu mobile quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMobileMenu && !event.target.closest('.mobile-menu')) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMobileMenu]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-semibold text-gray-900 dark:text-white truncate">LiveShop Link</h1>
            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
              {isAdmin ? 'Espace Administration' : seller?.name}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-2">
          {/* Indicateur de crédits - Optimisé pour mobile */}
          {credits && !isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCreditsClick}
              className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white border-0 shadow-lg font-bold px-2 py-1"
            >
              <Coins className="w-4 h-4 mr-1" />
              <span className="text-xs font-medium hidden sm:inline">{credits.balance} crédits</span>
              <span className="text-xs font-medium sm:hidden">{credits.balance}</span>
            </Button>
          )}
          {/* Bouton notifications */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notifications.length > 9 ? '9+' : notifications.length}
              </span>
            )}
          </Button>
          {/* Bouton thème */}
          <ThemeToggle />
          
          {/* Menu mobile avec déconnexion */}
          <div className="relative mobile-menu">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="relative"
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            {/* Menu déroulant mobile */}
            {showMobileMenu && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <div className="py-2">
                  <button
                    onClick={() => {
                      navigate('/credits');
                      setShowMobileMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  >
                    <Coins className="w-4 h-4 mr-2" />
                    Gérer les crédits
                  </button>
                  <button
                    onClick={() => {
                      navigate('/payment-settings');
                      setShowMobileMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Paramètres de paiement
                  </button>
                  <button
                    onClick={() => {
                      navigate('/logout');
                      setShowMobileMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Se déconnecter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Sidebar - Caché sur mobile */}
      <div className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:bg-white lg:dark:bg-gray-800 lg:shadow-xl lg:h-screen">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Store className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">LiveShop Link</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isAdmin ? 'Espace Administration' : 'Espace Vendeur'}
              </p>
            </div>
          </div>
        </div>

        {/* Seller Info */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <span className="text-white font-bold text-xl">
                    {seller?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{seller?.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{seller?.phone_number}</p>
                <div className="mt-3 px-3 py-2 bg-white dark:bg-gray-700 text-purple-700 dark:text-purple-300 text-xs rounded-full shadow-sm border border-purple-200 dark:border-purple-600">
                  ID: {seller?.public_link_id}
                </div>
                {credits && !isAdmin && (
                  <div className="mt-3 px-4 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white text-sm rounded-xl shadow-lg border-0 flex items-center justify-center font-bold">
                    <Coins className="w-4 h-4 mr-2" />
                    {credits.balance} crédits
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <li key={item.id}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start h-12 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg hover:from-purple-700 hover:to-blue-700' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-purple-600 dark:hover:text-purple-400'
                    }`}
                    onClick={() => handleNavigation(item.path)}
                  >
                    <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : ''}`} />
                    <span className="font-medium">{isAdmin ? item.name : (item.id === 'dashboard' ? 'Tableau de bord' : item.id === 'stats' ? 'Statistiques' : item.name)}</span>
                  </Button>
                </li>
              );
            })}
          </ul>
          
          {/* Bouton thème dans la sidebar */}
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between px-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Thème</span>
              <ThemeToggle />
            </div>
          </div>
          
          {/* Bouton crédits pour vendeurs (sidebar desktop) */}
          {!isAdmin && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <Button
                variant="ghost"
                className="w-full justify-start h-12 rounded-xl text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-300 transition-all duration-200"
                onClick={handleCreditsClick}
              >
                <Coins className="w-5 h-5 mr-3" />
                <span className="font-medium">Gérer les crédits</span>
              </Button>
            </div>
          )}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 mt-auto">
          <Button
            variant="ghost"
            className="w-full justify-start h-12 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200"
            onClick={() => navigate('/logout')}
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span className="font-medium">Se déconnecter</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="pt-16 lg:pt-0 lg:ml-72">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 lg:pb-6">
            {children}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="flex items-center justify-around px-1 py-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-all duration-200 min-w-0 flex-1 ${
                  isActive
                    ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'
                    : 'text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400'
                }`}
              >
                <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-purple-600 dark:text-purple-400' : ''}`} />
                <span className="text-[10px] font-medium truncate leading-tight">{getDisplayName(item)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications Panel - Mobile */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowNotifications(false)} />
          <div className="absolute top-0 right-0 w-80 h-full bg-white dark:bg-gray-800 shadow-xl">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold dark:text-white">Notifications</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <div className="overflow-y-auto h-full">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p>Aucune notification</p>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {notifications.map((notification) => (
                    <NotificationToast
                      key={notification.id}
                      notification={notification}
                      onClose={() => handleCloseNotification(notification.id)}
                      onViewOrder={handleViewOrder}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notifications Panel - Desktop */}
      <div className="hidden lg:block">
        {notifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onClose={() => handleCloseNotification(notification.id)}
            onViewOrder={handleViewOrder}
          />
        ))}
      </div>
    </div>
  );
};

export default Layout;

