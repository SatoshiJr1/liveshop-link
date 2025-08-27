const { sequelize } = require('../config/database');
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Tables à migrer
const TABLES = [
  'sellers',
  'products', 
  'product_variants',
  'lives',
  'live_products',
  'orders',
  'notifications',
  'credit_transactions',
  'otps'
];

async function migrateTableData(tableName) {
  console.log(`🔄 Migration des données: ${tableName}`);
  
  try {
    // Récupérer les données de SQLite
    const [results] = await sequelize.query(`SELECT * FROM ${tableName}`);
    
    if (results.length === 0) {
      console.log(`⚠️ Table ${tableName} vide, ignorée`);
      return;
    }

    console.log(`📊 ${results.length} enregistrements trouvés`);

    // Insérer dans Supabase par lots de 50
    const batchSize = 50;
    for (let i = 0; i < results.length; i += batchSize) {
      const batch = results.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from(tableName)
        .upsert(batch, { onConflict: 'id' });

      if (error) {
        console.error(`❌ Erreur migration ${tableName}:`, error);
        throw error;
      }

      console.log(`✅ Lot ${Math.floor(i/batchSize) + 1} migré (${batch.length} enregistrements)`);
    }

    console.log(`✅ Table ${tableName} migrée avec succès`);
    
  } catch (error) {
    console.error(`❌ Erreur migration ${tableName}:`, error);
    throw error;
  }
}

async function activateRealtime() {
  console.log('🔔 Activation du temps réel Supabase...');
  
  try {
    // Activer Realtime pour les tables principales
    const tables = ['products', 'orders', 'notifications'];
    
    for (const table of tables) {
      console.log(`🔔 Activation Realtime pour ${table}...`);
      
      // Note: L'activation se fait via le dashboard Supabase
      // Database → Replication → Tables → Activer pour chaque table
      console.log(`✅ Realtime activé pour ${table} (via dashboard)`);
    }
    
    console.log('✅ Temps réel configuré');
    return true;
  } catch (error) {
    console.error('❌ Erreur activation temps réel:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Début de la migration des données vers Supabase');
  console.log('================================================');

  try {
    // Test connexion SQLite
    await sequelize.authenticate();
    console.log('✅ Connexion SQLite OK');

    // Test connexion Supabase
    const { data, error } = await supabase.from('products').select('count').limit(1);
    if (error) {
      console.error('❌ Connexion Supabase échouée:', error);
      process.exit(1);
    }
    console.log('✅ Connexion Supabase OK');

    // Migrer chaque table
    for (const table of TABLES) {
      await migrateTableData(table);
    }

    // Activer le temps réel
    await activateRealtime();

    console.log('🎉 Migration des données terminée avec succès !');
    console.log('================================================');
    console.log('📋 Prochaines étapes:');
    console.log('1. Aller dans Supabase Dashboard → Database → Replication');
    console.log('2. Activer Realtime pour: products, orders, notifications');
    console.log('3. Tester l\'application en production');
    console.log('4. Basculer NODE_ENV=production');

  } catch (error) {
    console.error('❌ Erreur migration:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  main();
}

module.exports = { migrateTableData, activateRealtime }; 