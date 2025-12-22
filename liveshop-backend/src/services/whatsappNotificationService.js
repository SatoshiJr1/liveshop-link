const axios = require('axios');

/**
 * Service de notifications WhatsApp pour LiveShop Link
 * Utilise l'API Nextéranga pour envoyer des messages professionnels
 */
class WhatsAppNotificationService {
  constructor() {
    this.apiUrl = process.env.NEXTERANGA_API_URL || 'https://konekt.nexteranga.com/send';
    this.secret = process.env.NEXTERANGA_SECRET || '12aa7287-452f-472d-8f3f-383c87c2e618';
    this.appName = 'LiveShop Link';
    this.appUrl = process.env.FRONTEND_URL || 'https://space.livelink.store';
    this.enabled = process.env.WHATSAPP_NOTIFICATIONS_ENABLED !== 'false';
  }

  /**
   * Normalise un numéro de téléphone pour l'API (sans le +, avec indicatif)
   * Gère plusieurs formats: +221771234567, 221771234567, 771234567, 77 123 45 67
   */
  normalizePhone(phone) {
    if (!phone) return null;
    
    // Nettoyer le numéro
    let cleaned = String(phone).replace(/[\s\-\.\(\)]/g, '').trim();
    
    // Enlever le + au début
    cleaned = cleaned.replace(/^\+/, '');
    
    // Si le numéro commence par 7 ou 6 (Sénégal sans indicatif), ajouter 221
    if (/^[76]\d{8}$/.test(cleaned)) {
      cleaned = '221' + cleaned;
    }
    
    // Vérifier que c'est un numéro valide (au moins 9 chiffres)
    if (!/^\d{9,15}$/.test(cleaned)) {
      console.warn('⚠️ Format de numéro invalide après normalisation:', phone, '->', cleaned);
      return null;
    }
    
    return cleaned;
  }

  /**
   * Envoie un message WhatsApp avec retry
   */
  async sendMessage(phone, message, retries = 2) {
    if (!this.enabled) {
      console.log('📵 Notifications WhatsApp désactivées');
      return { success: false, reason: 'disabled' };
    }

    const normalizedPhone = this.normalizePhone(phone);
    if (!normalizedPhone) {
      console.warn('⚠️ Numéro de téléphone invalide:', phone);
      return { success: false, reason: 'invalid_phone', originalPhone: phone };
    }

    console.log(`📤 Tentative envoi WhatsApp à ${normalizedPhone} (original: ${phone})`);

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const res = await axios.post(this.apiUrl, {
          phone: normalizedPhone,
          message: message
        }, {
          headers: {
            'Content-Type': 'application/json',
            'X-WA-SECRET': this.secret
          },
          timeout: 15000
        });

        if (res.status >= 200 && res.status < 300) {
          console.log(`✅ WhatsApp envoyé à ${normalizedPhone} (tentative ${attempt})`);
          return { success: true, phone: normalizedPhone };
        }

        console.error(`❌ Erreur WhatsApp (tentative ${attempt}):`, res.status, res.data);
      } catch (error) {
        console.error(`❌ Échec envoi WhatsApp (tentative ${attempt}):`, error.message);
        
        if (attempt < retries) {
          console.log(`🔄 Nouvelle tentative dans 1s...`);
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    }

    return { success: false, reason: 'all_retries_failed', phone: normalizedPhone };
  }

  // ═══════════════════════════════════════════════════════════════
  // 📦 TEMPLATES DE MESSAGES - COMMANDES
  // ═══════════════════════════════════════════════════════════════

  /**
   * 🆕 Nouvelle commande - Message au CLIENT
   */
  getOrderCreatedClientMessage(order, product, seller) {
    return `✅ Commande #${order.id} reçue

${product?.name || 'Produit'} (${order.quantity}x)
Total: ${order.total_price?.toLocaleString()} FCFA
Paiement: ${this.formatPaymentMethod(order.payment_method)}

Livraison: ${order.customer_address || 'À confirmer'}

Le vendeur confirmera sous peu.
Merci ! 🙏`;
  }

  /**
   * 🆕 Nouvelle commande - Message au VENDEUR
   */
  getOrderCreatedSellerMessage(order, product, customer) {
    const orderUrl = `${this.appUrl}/orders?highlight=${order.id}`;
    
    return `🔔 Commande #${order.id} - ${order.customer_name} | ${order.customer_phone}

${product?.name || 'Produit'} (${order.quantity}x) - ${order.total_price?.toLocaleString()} FCFA
Paiement: ${this.formatPaymentMethod(order.payment_method)}
Adresse: ${order.customer_address || 'À confirmer'}${order.comment ? `\nNote: ${order.comment}` : ''}

👉 ${orderUrl}`;
  }

