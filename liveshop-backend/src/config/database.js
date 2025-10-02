const { Sequelize } = require('sequelize');
const path = require('path');

// Détecter l'environnement
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

console.log('🔍 DEBUG - Configuration de la base de données :');
console.log('===============================================');
console.log('📋 Variables d\'environnement détectées :');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configurée' : '❌ Manquante');
console.log('');

// Configuration commune
const commonOptions = {
  logging: isDevelopment ? console.log : false,
  define: {
    timestamps: true,
    underscored: false,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
};

let sequelize;

if (isProduction) {
  // PRODUCTION : PostgreSQL (fitsen-postgresql)
  console.log('🚀 Configuration Production : PostgreSQL (fitsen-postgresql)');
  
  const connectionUrl = process.env.DATABASE_URL;
  if (!connectionUrl) {
    throw new Error('❌ DATABASE_URL manquant en production.');
  }

  console.log('🔗 URL de connexion:', connectionUrl.replace(/\/\/.*@/, '//***:***@')); // Masquer le mot de passe

  sequelize = new Sequelize(connectionUrl, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: false // ⚠️ mets true si tu es sur Render/Heroku
    },
    ...commonOptions,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
  
} else {
  // DÉVELOPPEMENT : SQLite avec volume persistant
  console.log('🛠️ Configuration Développement : SQLite avec volume persistant');
  
  // Utiliser le volume persistant si disponible, sinon fallback local
  const storagePath = process.env.DB_STORAGE || path.join(__dirname, '../../database/database.sqlite');
  console.log('📁 Fichier SQLite:', storagePath);
  
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    ...commonOptions
  });
}

// Test de la connexion
const testConnection = async () => {
  try {
    console.log('🔍 Test de connexion à la base de données...');
    await sequelize.authenticate();
    
    if (isDevelopment) {
      console.log(`✅ Connexion SQLite établie avec succès.`);
      console.log(`📁 Fichier SQLite: ${sequelize.options.storage}`);
    } else {
      // Vérifier les informations de la base
      const [results] = await sequelize.query(
        'SELECT current_database() as db_name, current_user as user, version() as version'
      );
      console.log('📊 Base de données:', results[0].db_name);
      console.log('👤 Utilisateur:', results[0].user);
      console.log('🔧 Version PostgreSQL:', results[0].version.split(' ')[0]);
      
      // Compter les produits (si table existe)
      try {
        const [productCount] = await sequelize.query('SELECT COUNT(*) as count FROM products');
        console.log('📦 Nombre de produits:', productCount[0].count);
      } catch (err) {
        console.warn('⚠️ Table "products" introuvable, skip compteur.');
      }
    }
  } catch (error) {
    console.error('❌ Impossible de se connecter à la base de données:', error.message);
    console.error('🔍 Détails de l\'erreur:', error);
    throw error;
  }
};

module.exports = { sequelize, testConnection };
