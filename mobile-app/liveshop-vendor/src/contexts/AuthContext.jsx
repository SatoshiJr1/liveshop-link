import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('liveshop_token');
      if (token) {
        const response = await apiService.getProfile();
        console.log('🔍 checkAuth - Données reçues:', response.data);
        console.log('🔍 checkAuth - Rôle:', response.data.role);
        
        setSeller(response.data);
        const isAdminUser = ['admin', 'superadmin'].includes(response.data.role);
        console.log('🔍 checkAuth - isAdmin:', isAdminUser);
        setIsAdmin(isAdminUser);
        
        // Charger les crédits seulement pour les vendeurs (pas les admins)
        if (!isAdminUser) {
          try {
            const creditsResponse = await apiService.getCredits();
            setCredits(creditsResponse.data);
          } catch (error) {
            console.error('Erreur lors du chargement des crédits:', error);
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error);
      localStorage.removeItem('liveshop_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (phoneNumber, pin) => {
    try {
      const response = await apiService.login(phoneNumber, pin);
      const { token, seller: sellerData } = response;
      
      localStorage.setItem('liveshop_token', token);
      setSeller(sellerData);
      const isAdminUser = ['admin', 'superadmin'].includes(sellerData.role);
      setIsAdmin(isAdminUser);
      
      // Charger les crédits seulement pour les vendeurs (pas les admins)
      if (!isAdminUser) {
        try {
          const creditsResponse = await apiService.getCredits();
          setCredits(creditsResponse.data);
        } catch (error) {
          console.error('Erreur lors du chargement des crédits:', error);
        }
      }
      
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (phoneNumber, name) => {
    try {
      const response = await apiService.register(phoneNumber, name);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('liveshop_token');
    setSeller(null);
    setCredits(null);
    setIsAdmin(false);
  };

  const refreshCredits = async () => {
    // Ne pas rafraîchir les crédits pour les admins
    if (isAdmin) return null;
    
    try {
      const response = await apiService.getCredits();
      setCredits(response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des crédits:', error);
      return null;
    }
  };

  const value = {
    seller,
    credits,
    loading,
    isAdmin,
    login,
    register,
    logout,
    refreshCredits,
    isAuthenticated: !!seller
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

