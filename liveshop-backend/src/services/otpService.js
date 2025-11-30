const axios = require('axios');

class OtpService {
  constructor() {
    this.provider = process.env.OTP_PROVIDER || 'console'; // 'console' | 'whatsapp_cloud' | 'twilio' | 'callmebot' | 'nexteranga'
  }

  async sendOTP(phoneNumber, otp) {
    const original = this.normalizePhone(phoneNumber);
    const redirectTo = (process.env.DEV_OTP_REDIRECT_TO || '').trim();
    const destination = redirectTo ? this.normalizePhone(redirectTo) : original;

    // Ajout d'un suffixe pour identifier l'utilisateur concerné si redirigé
    const baseMessage = `Votre code LiveShop Link : ${otp}`;
    const message = redirectTo ? `${baseMessage} (pour: ${original})` : baseMessage;

    try {
      switch (this.provider) {
        case 'whatsapp_cloud':
          return await this.sendViaWhatsAppCloud(destination, message);
        case 'twilio':
          return await this.sendViaTwilio(destination, message);
        case 'nexteranga':
          return await this.sendViaNexteranga(original, otp);
        case 'callmebot':
          return await this.sendViaCallMeBot(destination, message);
        case 'console':
        default:
          console.log(`[DEV] OTP pour ${original} => envoyé à ${destination} : ${otp}`);
          return true;
      }
    } catch (error) {
      console.error('❌ Échec envoi OTP:', error.response?.data || error.message);
      return false;
    }
  }

  normalizePhone(phone) {
    if (!phone) return phone;
    const trimmed = String(phone).trim();
    if (trimmed.startsWith('+')) return trimmed;
    if (/^\d+$/.test(trimmed)) return `+${trimmed}`;
    return trimmed;
  }

  // WhatsApp Cloud (officiel)
  async sendViaWhatsAppCloud(to, body) {
    const token = process.env.WHATSAPP_CLOUD_ACCESS_TOKEN;
    const phoneId = process.env.WHATSAPP_CLOUD_PHONE_NUMBER_ID;
    if (!token || !phoneId) {
      console.warn('⚠️ WHATSAPP_CLOUD_* non configuré, fallback console');
      console.log(`[DEV] ${body} -> ${to}`);
      return true;
    }

    const url = `https://graph.facebook.com/v20.0/${phoneId}/messages`;
    const payload = { messaging_product: 'whatsapp', to, type: 'text', text: { body } };

    const res = await axios.post(url, payload, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    });

    console.log('✅ OTP envoyé via WhatsApp Cloud:', res.data);
    return true;
  }

  // Twilio (officiel)
  async sendViaTwilio(to, body) {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const auth = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_WHATSAPP_FROM;
    if (!sid || !auth || !from) {
      console.warn('⚠️ TWILIO_* non configuré, fallback console');
      console.log(`[DEV] ${body} -> ${to}`);
      return true;
    }

    const twilio = require('twilio')(sid, auth);
    const result = await twilio.messages.create({ from: `whatsapp:${from}`, to: `whatsapp:${to}`, body });

    console.log('✅ OTP envoyé via Twilio:', result.sid);
    return true;
  }

  // Nexteranga (custom OTP API)
  async sendViaNexteranga(originalPhone, otp) {
    const apiUrl = process.env.NEXTERANGA_API_URL || 'https://wa.nexteranga.com/send-otp';
    const secret = process.env.NEXTERANGA_SECRET;
    const businessName = (process.env.NEXTERANGA_BUSINESS_NAME || 'Fitsen').trim();

    if (!secret) {
      console.warn('⚠️ NEXTERANGA_SECRET manquant, fallback console');
      console.log(`[DEV] OTP ${otp} -> ${originalPhone}`);
      return true;
    }

    // Nexteranga attend un numéro sans +, avec indicatif (ex: 221771234567)
    const phoneForApi = String(originalPhone).replace(/^\+/, '');

    const payload = {
      phone: phoneForApi,
      code: String(otp),
      businessName
    };

    try {
      const res = await axios.post(apiUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-WA-SECRET': secret
        },
        timeout: 8000
      });

      // On considère 2xx comme succès
      if (res.status >= 200 && res.status < 300) {
        console.log('✅ OTP envoyé via Nexteranga');
        return true;
      }

      console.error('❌ Nexteranga a répondu avec un statut non succès:', res.status, res.data);
      return false;
    } catch (error) {
      console.error('❌ Échec envoi OTP via Nexteranga:', error.response?.data || error.message);
      return false;
    }
  }

  // CallMeBot (non officiel, très simple)
  async sendViaCallMeBot(to, body) {
    const apiKey = process.env.CALLMEBOT_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ CALLMEBOT_API_KEY manquant, fallback console');
      console.log(`[DEV] ${body} -> ${to}`);
      return true;
    }

    const url = 'https://api.callmebot.com/whatsapp.php';
    const params = new URLSearchParams({ phone: to.replace(/^\+/, ''), text: body, apikey: apiKey });

    const res = await axios.get(`${url}?${params.toString()}`);
    const ok = typeof res.data === 'string' ? /success|queued|message queued/i.test(res.data) : true;
    if (!ok) console.warn('⚠️ Réponse CallMeBot non confirmée:', res.data);
    console.log('✅ OTP envoyé via CallMeBot');
    return true;
  }
}

module.exports = new OtpService(); 