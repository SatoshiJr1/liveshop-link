import { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import notificationStore from './stores/notificationStore';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResetPinPage from './pages/ResetPinPage';
import LogoutPage from './pages/LogoutPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import OrdersPage from './pages/OrdersPage';
import StatsPage from './pages/StatsPage';
import LivesPage from './pages/LivesPage';
import { Toaster } from 'sonner';
import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import OrderDetailPage from './pages/OrderDetailPage';
import CreditsPage from './pages/CreditsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminSellersPage from './pages/AdminSellersPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminCreditsPage from './pages/AdminCreditsPage';
import AdminSellerDetailPage from './pages/AdminSellerDetailPage';
import AdminSecurityPage from './pages/AdminSecurityPage';
import PaymentSettingsPage from './pages/PaymentSettingsPage';
import { AdminRoute, SellerRoute, AuthRoute } from './components/ProtectedRoute';

const AppContent = () => {
  const { isAuthenticated, loading, isAdmin, token } = useAuth();

  // Initialiser le store de notifications
  useEffect(() => {
    console.log('🔔 App.jsx - Token disponible:', token ? 'OUI' : 'NON');
    if (token) {
      console.log('🔔 App.jsx - Initialisation NotificationStore avec token');
      notificationStore.setToken(token);
    } else {
      console.log('🔔 App.jsx - Déconnexion NotificationStore');
      notificationStore.setToken(null);
    }
  }, [token]);

  // Demander la permission pour les notifications push
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster 
        position="top-right"
        richColors
        closeButton
        duration={8000}
        expand={true}
        limit={3}
      />
      <Routes>
        {/* Routes publiques */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset-pin" element={<ResetPinPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/logout" element={<LogoutPage />} />
        
        {/* Routes protégées */}
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <Layout>
                <Routes>
                  {/* Routes Admin - Accessibles uniquement aux admins/superadmins */}
                  <Route path="admin" element={
                    <AdminRoute>
                      <AdminDashboardPage />
                    </AdminRoute>
                  } />
                  <Route path="admin/sellers" element={
                    <AdminRoute>
                      <AdminSellersPage />
                    </AdminRoute>
                  } />
                  <Route path="admin/sellers/:id" element={
                    <AdminRoute>
                      <AdminSellerDetailPage />
                    </AdminRoute>
                  } />
                  <Route path="admin/orders" element={
                    <AdminRoute>
                      <AdminOrdersPage />
                    </AdminRoute>
                  } />
                  <Route path="admin/products" element={
                    <AdminRoute>
                      <AdminProductsPage />
                    </AdminRoute>
                  } />
                  <Route path="admin/credits" element={
                    <AdminRoute>
                      <AdminCreditsPage />
                    </AdminRoute>
                  } />
                  <Route path="admin/security" element={
                    <AdminRoute>
                      <AdminSecurityPage />
                    </AdminRoute>
                  } />

                  {/* Routes Vendeurs - Accessibles uniquement aux vendeurs */}
                  <Route path="dashboard" element={
                    <SellerRoute>
                      <DashboardPage />
                    </SellerRoute>
                  } />
                  <Route path="products" element={
                    <SellerRoute>
                      <ProductsPage />
                    </SellerRoute>
                  } />
                  <Route path="orders" element={
                    <SellerRoute>
                      <OrdersPage />
                    </SellerRoute>
                  } />
                  <Route path="orders/:orderId" element={
                    <SellerRoute>
                      <OrderDetailPage />
                    </SellerRoute>
                  } />
                  <Route path="stats" element={
                    <SellerRoute>
                      <StatsPage />
                    </SellerRoute>
                  } />
                  <Route path="lives" element={
                    <SellerRoute>
                      <LivesPage />
                    </SellerRoute>
                  } />
                  <Route path="credits" element={
                    <SellerRoute>
                      <CreditsPage />
                    </SellerRoute>
                  } />
                  <Route path="payment-settings" element={
                    <SellerRoute>
                      <PaymentSettingsPage />
                    </SellerRoute>
                  } />

                  {/* Route par défaut - Redirection selon le rôle */}
                  <Route path="*" element={
                    isAdmin ? (
                      <Navigate to="/admin" replace />
                    ) : (
                      <Navigate to="/dashboard" replace />
                    )
                  } />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="App">
          <AppContent />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
