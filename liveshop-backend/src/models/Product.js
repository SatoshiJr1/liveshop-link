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
  // Images multiples
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array d\'URLs d\'images du produit'
  },
  // Image principale (pour compatibilité)
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: true
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
    beforeCreate: (product) => {
      // Définir l'image principale si des images sont fournies
      if (product.images && product.images.length > 0 && !product.image_url) {
        product.image_url = product.images[0];
      }
    },
    beforeUpdate: (product) => {
      // Mettre à jour l'image principale si des images sont fournies
      if (product.images && product.images.length > 0 && !product.image_url) {
        product.image_url = product.images[0];
      }
    }
  }
});

module.exports = Product;

