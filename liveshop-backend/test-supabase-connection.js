const { Sequelize } = require('sequelize');

console.log('🔍 Test de connexion Supabase');
console.log('=============================');

// Remplacez YOUR_PASSWORD par votre vrai mot de passe
const DATABASE_URL = 'postgresql://postgres:YOUR_PASSWORD@db.yxdapixcnkytpspbqiga.supabase.co:5432/postgres';

async function testConnection() {
  const sequelize = new Sequelize(DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false }
    },
    logging: false
  });

  try {
    await sequelize.authenticate();
    console.log('✅ Connexion Supabase réussie !');
    
    // Vérifier les informations de la base
    const [results] = await sequelize.query('SELECT current_database() as db_name, current_user as user, version() as version');
    console.log('📊 Base de données:', results[0].db_name);
    console.log('👤 Utilisateur:', results[0].user);
    console.log('🔧 Version PostgreSQL:', results[0].version.split(' ')[0]);
    
    // Compter les tables
    const [tables] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('📋 Nombre de tables:', tables[0].count);
    
    // Lister les tables
    const [tableList] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('📋 Tables disponibles:', tableList.map(t => t.table_name).join(', '));
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    console.log('');
    console.log('💡 Solutions possibles :');
    console.log('1. Vérifiez que le mot de passe est correct');
    console.log('2. Vérifiez que l\'URL est correcte');
    console.log('3. Vérifiez que votre IP est autorisée dans Supabase');
  } finally {
    await sequelize.close();
  }
}

testConnection(); 