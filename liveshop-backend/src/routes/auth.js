const express = require('express');
const router = express.Router();
const { OTP } = require('../models');
// Envoi OTP via service unifié
const otpService = require('../services/otpService');
const { Seller } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { authenticateToken } = require('../middleware/auth');
const CreditService = require('../services/creditService');
const OtpRateLimiter = require('../services/otpRateLimiter');

// sendWhatsAppOTP maintenant délégué au service unifié
const sendWhatsAppOTP = async (phone, otp) => otpService.sendOTP(phone, otp);

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, phone_number } = req.body;
  if (!name || !phone_number) return res.status(400).json({ error: 'Nom et numéro requis' });
  // Limitation d'envoi OTP inscription
  const limitCheck = OtpRateLimiter.canSend(phone_number);
  if (!limitCheck.ok) {
    return res.status(429).json({
      error: 'Limite envoi OTP atteinte',
      code: limitCheck.code,
      retry_after_seconds: limitCheck.retry_after_seconds
    });
  }
  // Générer OTP 6 chiffres
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  // Stocker OTP
  await OTP.create({ phone_number, otp, expires_at: new Date(Date.now() + 5*60*1000), type: 'register', used: false });
  // Debug : log l'OTP créé en base
  const otpEntry = await OTP.findOne({ where: { phone_number, otp, type: 'register', used: false } });
  console.log('OTP créé en base :', otpEntry);
  // Envoyer OTP WhatsApp
  const sent = await sendWhatsAppOTP(phone_number, otp);
  if (!sent) return res.status(500).json({ error: 'Erreur envoi OTP' });
  OtpRateLimiter.registerSend(phone_number);
  // Ne plus renvoyer l'OTP dans la réponse (masqué pour sécurité)
  // Pour tester en développement, consulter les logs serveur.
  res.json({ message: 'OTP envoyé' });
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  const { phone_number, otp } = req.body;
  if (!phone_number || !otp) return res.status(400).json({ error: 'Numéro et OTP requis' });
  
  console.log('🔍 Vérification OTP pour', phone_number, 'Code:', otp);
  
  // Chercher OTP valide
  const otpEntry = await OTP.findOne({
    where: {
      phone_number,
      otp,
      type: 'register',
      used: false,
      expires_at: { [Op.gt]: new Date() }
    }
  });
  
  if (!otpEntry) {
    const attemptCheck = OtpRateLimiter.canAttempt(phone_number, 'register');
    if (!attemptCheck.ok) {
      return res.status(429).json({ error: 'Trop de tentatives OTP', code: attemptCheck.code });
    }
    OtpRateLimiter.registerAttempt(phone_number, 'register', false);
    console.log('❌ OTP non trouvé ou invalide');
    // Debug: afficher tous les OTPs pour ce numéro
    const allOtps = await OTP.findAll({ 
      where: { phone_number, type: 'register' },
      order: [['created_at', 'DESC']],
      limit: 5
    });
    console.log('📋 OTPs récents pour ce numéro:', allOtps.map(o => ({
      otp: o.otp,
      used: o.used,
      expires_at: o.expires_at,
      created_at: o.created_at
    })));
    return res.status(400).json({ error: 'OTP invalide ou expiré' });
  }
  
  console.log('✅ OTP trouvé et valide');
  otpEntry.used = true;
  await otpEntry.save();
  OtpRateLimiter.registerAttempt(phone_number, 'register', true);
  
  res.json({ 
    message: 'OTP validé avec succès',
    phone_number: phone_number
  });
});