  /**
   * ✅ Commande validée - Message au CLIENT
   */
  getOrderValidatedClientMessage(order, product, seller) {
    return `✅ Commande #${order.id} validée

${product?.name || 'Produit'} (${order.quantity}x)
Total: ${order.total_price?.toLocaleString()} FCFA

Vendeur: ${seller?.name || 'LiveShop'}

Votre commande est en préparation.
Livraison à: ${order.customer_address || 'Adresse confirmée'}

Vous serez notifié lors de la livraison.
Merci ! 🙏`;
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
    console.log('═══════════════════════════════════════════');
    console.log('📱 NOTIFICATION NOUVELLE COMMANDE #' + order?.id);
    console.log('═══════════════════════════════════════════');
    
    const results = { client: null, seller: null };

    // Debug: afficher les données disponibles
    console.log('📋 Données commande:', {
      id: order?.id,
      customer_name: order?.customer_name,
      customer_phone: order?.customer_phone,
      customerPhone: order?.customerPhone,
      total_price: order?.total_price
    });
    console.log('📦 Produit:', product?.name || 'Non défini');
    console.log('🏪 Vendeur:', seller?.name, '- Tel:', seller?.phone_number);

    // Récupérer le téléphone du client (plusieurs noms possibles)
    const clientPhone = order?.customer_phone || order?.customerPhone || order?.phone;
    
    // Message au client
    if (clientPhone) {
      console.log('📤 Envoi au CLIENT:', clientPhone);
      const clientMessage = this.getOrderCreatedClientMessage(order, product, seller);
      results.client = await this.sendMessage(clientPhone, clientMessage);
      console.log('✉️ Résultat client:', results.client);
    } else {
      console.warn('⚠️ Pas de téléphone client disponible!');
      results.client = { success: false, reason: 'no_client_phone' };
    }

    // Message au vendeur
    const sellerPhone = seller?.phone_number || seller?.phoneNumber || seller?.phone;
    if (sellerPhone) {
      console.log('📤 Envoi au VENDEUR:', sellerPhone);
      const sellerMessage = this.getOrderCreatedSellerMessage(order, product, order);
      results.seller = await this.sendMessage(sellerPhone, sellerMessage);
      console.log('✉️ Résultat vendeur:', results.seller);
    } else {
      console.warn('⚠️ Pas de téléphone vendeur disponible!');
      results.seller = { success: false, reason: 'no_seller_phone' };
    }

    console.log('═══════════════════════════════════════════');
    console.log('📲 RÉSUMÉ NOTIFICATIONS:', results);
    console.log('═══════════════════════════════════════════');
    return results;
  }

  /**
   * Notifier validation de commande (client uniquement)
   */
  async notifyOrderValidated(order, product, seller) {
    console.log('═══════════════════════════════════════════');
    console.log('✅ NOTIFICATION COMMANDE VALIDÉE #' + order?.id);
    console.log('═══════════════════════════════════════════');
    
    // Debug: afficher les données disponibles
    console.log('📋 Données commande:', {
      id: order?.id,
      customer_name: order?.customer_name,
      customer_phone: order?.customer_phone,
      customerPhone: order?.customerPhone,
      status: order?.status
    });
    
    const clientPhone = order?.customer_phone || order?.customerPhone || order?.phone;
    
    if (!clientPhone) {
      console.warn('⚠️ Pas de téléphone client pour notification validation!');
      return { success: false, reason: 'no_phone' };
    }

    console.log('📤 Envoi notification validation au CLIENT:', clientPhone);
    const message = this.getOrderValidatedClientMessage(order, product, seller);
    const result = await this.sendMessage(clientPhone, message);
    
    console.log('📲 Résultat notification validée:', result);
    console.log('═══════════════════════════════════════════');
    return result;
  }

  /**
   * Notifier livraison de commande (client uniquement)
   */
  async notifyOrderDelivered(order, product, seller) {
    console.log('═══════════════════════════════════════════');
    console.log('🚚 NOTIFICATION COMMANDE LIVRÉE #' + order?.id);
    console.log('═══════════════════════════════════════════');
    
    // Debug: afficher les données disponibles
    console.log('📋 Données commande:', {
      id: order?.id,
      customer_name: order?.customer_name,
      customer_phone: order?.customer_phone,
      customerPhone: order?.customerPhone,
      status: order?.status
    });
    
    const clientPhone = order?.customer_phone || order?.customerPhone || order?.phone;
    
    if (!clientPhone) {
      console.warn('⚠️ Pas de téléphone client pour notification livraison!');
      return { success: false, reason: 'no_phone' };
    }

    console.log('📤 Envoi notification livraison au CLIENT:', clientPhone);
    const message = this.getOrderDeliveredClientMessage(order, product, seller);
    const result = await this.sendMessage(clientPhone, message);
    
    console.log('📲 Résultat notification livrée:', result);
    console.log('═══════════════════════════════════════════');
    return result;
  }
}

module.exports = new WhatsAppNotificationService();
