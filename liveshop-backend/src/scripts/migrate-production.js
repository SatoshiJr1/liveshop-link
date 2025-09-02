const { sequelize } = require('../config/database');
const { Comment } = require('../models');

console.log('🚀 Migration Production : Création des tables Comment...');

const migrateProduction = async () => {
  try {
    console.log('📋 Vérification de la connexion...');
    await sequelize.authenticate();
    console.log('✅ Connexion établie');

    console.log('🔍 Vérification des tables existantes...');
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'comments'
    `);

    if (tables.length > 0) {
      console.log('⚠️ Table "comments" existe déjà');
      
      // Vérifier la structure
      const [columns] = await sequelize.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'comments'
        ORDER BY ordinal_position
      `);
      
      console.log('📊 Structure actuelle de la table comments:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });

      // Vérifier si order_id existe
      const hasOrderId = columns.some(col => col.column_name === 'order_id');
      if (!hasOrderId) {
        console.log('❌ Colonne "order_id" manquante, ajout...');
        await sequelize.query(`
          ALTER TABLE comments 
          ADD COLUMN order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE
        `);
        console.log('✅ Colonne order_id ajoutée');
      } else {
        console.log('✅ Colonne order_id existe déjà');
      }

    } else {
      console.log('📝 Création de la table "comments"...');
      await sequelize.sync({ alter: true });
      console.log('✅ Table comments créée');
    }

    // Vérifier les index
    console.log('🔍 Vérification des index...');
    const [indexes] = await sequelize.query(`
      SELECT indexname, indexdef
      FROM pg_indexes 
      WHERE tablename = 'comments'
    `);
    
    console.log('📊 Index existants:');
    indexes.forEach(idx => {
      console.log(`  - ${idx.indexname}: ${idx.indexdef}`);
    });

    console.log('🎉 Migration terminée avec succès !');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
};

// Exécuter la migration
migrateProduction();
