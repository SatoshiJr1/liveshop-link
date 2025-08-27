const { Sequelize } = require('sequelize');
const path = require('path');

// Détecter Postgres via variables d'environnement
const isPostgres = process.env.DB_DIALECT === 'postgres' || !!process.env.DATABASE_URL;

const commonOptions = {
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: false,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
};

let sequelize;

if (isPostgres) {
  // Priorité à DATABASE_URL (format: postgres://user:pass@host:5432/db)
  const connectionUrl = process.env.DATABASE_URL;
  if (connectionUrl) {
    const ssl = process.env.DB_SSL === 'true';
    sequelize = new Sequelize(connectionUrl, {
      dialect: 'postgres',
      dialectOptions: ssl ? { ssl: { require: true, rejectUnauthorized: false } } : {},
      ...commonOptions
    });
  } else {
    // Connexion par paramètres unitaires
    const host = process.env.DB_HOST || 'localhost';
    const port = parseInt(process.env.DB_PORT || '5432', 10);
    const database = process.env.DB_NAME || 'liveshop';
    const username = process.env.DB_USERNAME || 'postgres';
    const password = process.env.DB_PASSWORD || 'postgres';
    const ssl = process.env.DB_SSL === 'true';

    sequelize = new Sequelize(database, username, password, {
      host,
      port,
      dialect: 'postgres',
      dialectOptions: ssl ? { ssl: { require: true, rejectUnauthorized: false } } : {},
      ...commonOptions
    });
  }
} else {
  // Configuration SQLite (par défaut)
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../database.sqlite'),
    ...commonOptions
  });
}

// Test de la connexion
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie avec succès.');
  } catch (error) {
    console.error('❌ Impossible de se connecter à la base de données:', error);
  }
};

module.exports = { sequelize, testConnection };

