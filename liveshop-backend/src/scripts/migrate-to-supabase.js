const { sequelize } = require('../config/database');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables Supabase manquantes');
  console.error('SUPABASE_URL et SUPABASE_SERVICE_KEY requis');
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

async function migrateTable(tableName) {
  console.log(`🔄 Migration de la table: ${tableName}`);
  
  try {
    // Récupérer les données de SQLite
    const [results] = await sequelize.query(`SELECT * FROM ${tableName}`);
    
    if (results.length === 0) {
      console.log(`⚠️ Table ${tableName} vide, ignorée`);
      return;
    }

    console.log(`📊 ${results.length} enregistrements trouvés`);

    // Insérer dans Supabase par lots de 100
    const batchSize = 100;
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

async function createSupabaseTables() {
  console.log('🏗️ Création des tables Supabase...');
  
  const sqlFile = path.join(__dirname, '../../../supabase-setup.sql');
  
  if (!fs.existsSync(sqlFile)) {
    console.error('❌ Fichier supabase-setup.sql manquant');
    return false;
  }

  const sql = fs.readFileSync(sqlFile, 'utf8');
  const statements = sql.split(';').filter(stmt => stmt.trim());

  for (const statement of statements) {
    if (statement.trim()) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          console.error('❌ Erreur création table:', error);
        }
      } catch (error) {
        console.error('❌ Erreur SQL:', error);
      }
    }
  }

  return true;
}

async function activateRealtime() {
  console.log('🔔 Activation du temps réel Supabase...');
  
  const realtimeFile = path.join(__dirname, '../../../activate-realtime.sql');
  
  if (!fs.existsSync(realtimeFile)) {
    console.error('❌ Fichier activate-realtime.sql manquant');
    return false;
  }

  const sql = fs.readFileSync(realtimeFile, 'utf8');
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql });
    if (error) {
      console.error('❌ Erreur activation temps réel:', error);
      return false;
    }
    
    console.log('✅ Temps réel activé');
    return true;
  } catch (error) {
    console.error('❌ Erreur activation temps réel:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Début de la migration vers Supabase');
  console.log('=====================================');

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

    // Créer les tables si nécessaire
    await createSupabaseTables();

    // Activer le temps réel
    await activateRealtime();

    // Migrer chaque table
    for (const table of TABLES) {
      await migrateTable(table);
    }

    console.log('🎉 Migration terminée avec succès !');
    console.log('=====================================');
    console.log('📋 Prochaines étapes:');
    console.log('1. Mettre NODE_ENV=production');
    console.log('2. Configurer DATABASE_URL avec Supabase');
    console.log('3. Redémarrer l\'application');

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

module.exports = { migrateTable, createSupabaseTables, activateRealtime }; 