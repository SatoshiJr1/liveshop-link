const { Sequelize } = require('sequelize');
const path = require('path');

// Détecter l'environnement
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

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
  // PRODUCTION : Supabase PostgreSQL
  console.log('🚀 Configuration Production : Supabase PostgreSQL');
  
  const connectionUrl = process.env.DATABASE_URL;
  if (!connectionUrl) {
    throw new Error('❌ DATABASE_URL manquante pour la production');
  }

  sequelize = new Sequelize(connectionUrl, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false }
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
  // DÉVELOPPEMENT : SQLite
  console.log('🛠️ Configuration Développement : SQLite');
  
  const storagePath = process.env.DB_STORAGE || path.join(__dirname, '../../database.sqlite');
  
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    ...commonOptions
  });
}
console.log(sequelize);
// Test de la connexion
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ Connexion ${isDevelopment ? 'SQLite' : 'Supabase PostgreSQL'} établie avec succès.`);
    
    if (isDevelopment) {
      console.log(`📁 Fichier SQLite: ${sequelize.options.storage}`);
    } else {
      console.log('🌐 Supabase PostgreSQL connecté');
    }
  } catch (error) {
    console.error('❌ Impossible de se connecter à la base de données:', error);
    throw error;
  }
};

module.exports = { sequelize, testConnection };

