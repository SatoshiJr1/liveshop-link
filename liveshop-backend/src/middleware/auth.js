const jwt = require('jsonwebtoken');
const { Seller } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'liveshop_secret_key';

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Token d\'accès requis' 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('🔍 Auth Middleware - Token décodé:', decoded);
    
    const seller = await Seller.findByPk(decoded.id);

    if (!seller) {
      return res.status(401).json({ 
        error: 'Vendeur non trouvé' 
      });
    }

    console.log('🔍 Auth Middleware - Vendeur trouvé:', {
      id: seller.id,
      name: seller.name,
      role: seller.role
    });

    req.seller = seller;
    next();
  } catch (error) {
    console.error('🔍 Auth Middleware - Erreur:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expiré' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Token invalide' 
      });
    }

    return res.status(500).json({ 
      error: 'Erreur d\'authentification' 
    });
  }
};

const generateToken = (sellerId) => {
  return jwt.sign(
    { sellerId }, 
    JWT_SECRET, 
    { expiresIn: '30d' }
  );
};

module.exports = {
  authenticateToken,
  generateToken
};

