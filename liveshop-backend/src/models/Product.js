const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  seller_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'sellers',
      key: 'id'
    }
  },
  // Code produit unique par vendeur (ex: #001, #002)
  product_code: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: 'Code unique du produit par vendeur pour identification rapide en live'
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  // Nouveaux champs pour la flexibilité
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'general',
    validate: {
      isIn: [['general', 'vetements', 'tissus', 'bijoux', 'alimentation', 'services', 'accessoires', 'chaussures', 'cosmetiques', 'maison']]
    }
  },
  // Attributs dynamiques stockés en JSON
  attributes: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Stockage des attributs spécifiques à la catégorie (tailles, couleurs, poids, etc.)'
  },
  // Images multiples avec métadonnées Cloudinary
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array d\'objets images avec métadonnées Cloudinary: {url, publicId, thumbnailUrl, optimizedUrl, width, height, format, size}'
  },
  // Image principale (pour compatibilité)
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  // Métadonnées Cloudinary de l'image principale
  image_metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Métadonnées Cloudinary de l\'image principale: {publicId, width, height, format, size, thumbnailUrl, optimizedUrl}'
  },
  stock_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  // Gestion des variantes (ex: différentes tailles/couleurs)
  has_variants: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // Statut du produit
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'active',
    validate: {
      isIn: [['active', 'inactive', 'out_of_stock', 'draft']]
    }
  },
  // Métadonnées pour le SEO et la recherche
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Tags pour faciliter la recherche'
  },
  // Informations de livraison
  weight: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Poids en grammes'
  },
  dimensions: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Dimensions {length, width, height} en cm'
  },
  is_pinned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'products',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: async (product) => {
      // Générer le product_code automatiquement
      // Format: #001, #002, etc. (par vendeur)
      try {
        const lastProduct = await Product.findOne({
          where: { seller_id: product.seller_id },
          order: [['id', 'DESC']],
          attributes: ['product_code']
        });
        
        let nextNumber = 1;
        if (lastProduct && lastProduct.product_code) {
          // Extraire le numéro du code existant
          const match = lastProduct.product_code.match(/^#?(\d+)$/);
          if (match) {
            nextNumber = parseInt(match[1]) + 1;
          }
        }
        
        // Formater avec zéros: #001, #002, ..., #999
        product.product_code = `#${String(nextNumber).padStart(3, '0')}`;
        console.log(`📦 Code produit généré: ${product.product_code} pour vendeur ${product.seller_id}`);
      } catch (err) {
        console.warn('⚠️ Impossible de générer le product_code:', err.message);
        // Fallback: utiliser timestamp
        product.product_code = `#${Date.now().toString().slice(-4)}`;
      }
      
      // Définir l'image principale si des images sont fournies
      if (product.images && product.images.length > 0) {
        const firstImage = product.images[0];
        product.image_url = firstImage.url || firstImage;
        product.image_metadata = typeof firstImage === 'object' ? firstImage : null;
      }
    },
    beforeUpdate: (product) => {
      // Mettre à jour l'image principale si des images sont fournies
      if (product.images && product.images.length > 0) {
        const firstImage = product.images[0];
        product.image_url = firstImage.url || firstImage;
        product.image_metadata = typeof firstImage === 'object' ? firstImage : null;
      }
    }
  }
});

module.exports = Product;

