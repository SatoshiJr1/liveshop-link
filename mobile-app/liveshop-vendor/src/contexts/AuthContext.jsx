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
  // const [credits, setCredits] = useState(null); // Désactivé temporairement
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('liveshop_token');
      
      if (token) {
        console.log('🔍 checkAuth - Token trouvé, vérification du profil...');
        try {
          const response = await apiService.getProfile();
          console.log('🔍 checkAuth - Données reçues:', response.data);
          console.log('🔍 checkAuth - Rôle:', response.data.role);
          
          setSeller(response.data);
          const isAdminUser = ['admin', 'superadmin'].includes(response.data.role);
          console.log('🔍 checkAuth - isAdmin:', isAdminUser);
          setIsAdmin(isAdminUser);
          
          // Charger les crédits seulement pour les vendeurs (pas les admins)
          // if (!isAdminUser) {
          //   try {
          //     const creditsResponse = await apiService.getCredits();
          //     setCredits(creditsResponse.data);
          //   } catch (error) {
          //     console.error('Erreur lors du chargement des crédits:', error);
          //   }
          // } // Désactivé temporairement
        } catch (profileError) {
          console.error('Erreur profil, déconnexion:', profileError);
          localStorage.removeItem('liveshop_token');
          setSeller(null);
          // setCredits(null); // Désactivé temporairement
          setIsAdmin(false);
        }
      } else {
        console.log('🔍 checkAuth - Aucun token trouvé');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error);
      localStorage.removeItem('liveshop_token');
      setSeller(null);
      // setCredits(null); // Désactivé temporairement
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (phoneNumber, pin, rememberMe = false) => {
    try {
      const response = await apiService.login(phoneNumber, pin);
      const { token, seller: sellerData } = response;
      
      localStorage.setItem('liveshop_token', token);
      
      // Sauvegarder l'état "Se souvenir de moi"
      if (rememberMe) {
        localStorage.setItem('remember_me', 'true');
        localStorage.setItem('remembered_phone', phoneNumber);
      } else {
        localStorage.removeItem('remember_me');
        localStorage.removeItem('remembered_phone');
      }
      
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

  const logout = (keepRememberMe = false) => {
    localStorage.removeItem('liveshop_token');
    
    // Si on ne garde pas "Se souvenir", supprimer aussi les données de connexion
    if (!keepRememberMe) {
      localStorage.removeItem('remembered_phone');
      localStorage.removeItem('remember_me');
    }
    
    setSeller(null);
    // setCredits(null); // Désactivé temporairement
    setIsAdmin(false);
  };

  // const refreshCredits = async () => {
  //   // Ne pas rafraîchir les crédits pour les admins
  //   if (isAdmin) return null;
  //   
  //   try {
  //     const response = await apiService.getCredits();
  //     setCredits(response.data);
  //     return response.data;
  //   } catch (error) {
  //     console.error('Erreur lors du rafraîchissement des crédits:', error);
  //     return null;
  //   }
  // }; // Désactivé temporairement

  // Récupérer le token depuis localStorage
  const token = localStorage.getItem('liveshop_token');

  const value = {
    seller,
    // credits, // Désactivé temporairement
    loading,
    isAdmin,
    token, // Ajouter le token
    login,
    register,
    logout,
    // refreshCredits, // Désactivé temporairement
    isAuthenticated: !!seller
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

