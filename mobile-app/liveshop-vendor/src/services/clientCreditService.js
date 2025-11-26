import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Service client pour gérer les crédits
 * Inclut la vérification des crédits avant les actions
 */
class ClientCreditService {
  /**
   * Acheter des crédits
   * @param {string} packageType - Type de package (BASIC, STANDARD, PREMIUM, UNLIMITED)
   * @param {string} paymentMethod - Méthode de paiement (WAVE, ORANGE_MONEY)
   * @param {string} phoneNumber - Numéro de téléphone pour le paiement
   * @returns {Promise<Object>} Résultat de l'achat
   */
  static async purchaseCredits(packageType, paymentMethod, phoneNumber) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/credits/purchase`,
        {
          packageType,
          paymentMethod,
          phoneNumber
        }
      );
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Récupérer le solde actuel de crédits
   * @returns {Promise<Object>} Informations sur les crédits
   */
  static async getBalance() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/credits/balance`);
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Récupérer les packages disponibles
   * @returns {Promise<Object>} Liste des packages avec pricing
   */
  static async getPackages() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/credits/packages`);
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Récupérer l'historique des transactions
   * @param {Object} options - Options de filtrage
   * @returns {Promise<Array>} Liste des transactions
   */
  static async getTransactionHistory(options = {}) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/credits/transactions`,
        { params: options }
      );
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Vérifier si l'utilisateur a assez de crédits pour une action
   * @param {string} actionType - Type d'action (ADD_PRODUCT, PROCESS_ORDER, etc.)
   * @returns {Promise<Object>} { hasCredits: boolean, currentBalance: number, requiredCredits: number }
   */
  static async checkCredits(actionType) {
    try {
      // Récupérer le solde actuel
      const balanceResponse = await axios.get(`${API_BASE_URL}/api/credits/balance`);
      const currentBalance = balanceResponse.data?.balance || 0;

      // Récupérer les coûts des actions (à ajouter dans l'API)
      const actionCosts = {
        ADD_PRODUCT: 1,
        PROCESS_ORDER: 2,
        PIN_PRODUCT: 3,
        GENERATE_CUSTOMER_CARD: 2
      };

      const requiredCredits = actionCosts[actionType] || 0;
      const hasCredits = currentBalance >= requiredCredits;

      return {
        hasCredits,
        currentBalance,
        requiredCredits,
        actionType,
        message: hasCredits
          ? `Vous avez ${currentBalance} crédits`
          : `Crédits insuffisants: vous en avez ${currentBalance} mais ${requiredCredits} sont nécessaires`
      };
    } catch (error) {
      console.error('Erreur lors de la vérification des crédits:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Consommer des crédits pour une action
   * @param {string} actionType - Type d'action
   * @returns {Promise<Object>} Résultat de la consommation
   */
  static async consumeCredits(actionType) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/credits/consume`,
        { actionType }
      );
      return response.data;
    } catch (error) {
      // Si 402 Payment Required, retourner l'information
      if (error.response?.status === 402) {
        return {
          success: false,
          insufficientCredits: true,
          error: error.response.data?.error,
          message: error.response.data?.message,
          creditsInfo: error.response.data?.creditsInfo
        };
      }
      throw this._handleError(error);
    }
  }

  /**
   * Utiliser des crédits pour effectuer une action
   * Combine vérification et consommation
   * @param {string} actionType - Type d'action
   * @returns {Promise<Object>} Résultat
   */
  static async useCreditsForAction(actionType) {
    try {
      // D'abord vérifier si on a les crédits
      const check = await this.checkCredits(actionType);
      if (!check.hasCredits) {
        return {
          success: false,
          insufficientCredits: true,
          currentBalance: check.currentBalance,
          requiredCredits: check.requiredCredits,
          actionType,
          message: `Crédits insuffisants pour ${actionType}`
        };
      }

      // Ensuite consommer les crédits
      const consumption = await this.consumeCredits(actionType);
      return consumption;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Gestion centralisée des erreurs
   * @private
   */
  static _handleError(error) {
    if (error.response) {
      // Erreur HTTP
      return {
        success: false,
        status: error.response.status,
        error: error.response.data?.error || 'Erreur serveur',
        message: error.response.data?.message || error.message
      };
    } else if (error.request) {
      // Pas de réponse du serveur
      return {
        success: false,
        error: 'Pas de réponse du serveur',
        message: 'Vérifiez votre connexion internet'
      };
    } else {
      // Erreur client
      return {
        success: false,
        error: 'Erreur client',
        message: error.message
      };
    }
  }
}

export default ClientCreditService;
