const { Seller, CreditTransaction } = require('../models');
const { Op } = require('sequelize');

// Configuration des coûts en crédits
const CREDIT_COSTS = {
  ADD_PRODUCT: 1,
  PROCESS_ORDER: 2,
  PIN_PRODUCT: 3,
  GENERATE_CUSTOMER_CARD: 2
};

// Configuration des packages de crédits
const CREDIT_PACKAGES = {
  BASIC: { credits: 50, price: 5000 }, // 5000 XOF pour 50 crédits
  STANDARD: { credits: 150, price: 12000 }, // 12000 XOF pour 150 crédits
  PREMIUM: { credits: 300, price: 20000 }, // 20000 XOF pour 300 crédits
  UNLIMITED: { credits: 1000, price: 50000 } // 50000 XOF pour 1000 crédits
};

class CreditService {
  /**
   * Vérifier si un vendeur a assez de crédits pour une action
   */
  static async hasEnoughCredits(sellerId, actionType) {
    try {
      const seller = await Seller.findByPk(sellerId);
      if (!seller) {
        throw new Error('Vendeur non trouvé');
      }

      const requiredCredits = CREDIT_COSTS[actionType];
      if (!requiredCredits) {
        throw new Error(`Type d'action non reconnu: ${actionType}`);
      }

      return {
        hasEnough: seller.credit_balance >= requiredCredits,
        currentBalance: seller.credit_balance,
        requiredCredits,
        remainingCredits: seller.credit_balance - requiredCredits
      };
    } catch (error) {
      throw new Error(`Erreur lors de la vérification des crédits: ${error.message}`);
    }
  }