// POST /api/auth/set-pin
router.post('/set-pin', async (req, res) => {
  const { phone_number, name, pin } = req.body;
  
  console.log('🔐 Création/mise à jour de compte pour:', phone_number);
  
  if (!phone_number || !pin) {
    return res.status(400).json({ error: 'Numéro et code PIN requis' });
  }
  
  if (!/^[0-9]{4}$/.test(pin)) {
    return res.status(400).json({ error: 'Le code PIN doit contenir 4 chiffres' });
  }
  
  try {
  // Vérifier si le compte existe déjà
  let seller = await Seller.findOne({ where: { phone_number } });
  const pin_hash = await bcrypt.hash(pin, 10);
    
  if (!seller) {
      if (!name) {
        return res.status(400).json({ error: 'Nom requis pour la création du compte' });
      }
      
      console.log('📝 Création d\'un nouveau compte pour:', name);
      
    // Générer un public_link_id unique
    const generateId = async () => {
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let id, exists;
      do {
        id = Array.from({length:8},()=>chars[Math.floor(Math.random()*chars.length)]).join('');
        exists = await Seller.findOne({ where: { public_link_id: id } });
      } while (exists);
      return id;
    };
      
    const public_link_id = await generateId();
      seller = await Seller.create({ 
        phone_number, 
        name, 
        pin_hash, 
        public_link_id,
        is_active: true,
        credit_balance: 0
      });
      
      console.log('✅ Nouveau compte créé:', seller.id);
      
      // Grant initial credits to new seller
      try {
        const config = await CreditService.loadConfigFromDatabase();
        const initialCredits = config.INITIAL_CREDITS || 0;
        if (initialCredits > 0) {
          await CreditService.addBonusCredits(seller.id, initialCredits, 'Initial credits upon registration');
          console.log(`💳 Initial credits (${initialCredits}) granted to seller ${seller.id}`);
        }
      } catch (creditError) {
        console.error('⚠️ Erreur lors de l\'attribution des crédits initiaux:', creditError);
        // Non-blocking error - don't fail account creation
      }
  } else {
      console.log('🔄 Mise à jour du compte existant:', seller.id);
    seller.pin_hash = pin_hash;
      if (name) seller.name = name;
    await seller.save();
  }
    
    res.json({ 
      message: 'Compte créé avec succès', 
      seller: { 
        id: seller.id, 
        name: seller.name, 
        phone_number: seller.phone_number, 
        public_link_id: seller.public_link_id 
      } 
    });
    
  } catch (error) {
    console.error('❌ Erreur création compte:', error);
    res.status(500).json({ error: 'Erreur lors de la création du compte' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { phone_number, pin } = req.body;
  if (!phone_number || !pin) return res.status(400).json({ error: 'Numéro et code PIN requis' });
  const seller = await Seller.findOne({ where: { phone_number } });
  if (!seller || !seller.pin_hash) return res.status(401).json({ error: 'Compte ou code PIN incorrect' });
  const valid = await bcrypt.compare(pin, seller.pin_hash);
  if (!valid) return res.status(401).json({ error: 'Compte ou code PIN incorrect' });
  
  // Vérifier si le compte est actif
  if (!seller.is_active) return res.status(403).json({ error: 'Compte suspendu. Contactez l\'administrateur.' });
  
  // Générer un token JWT
  const token = jwt.sign({ 
    id: seller.id, 
    name: seller.name, 
    phone_number: seller.phone_number, 
    public_link_id: seller.public_link_id,
    role: seller.role 
  }, process.env.JWT_SECRET || 'liveshop_secret_key', { expiresIn: '30d' });
  
  res.json({
    message: 'Connexion réussie',
    token,
    seller: {
      id: seller.id,
      name: seller.name,
      phone_number: seller.phone_number,
      public_link_id: seller.public_link_id,
      role: seller.role,
      is_active: seller.is_active,
      credit_balance: seller.credit_balance
    }
  });
});

// POST /api/auth/forgot-pin
router.post('/forgot-pin', async (req, res) => {
  const { phone_number } = req.body;
  if (!phone_number) return res.status(400).json({ error: 'Numéro requis' });
  // Limitation d'envoi OTP reset
  const limitCheck = OtpRateLimiter.canSend(phone_number);
  if (!limitCheck.ok) {
    return res.status(429).json({
      error: 'Limite envoi OTP atteinte',
      code: limitCheck.code,
      retry_after_seconds: limitCheck.retry_after_seconds
    });
  }
  // Générer OTP 6 chiffres
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  // Stocker OTP
  await OTP.create({ phone_number, otp, expires_at: new Date(Date.now() + 5*60*1000), type: 'reset', used: false });
  // Envoyer OTP WhatsApp
  const sent = await sendWhatsAppOTP(phone_number, otp);
  if (!sent) return res.status(500).json({ error: 'Erreur envoi OTP' });
  OtpRateLimiter.registerSend(phone_number);
  res.json({ message: 'OTP envoyé' });
});

// POST /api/auth/reset-pin
router.post('/reset-pin', async (req, res) => {
  const { phone_number, otp, new_pin } = req.body;
  if (!phone_number || !otp || !new_pin) return res.status(400).json({ error: 'Numéro, OTP et nouveau code requis' });
  if (!/^[0-9]{4}$/.test(new_pin)) return res.status(400).json({ error: 'Le code PIN doit contenir 4 chiffres' });
  // Vérifier OTP
  const otpEntry = await OTP.findOne({
    where: {
      phone_number,
      otp,
      type: 'reset',
      used: false,
      // Utilisation correcte de l'opérateur Sequelize pour la date d'expiration
      expires_at: { [Op.gt]: new Date() }
    }
  });
  if (!otpEntry) {
    const attemptCheck = OtpRateLimiter.canAttempt(phone_number, 'reset');
    if (!attemptCheck.ok) {
      return res.status(429).json({ error: 'Trop de tentatives OTP', code: attemptCheck.code });
    }
    OtpRateLimiter.registerAttempt(phone_number, 'reset', false);
    return res.status(400).json({ error: 'OTP invalide ou expiré' });
  }
  OtpRateLimiter.registerAttempt(phone_number, 'reset', true);
  otpEntry.used = true;
  await otpEntry.save();
  // Mettre à jour le PIN
  const seller = await Seller.findOne({ where: { phone_number } });
  if (!seller) return res.status(404).json({ error: 'Compte introuvable' });
  seller.pin_hash = await bcrypt.hash(new_pin, 10);
  await seller.save();
  res.json({ message: 'Code PIN réinitialisé' });
});

// GET /api/auth/verify
router.get('/verify', authenticateToken, async (req, res) => {
  try {
    const seller = req.seller;
    if (!seller) return res.status(404).json({ error: 'Vendeur introuvable' });
    res.json({ seller });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/auth/profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    // req.seller contient déjà l'objet vendeur complet du middleware
    const seller = req.seller;
    
    console.log('🔍 Profile - Données vendeur:', {
      id: seller.id,
      name: seller.name,
      role: seller.role,
      is_active: seller.is_active
    });
    
    res.json({
      data: {
        id: seller.id,
        name: seller.name,
        phone_number: seller.phone_number,
        public_link_id: seller.public_link_id,
        role: seller.role,
        is_active: seller.is_active,
        credit_balance: seller.credit_balance
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;

