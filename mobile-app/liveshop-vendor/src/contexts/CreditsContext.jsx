import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import ClientCreditService from '../services/clientCreditService';

/**
 * Contexte global pour les crédits
 * Permet à toute l'application d'accéder aux informations de crédits
 */
const CreditsContext = createContext();

/**
 * Provider pour le contexte des crédits
 */
export const CreditsProvider = ({ children }) => {
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [moduleInfo, setModuleInfo] = useState({
    isEnabled: true,
    mode: 'paid'
  });
  const [insufficientCreditsModal, setInsufficientCreditsModal] = useState({
    isOpen: false,
    currentBalance: 0,
    requiredCredits: 0,
    actionName: 'cette action'
  });

  /**
   * Charger le solde
   */
  const loadBalance = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await ClientCreditService.getBalance();
      setBalance(data?.balance || 0);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement du solde:', err);
      setError(err?.message || 'Erreur lors du chargement du solde');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Charger les informations du module
   */
  const loadModuleInfo = useCallback(async () => {
    try {
      const data = await ClientCreditService.getPackages();
      setModuleInfo({
        isEnabled: data?.isEnabled || true,
        mode: data?.mode || 'paid',
        message: data?.message || ''
      });
    } catch (err) {
      console.error('Erreur lors du chargement des infos du module:', err);
    }
  }, []);

  /**
   * Afficher le modal de crédits insuffisants
   */
  const showInsufficientCreditsModal = useCallback((currentBalance, requiredCredits, actionName = 'cette action') => {
    setInsufficientCreditsModal({
      isOpen: true,
      currentBalance,
      requiredCredits,
      actionName
    });
  }, []);

  /**
   * Fermer le modal
   */
  const closeInsufficientCreditsModal = useCallback(() => {
    setInsufficientCreditsModal(prev => ({
      ...prev,
      isOpen: false
    }));
  }, []);

  /**
   * Utiliser des crédits pour une action
   * Gère automatiquement le modal si insuffisant
   */
  const useCreditsForAction = useCallback(async (actionType, actionName = 'cette action') => {
    try {
      const result = await ClientCreditService.useCreditsForAction(actionType);
      
      // Si le module est désactivé, success = true
      if (result.success) {
        await loadBalance();
        return result;
      }
      
      if (!result.success && result.insufficientCredits) {
        // Afficher le modal
        showInsufficientCreditsModal(
          result.currentBalance,
          result.requiredCredits,
          actionName
        );
        return {
          success: false,
          insufficientCredits: true,
          currentBalance: result.currentBalance,
          requiredCredits: result.requiredCredits
        };
      }
      
      if (result.success) {
        // Rafraîchir le solde
        await loadBalance();
      }
      
      return result;
    } catch (err) {
      console.error('Erreur lors de l\'utilisation des crédits:', err);
      throw err;
    }
  }, [showInsufficientCreditsModal, loadBalance]);

  /**
   * Acheter des crédits
   */
  const buyCredits = useCallback(async (packageType, paymentMethod, phoneNumber) => {
    try {
      setIsLoading(true);
      const result = await ClientCreditService.purchaseCredits(
        packageType,
        paymentMethod,
        phoneNumber
      );
      
      if (result.success) {
        setBalance(result.data?.newBalance || 0);
        closeInsufficientCreditsModal();
      }
      
      return result;
    } catch (err) {
      setError(err?.message || 'Erreur lors de l\'achat');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [closeInsufficientCreditsModal]);

  /**
   * Initialiser au montage
   */
  useEffect(() => {
    loadBalance();
    loadModuleInfo();
  }, [loadBalance, loadModuleInfo]);

  const value = {
    // État
    balance,
    isLoading,
    error,
    moduleInfo,
    insufficientCreditsModal,

    // Méthodes
    loadBalance,
    loadModuleInfo,
    useCreditsForAction,
    buyCredits,
    showInsufficientCreditsModal,
    closeInsufficientCreditsModal,
    
    // Utilitaires
    clearError: () => setError(null)
  };

  return (
    <CreditsContext.Provider value={value}>
      {children}
    </CreditsContext.Provider>
  );
};

/**
 * Hook personnalisé pour utiliser le contexte des crédits
 */
export const useCreditsContext = () => {
  const context = useContext(CreditsContext);
  if (!context) {
    throw new Error('useCreditsContext doit être utilisé dans un CreditsProvider');
  }
  return context;
};

export default CreditsContext;
