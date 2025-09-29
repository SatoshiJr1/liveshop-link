require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configuration Cloudinary avec gestion d'erreur améliorée
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
  cdn_subdomain: true
});

console.log('🔧 Configuration Cloudinary:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? '✅ Configuré' : '❌ Manquant',
  api_secret: process.env.CLOUDINARY_API_SECRET ? '✅ Configuré' : '❌ Manquant'
});

// Configuration du storage Cloudinary pour les produits
const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'liveshop/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [
      { width: 800, height: 800, crop: 'limit', quality: 'auto' },
      { fetch_format: 'auto' }
    ],
    resource_type: 'image'
  }
});

// Configuration du storage Cloudinary pour les preuves de paiement
const paymentProofStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'liveshop/payment-proofs',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1200, height: 1200, crop: 'limit', quality: 'auto' },
      { fetch_format: 'auto' }
    ],
    resource_type: 'image'
  }
});

// Configuration du storage Cloudinary pour les avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'liveshop/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto' },
      { fetch_format: 'auto' },
      { radius: 'max' }
    ],
    resource_type: 'image'
  }
});

// Configuration du storage Cloudinary pour les bannières de lives
const liveBannerStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'liveshop/live-banners',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1200, height: 600, crop: 'fill', quality: 'auto' },
      { fetch_format: 'auto' }
    ],
    resource_type: 'image'
  }
});

// Middleware Multer pour les produits
const uploadProductImage = multer({ 
  storage: productStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées'), false);
    }
  }
});

// Middleware Multer pour les preuves de paiement
const uploadPaymentProof = multer({ 
  storage: paymentProofStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées'), false);
    }
  }
});

// Middleware Multer pour les avatars
const uploadAvatar = multer({ 
  storage: avatarStorage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées'), false);
    }
  }
});

// Middleware Multer pour les bannières de lives
const uploadLiveBanner = multer({ 
  storage: liveBannerStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées'), false);
    }
  }
});

// Fonction utilitaire pour supprimer une image
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('✅ Image supprimée de Cloudinary:', publicId);
    return result;
  } catch (error) {
    console.error('❌ Erreur lors de la suppression de l\'image:', error);
    throw error;
  }
};

// Fonction utilitaire pour optimiser une URL d'image
const optimizeImageUrl = (url, options = {}) => {
  if (!url) return null;
  
  const {
    width = 800,
    height = 800,
    crop = 'limit',
    quality = 'auto',
    format = 'auto'
  } = options;

  // Si c'est déjà une URL Cloudinary, on peut l'optimiser
  if (url.includes('cloudinary.com')) {
    const baseUrl = url.split('/upload/')[0];
    const imagePath = url.split('/upload/')[1];
    return `${baseUrl}/upload/w_${width},h_${height},c_${crop},q_${quality},f_${format}/${imagePath}`;
  }

  return url;
};

// Fonction utilitaire pour générer une URL de thumbnail
const generateThumbnailUrl = (url, size = 200) => {
  return optimizeImageUrl(url, { width: size, height: size, crop: 'fill' });
};

module.exports = {
  cloudinary,
  uploadProductImage,
  uploadPaymentProof,
  uploadAvatar,
  uploadLiveBanner,
  deleteImage,
  optimizeImageUrl,
  generateThumbnailUrl
}; 