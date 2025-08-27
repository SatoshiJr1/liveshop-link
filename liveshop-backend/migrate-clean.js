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

// Fonction de nettoyage des données
function cleanData(data, tableName) {
  const cleaned = { ...data };
  
  // Nettoyer les URLs trop longues
  const urlFields = ['image_url', 'wave_qr_code_url', 'orange_money_qr_code_url', 'payment_proof_url'];
  urlFields.forEach(field => {
    if (cleaned[field] && cleaned[field].length > 1000) {
      console.log(`🧹 Nettoyage ${field} (${cleaned[field].length} → 1000 caractères)`);
      cleaned[field] = cleaned[field].substring(0, 1000);
    }
  });
  
  // Nettoyer les champs JSON
  const jsonFields = ['attributes', 'images', 'tags', 'payment_settings', 'payment_methods_enabled', 'dimensions', 'metadata'];
  jsonFields.forEach(field => {
    if (cleaned[field]) {
      try {
        // Si c'est déjà un objet, le garder
        if (typeof cleaned[field] === 'object') {
          return;
        }
        // Si c'est une string JSON, essayer de la parser
        const parsed = JSON.parse(cleaned[field]);
        cleaned[field] = parsed;
      } catch (e) {
        // Si le parsing échoue, mettre un objet vide
        console.log(`🧹 Nettoyage ${field} (JSON invalide → {})`);
        cleaned[field] = {};
      }
    }
  });
  
  // Nettoyer les champs texte trop longs
  const textFields = ['description', 'message', 'comment'];
  textFields.forEach(field => {
    if (cleaned[field] && cleaned[field].length > 2000) {
      console.log(`🧹 Nettoyage ${field} (${cleaned[field].length} → 2000 caractères)`);
      cleaned[field] = cleaned[field].substring(0, 2000);
    }
  });
  
  // Nettoyer les timestamps
  const timestampFields = ['created_at', 'updated_at', 'expires_at', 'sent_at', 'date'];
  timestampFields.forEach(field => {
    if (cleaned[field]) {
      // Convertir en format ISO si nécessaire
      try {
        const date = new Date(cleaned[field]);
        if (!isNaN(date.getTime())) {
          cleaned[field] = date.toISOString();
        }
      } catch (e) {
        console.log(`🧹 Nettoyage ${field} (date invalide)`);
        cleaned[field] = new Date().toISOString();
      }
    }
  });
  
  return cleaned;
}

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
        // Nettoyer et insérer par lots de 10
        const batchSize = 10;
        for (let i = 0; i < rows.length; i += batchSize) {
          const batch = rows.slice(i, i + batchSize);
          
          // Nettoyer chaque enregistrement
          const cleanedBatch = batch.map(row => cleanData(row, tableName));
          
          const { error } = await supabase
            .from(tableName)
            .upsert(cleanedBatch, { onConflict: 'id' });
          
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
  console.log('🚀 Migration avec nettoyage SQLite → Supabase');
  console.log('=============================================');
  
  const tables = ['sellers', 'products', 'product_variants', 'lives', 'live_products', 'orders', 'notifications', 'credit_transactions', 'otps'];
  
  try {
    for (const table of tables) {
      await migrateTable(table);
    }
    
    console.log('🎉 Migration terminée avec succès !');
    console.log('=====================================');
    console.log('📋 Prochaines étapes:');
    console.log('1. Aller dans Supabase Dashboard → Database → Replication');
    console.log('2. Activer Realtime pour: products, orders, notifications');
    console.log('3. Tester l\'application en production');
    
  } catch (error) {
    console.error('❌ Erreur migration:', error);
    process.exit(1);
  }
}

main(); 