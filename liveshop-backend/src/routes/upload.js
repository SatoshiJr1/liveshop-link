const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Configuration de multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Créer le dossier uploads s'il n'existe pas
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Générer un nom de fichier unique
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `payment-proof-${uniqueSuffix}${ext}`);
  }
});

// Filtre pour n'accepter que les images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

// Route pour uploader une image
router.post('/image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Aucune image fournie'
      });
    }

    // Construire l'URL de l'image
    const imageUrl = `/uploads/${req.file.filename}`;
    
    console.log('✅ Image uploadée:', {
      originalName: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      url: imageUrl
    });

    res.json({
      success: true,
      imageUrl: imageUrl,
      filename: req.file.filename,
      size: req.file.size
    });

  } catch (error) {
    console.error('❌ Erreur upload image:', error);
    res.status(500).json({
      error: 'Erreur lors de l\'upload de l\'image'
    });
  }
});

// Route pour servir les images uploadées
router.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../../uploads', filename);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({
      error: 'Image non trouvée'
    });
  }
});

module.exports = router; 