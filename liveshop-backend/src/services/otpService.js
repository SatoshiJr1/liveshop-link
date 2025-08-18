const axios = require('axios');

class OtpService {
  constructor() {
    this.provider = process.env.OTP_PROVIDER || 'console'; // 'console' | 'whatsapp_cloud' | 'twilio' | 'callmebot'
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