const axios = require('axios');

/**
 * Service de notifications WhatsApp pour LiveShop Link
 * Utilise l'API Nextéranga pour envoyer des messages professionnels
 */
class WhatsAppNotificationService {
  constructor() {
    this.apiUrl = process.env.NEXTERANGA_API_URL || 'https://wa.nexteranga.com/send';
    this.secret = process.env.NEXTERANGA_SECRET || 'e9c64f0193ce38099a5e59cfe15faa107325d92fddc655007f62914170e17645';
    this.appName = 'LiveShop Link';
    this.appUrl = process.env.FRONTEND_URL || 'https://space.livelink.store';
    this.enabled = process.env.WHATSAPP_NOTIFICATIONS_ENABLED !== 'false';
  }

  /**
   * Normalise un numéro de téléphone pour l'API (sans le +)
   */
  normalizePhone(phone) {
    if (!phone) return null;
    return String(phone).replace(/^\+/, '').replace(/\s/g, '');
  }

  /**
   * Envoie un message WhatsApp
   */
  async sendMessage(phone, message) {
    if (!this.enabled) {
      console.log('📵 Notifications WhatsApp désactivées');
      return { success: false, reason: 'disabled' };
    }

    const normalizedPhone = this.normalizePhone(phone);
    if (!normalizedPhone) {
      console.warn('⚠️ Numéro de téléphone invalide:', phone);
      return { success: false, reason: 'invalid_phone' };
    }

    try {
      const res = await axios.post(this.apiUrl, {
        phone: normalizedPhone,
        message: message
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-WA-SECRET': this.secret
        },
        timeout: 10000
      });

      if (res.status >= 200 && res.status < 300) {
        console.log('✅ WhatsApp envoyé à', normalizedPhone);
        return { success: true };
      }

      console.error('❌ Erreur WhatsApp:', res.status, res.data);
      return { success: false, reason: 'api_error' };
    } catch (error) {
      console.error('❌ Échec envoi WhatsApp:', error.message);
      return { success: false, reason: error.message };
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 📦 TEMPLATES DE MESSAGES - COMMANDES
  // ═══════════════════════════════════════════════════════════════

  /**
   * 🆕 Nouvelle commande - Message au CLIENT
   */
  getOrderCreatedClientMessage(order, product, seller) {
    const orderDate = new Date().toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `🛍️ *${this.appName}*

━━━━━━━━━━━━━━━━━━━━
✅ *COMMANDE CONFIRMÉE*
━━━━━━━━━━━━━━━━━━━━

Bonjour *${order.customer_name}* 👋

Votre commande a bien été enregistrée !

📋 *Détails de la commande*
┌─────────────────────
│ 🔢 N° : *#${order.id}*
│ 📦 Article : ${product?.name || 'Produit'}
│ 🔢 Quantité : ${order.quantity}
│ 💰 Total : *${order.total_price?.toLocaleString()} FCFA*
│ 💳 Paiement : ${this.formatPaymentMethod(order.payment_method)}
└─────────────────────

🏪 *Vendeur* : ${seller?.name || 'LiveShop'}

📍 *Livraison*
${order.customer_address || 'Adresse à confirmer'}

⏳ *Statut* : En cours de traitement

━━━━━━━━━━━━━━━━━━━━
Vous recevrez une notification dès que votre commande sera validée.

Merci pour votre confiance ! 🙏
_${this.appName}_`;
  }

  /**
   * 🆕 Nouvelle commande - Message au VENDEUR
   */
  getOrderCreatedSellerMessage(order, product, customer) {
    const orderUrl = `${this.appUrl}/orders?highlight=${order.id}`;
    
    return `🔔 *${this.appName}*

━━━━━━━━━━━━━━━━━━━━
🆕 *NOUVELLE COMMANDE*
━━━━━━━━━━━━━━━━━━━━

Une nouvelle commande vient d'arriver ! 🎉

📋 *Commande #${order.id}*
┌─────────────────────
│ 👤 Client : *${order.customer_name}*
│ 📱 Tél : ${order.customer_phone}
│ 📦 Article : ${product?.name || 'Produit'}
│ 🔢 Quantité : ${order.quantity}
│ 💰 Total : *${order.total_price?.toLocaleString()} FCFA*
│ 💳 Mode : ${this.formatPaymentMethod(order.payment_method)}
└─────────────────────

📍 *Adresse de livraison*
${order.customer_address || 'Non spécifiée'}

${order.comment ? `💬 *Note client*\n${order.comment}\n` : ''}
━━━━━━━━━━━━━━━━━━━━
👉 *Voir la commande :*
${orderUrl}

⚡ Traitez cette commande rapidement !`;
  }

  /**
   * ✅ Commande validée - Message au CLIENT
   */
  getOrderValidatedClientMessage(order, product, seller) {
    return `🛍️ *${this.appName}*

━━━━━━━━━━━━━━━━━━━━
✅ *COMMANDE VALIDÉE*
━━━━━━━━━━━━━━━━━━━━

Bonjour *${order.customer_name}* 👋

Bonne nouvelle ! Votre commande a été validée ✨

📋 *Commande #${order.id}*
┌─────────────────────
│ 📦 ${product?.name || 'Produit'}
│ 💰 ${order.total_price?.toLocaleString()} FCFA
│ ✅ Statut : *VALIDÉE*
└─────────────────────

🏪 *Vendeur* : ${seller?.name || 'LiveShop'}

📍 Votre commande sera bientôt préparée pour la livraison à :
${order.customer_address || 'Adresse confirmée'}

━━━━━━━━━━━━━━━━━━━━
Vous serez notifié lors de la livraison.

Merci ! 🙏
_${this.appName}_`;
  }

  /**
   * 🚚 Commande livrée - Message au CLIENT
   */
  getOrderDeliveredClientMessage(order, product, seller) {
    return `🛍️ *${this.appName}*

━━━━━━━━━━━━━━━━━━━━
🚚 *COMMANDE LIVRÉE*
━━━━━━━━━━━━━━━━━━━━

Bonjour *${order.customer_name}* 👋

Votre commande a été livrée avec succès ! 🎉

📋 *Commande #${order.id}*
┌─────────────────────
│ 📦 ${product?.name || 'Produit'}
│ 💰 ${order.total_price?.toLocaleString()} FCFA
│ 🚚 Statut : *LIVRÉE*
└─────────────────────

━━━━━━━━━━━━━━━━━━━━

Nous espérons que vous êtes satisfait(e) de votre achat ! 😊

⭐ N'hésitez pas à recommander *${seller?.name || 'notre boutique'}* à vos proches.

Merci pour votre confiance ! 🙏
_${this.appName}_`;
  }

  // ═══════════════════════════════════════════════════════════════
  // 🛠️ MÉTHODES UTILITAIRES
  // ═══════════════════════════════════════════════════════════════

  /**
   * Formate la méthode de paiement
   */
  formatPaymentMethod(method) {
    const methods = {
      'wave': '🌊 Wave',
      'orange_money': '🟠 Orange Money',
      'cash': '💵 Espèces',
      'card': '💳 Carte bancaire',
      'free_money': '🆓 Free Money',
      'moov_money': '🔵 Moov Money'
    };
    return methods[method?.toLowerCase()] || method || 'Non spécifié';
  }

  // ═══════════════════════════════════════════════════════════════
  // 📤 MÉTHODES D'ENVOI PRINCIPALES
  // ═══════════════════════════════════════════════════════════════

  /**
   * Notifier une nouvelle commande (client + vendeur)
   */
  async notifyNewOrder(order, product, seller) {
    const results = { client: null, seller: null };

    // Message au client
    if (order.customer_phone) {
      const clientMessage = this.getOrderCreatedClientMessage(order, product, seller);
      results.client = await this.sendMessage(order.customer_phone, clientMessage);
    }

    // Message au vendeur
    if (seller?.phone_number) {
      const sellerMessage = this.getOrderCreatedSellerMessage(order, product, order);
      results.seller = await this.sendMessage(seller.phone_number, sellerMessage);
    }

    console.log('📲 Notifications nouvelle commande:', results);
    return results;
  }

  /**
   * Notifier validation de commande (client uniquement)
   */
  async notifyOrderValidated(order, product, seller) {
    if (!order.customer_phone) {
      return { success: false, reason: 'no_phone' };
    }

    const message = this.getOrderValidatedClientMessage(order, product, seller);
    const result = await this.sendMessage(order.customer_phone, message);
    
    console.log('📲 Notification commande validée:', result);
    return result;
  }

  /**
   * Notifier livraison de commande (client uniquement)
   */
  async notifyOrderDelivered(order, product, seller) {
    if (!order.customer_phone) {
      return { success: false, reason: 'no_phone' };
    }

    const message = this.getOrderDeliveredClientMessage(order, product, seller);
    const result = await this.sendMessage(order.customer_phone, message);
    
    console.log('📲 Notification commande livrée:', result);
    return result;
  }
}

module.exports = new WhatsAppNotificationService();
