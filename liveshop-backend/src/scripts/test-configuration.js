const { testConnection } = require('../config/database');
const supabaseRealtimeService = require('../services/supabaseRealtimeService');

async function testConfiguration() {
  console.log('🔍 Test de la configuration');
  console.log('==========================');
  
  // Afficher l'environnement
  console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔧 DB_DIALECT: ${process.env.DB_DIALECT || 'sqlite'}`);
  console.log(`📁 DB_STORAGE: ${process.env.DB_STORAGE || 'database.sqlite'}`);
  
  if (process.env.NODE_ENV === 'production') {
    console.log(`🌐 DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Configurée' : '❌ Manquante'}`);
    console.log(`🔑 SUPABASE_URL: ${process.env.SUPABASE_URL ? '✅ Configurée' : '❌ Manquante'}`);
    console.log(`🔑 SUPABASE_SERVICE_KEY: ${process.env.SUPABASE_SERVICE_KEY ? '✅ Configurée' : '❌ Manquante'}`);
  }
  
  console.log('');

  try {
    // Test connexion base de données
    console.log('🔌 Test connexion base de données...');
    await testConnection();
    
    // Test service Supabase Realtime
    console.log('🔔 Test service Supabase Realtime...');
    await supabaseRealtimeService.testConnection();
    
    console.log('');
    console.log('✅ Configuration testée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur test configuration:', error);
    process.exit(1);
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  testConfiguration();
}

module.exports = { testConfiguration }; 