  /**
   * Consommer des crédits pour une action
   */
  static async consumeCredits(sellerId, actionType, metadata = {}) {
    const transaction = await CreditTransaction.sequelize.transaction();
    
    try {
      const seller = await Seller.findByPk(sellerId, { transaction });
      if (!seller) {
        throw new Error('Vendeur non trouvé');
      }

      const requiredCredits = CREDIT_COSTS[actionType];
      if (!requiredCredits) {
        throw new Error(`Type d'action non reconnu: ${actionType}`);
      }

      if (seller.credit_balance < requiredCredits) {
        throw new Error(`Crédits insuffisants. Solde actuel: ${seller.credit_balance}, requis: ${requiredCredits}`);
      }

      const balanceBefore = seller.credit_balance;
      const balanceAfter = seller.credit_balance - requiredCredits;

      // Mettre à jour le solde du vendeur
      await seller.update({ credit_balance: balanceAfter }, { transaction });

      // Créer la transaction de consommation
      const creditTransaction = await CreditTransaction.create({
        seller_id: sellerId,
        type: 'consumption',
        action_type: actionType,
        amount: -requiredCredits,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description: this.getActionDescription(actionType),
        metadata,
        status: 'completed'
      }, { transaction });

      await transaction.commit();

      return {
        success: true,
        transaction: creditTransaction,
        newBalance: balanceAfter,
        consumedCredits: requiredCredits
      };
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Erreur lors de la consommation des crédits: ${error.message}`);
    }
  }

  /**
   * Acheter des crédits
   */
  static async purchaseCredits(sellerId, packageType, paymentMethod, paymentReference = null) {
    const transaction = await CreditTransaction.sequelize.transaction();
    
    try {
      const seller = await Seller.findByPk(sellerId, { transaction });
      if (!seller) {
        throw new Error('Vendeur non trouvé');
      }

      const creditPackage = CREDIT_PACKAGES[packageType];
      if (!creditPackage) {
        throw new Error(`Package de crédits non reconnu: ${packageType}`);
      }

      // Simuler l'appel au prestataire de paiement
      const paymentResult = await this.simulatePayment(paymentMethod, creditPackage.price, paymentReference);
      
      if (!paymentResult.success) {
        throw new Error(`Échec du paiement: ${paymentResult.error}`);
      }

      const balanceBefore = seller.credit_balance;
      const balanceAfter = seller.credit_balance + creditPackage.credits;

      // Mettre à jour le solde du vendeur
      await seller.update({ credit_balance: balanceAfter }, { transaction });

      // Créer la transaction d'achat
      const creditTransaction = await CreditTransaction.create({
        seller_id: sellerId,
        type: 'purchase',
        action_type: null,
        amount: creditPackage.credits,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        payment_method: paymentMethod,
        payment_reference: paymentResult.reference,
        description: `Achat de ${creditPackage.credits} crédits (${packageType})`,
        metadata: {
          packageType,
          price: creditPackage.price,
          paymentResult
        },
        status: 'completed'
      }, { transaction });

      await transaction.commit();

      return {
        success: true,
        transaction: creditTransaction,
        newBalance: balanceAfter,
        purchasedCredits: creditPackage.credits,
        paymentResult
      };
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Erreur lors de l'achat de crédits: ${error.message}`);
    }
  }

  /**
   * Ajouter des crédits bonus
   */
  static async addBonusCredits(sellerId, amount, reason = 'Bonus', metadata = {}) {
    const transaction = await CreditTransaction.sequelize.transaction();
    
    try {
      const seller = await Seller.findByPk(sellerId, { transaction });
      if (!seller) {
        throw new Error('Vendeur non trouvé');
      }

      if (amount <= 0) {
        throw new Error('Le montant du bonus doit être positif');
      }

      const balanceBefore = seller.credit_balance;
      const balanceAfter = seller.credit_balance + amount;

      // Mettre à jour le solde du vendeur
      await seller.update({ credit_balance: balanceAfter }, { transaction });

      // Créer la transaction de bonus
      const creditTransaction = await CreditTransaction.create({
        seller_id: sellerId,
        type: 'bonus',
        action_type: null,
        amount: amount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description: `Bonus: ${reason}`,
        metadata,
        status: 'completed'
      }, { transaction });

      await transaction.commit();

      return {
        success: true,
        transaction: creditTransaction,
        newBalance: balanceAfter,
        bonusCredits: amount
      };
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Erreur lors de l'ajout du bonus: ${error.message}`);
    }
  }

  /**
   * Obtenir le solde de crédits d'un vendeur
   */
  static async getCreditBalance(sellerId) {
    try {
      const seller = await Seller.findByPk(sellerId);
      if (!seller) {
        throw new Error('Vendeur non trouvé');
      }

      return {
        sellerId,
        balance: seller.credit_balance,
        sellerName: seller.name
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération du solde: ${error.message}`);
    }
  }

  /**
   * Obtenir l'historique des transactions d'un vendeur
   */
  static async getTransactionHistory(sellerId, limit = 50, offset = 0) {
    try {
      const transactions = await CreditTransaction.findAll({
        where: { seller_id: sellerId },
        order: [['created_at', 'DESC']],
        limit,
        offset,
        include: [{
          model: Seller,
          as: 'seller',
          attributes: ['id', 'name', 'phone_number']
        }]
      });

      const total = await CreditTransaction.count({
        where: { seller_id: sellerId }
      });

      return {
        transactions,
        total,
        limit,
        offset
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de l'historique: ${error.message}`);
    }
  }

  /**
   * Obtenir les statistiques de crédits d'un vendeur
   */
  static async getCreditStats(sellerId) {
    try {
      const seller = await Seller.findByPk(sellerId);
      if (!seller) {
        throw new Error('Vendeur non trouvé');
      }

      const stats = await CreditTransaction.findAll({
        where: { seller_id: sellerId },
        attributes: [
          'type',
          [CreditTransaction.sequelize.fn('SUM', CreditTransaction.sequelize.col('amount')), 'totalAmount'],
          [CreditTransaction.sequelize.fn('COUNT', CreditTransaction.sequelize.col('id')), 'count']
        ],
        group: ['type']
      });

      const totalPurchased = stats.find(s => s.type === 'purchase')?.dataValues.totalAmount || 0;
      const totalConsumed = Math.abs(stats.find(s => s.type === 'consumption')?.dataValues.totalAmount || 0);
      const totalBonus = stats.find(s => s.type === 'bonus')?.dataValues.totalAmount || 0;

      return {
        currentBalance: seller.credit_balance,
        totalPurchased,
        totalConsumed,
        totalBonus,
        netCredits: totalPurchased + totalBonus - totalConsumed,
        stats
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    }
  }

  /**
   * Obtenir les packages de crédits disponibles
   */
  static getAvailablePackages() {
    return CREDIT_PACKAGES;
  }

  /**
   * Obtenir les coûts des actions
   */
  static getActionCosts() {
    return CREDIT_COSTS;
  }

  /**
   * Simuler un appel de paiement (à remplacer par un vrai prestataire)
   */
  static async simulatePayment(paymentMethod, amount, reference = null) {
    // Simulation d'un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simuler un succès de paiement (dans la vraie vie, on appellerait Paydunya, CinetPay, etc.)
    const success = Math.random() > 0.1; // 90% de succès

    if (success) {
      return {
        success: true,
        reference: reference || `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        amount,
        paymentMethod,
        timestamp: new Date()
      };
    } else {
      return {
        success: false,
        error: 'Paiement refusé par le prestataire',
        reference: null
      };
    }
  }

  /**
   * Obtenir la description d'une action
   */
  static getActionDescription(actionType) {
    const descriptions = {
      ADD_PRODUCT: 'Ajout d\'un produit à la vitrine',
      PROCESS_ORDER: 'Traitement d\'une commande avec notification vocale',
      PIN_PRODUCT: 'Épinglage d\'un produit pendant le live',
      GENERATE_CUSTOMER_CARD: 'Génération d\'une fiche client'
    };

    return descriptions[actionType] || `Action: ${actionType}`;
  }
}

module.exports = CreditService; 