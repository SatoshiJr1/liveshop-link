const sqlite3 = require('sqlite3').verbose();
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Configuration
const dbPath = path.join(__dirname, 'database.sqlite');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateTable(tableName) {
  console.log(`🔄 Migration: ${tableName}`);
  
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath);
    
    db.all(`SELECT * FROM ${tableName}`, async (err, rows) => {
      if (err) {
        console.error(`❌ Erreur lecture ${tableName}:`, err);
        reject(err);
        return;
      }
      
      if (rows.length === 0) {
        console.log(`⚠️ ${tableName}: 0 enregistrements`);
        resolve();
        return;
      }
      
      console.log(`📊 ${tableName}: ${rows.length} enregistrements`);
      
      try {
        // Insérer par lots de 10
        const batchSize = 10;
        for (let i = 0; i < rows.length; i += batchSize) {
          const batch = rows.slice(i, i + batchSize);
          
          const { error } = await supabase
            .from(tableName)
            .upsert(batch, { onConflict: 'id' });
          
          if (error) {
            console.error(`❌ Erreur insertion ${tableName}:`, error);
            reject(error);
            return;
          }
          
          console.log(`✅ ${tableName}: lot ${Math.floor(i/batchSize) + 1}/${Math.ceil(rows.length/batchSize)}`);
        }
        
        console.log(`✅ ${tableName}: migration terminée`);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
    
    db.close();
  });
}

async function main() {
  console.log('🚀 Migration simple SQLite → Supabase');
  console.log('=====================================');
  
  const tables = ['sellers', 'products', 'product_variants', 'lives', 'live_products', 'orders', 'notifications', 'credit_transactions', 'otps'];
  
  try {
    for (const table of tables) {
      await migrateTable(table);
    }
    
    console.log('🎉 Migration terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur migration:', error);
    process.exit(1);
  }
}

main(); 