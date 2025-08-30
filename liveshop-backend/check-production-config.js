require('dotenv').config({ path: '.env.production' });

console.log('🔍 Vérification de la configuration de production');
console.log('================================================');

// Vérifier les variables d'environnement
console.log('📋 Variables d\'environnement :');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configurée' : '❌ Manquante');
console.log('- SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Configurée' : '❌ Manquante');
console.log('- SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Configurée' : '❌ Manquante');

// Tester la connexion à la base de données
const { sequelize } = require('./src/config/database');

async function testDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données réussie');
    
    // Vérifier quelle base de données est utilisée
    const [results] = await sequelize.query('SELECT current_database() as db_name, current_user as user');
    console.log('📊 Base de données actuelle:', results[0].db_name);
    console.log('👤 Utilisateur:', results[0].user);
    
    // Compter les produits
    const [productCount] = await sequelize.query('SELECT COUNT(*) as count FROM products');
    console.log('📦 Nombre de produits:', productCount[0].count);
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
  } finally {
    await sequelize.close();
  }
}

testDatabase(); 