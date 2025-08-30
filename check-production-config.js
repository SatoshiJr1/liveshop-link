#!/usr/bin/env node

/**
 * Script pour vérifier et corriger la configuration de production
 */

console.log('🔍 Vérification de la configuration de production...');
console.log('==================================================');

// Vérifier les variables d'environnement critiques
const requiredEnvVars = [
  'NODE_ENV',
  'DATABASE_URL',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_KEY',
  'JWT_SECRET',
  'CORS_ORIGIN'
];

console.log('📋 Variables d\'environnement requises :');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${varName.includes('SECRET') || varName.includes('KEY') ? '***CONFIGURÉ***' : value.substring(0, 50) + '...'}`);
  } else {
    console.log(`❌ ${varName}: MANQUANTE`);
  }
});

console.log('\n🔧 Instructions pour corriger le serveur :');
console.log('==========================================');
console.log('1. Connectez-vous à votre serveur VPS');
console.log('2. Allez dans le dossier du projet :');
console.log('   cd /path/to/liveshop-backend');
console.log('');
console.log('3. Créez/éditez le fichier .env :');
console.log('   nano .env');
console.log('');
console.log('4. Ajoutez ces variables (remplacez par vos vraies valeurs) :');
console.log('');
console.log('NODE_ENV=production');
console.log('DATABASE_URL=postgresql://postgres:manou24680@db.yxdapixcnkytpspbqiga.supabase.co:5432/postgres');
console.log('SUPABASE_URL=https://yxdapixcnkytpspbqiga.supabase.co');
console.log('SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
console.log('SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
console.log('JWT_SECRET=votre_jwt_secret_tres_long_et_complexe');
console.log('CORS_ORIGIN=https://livelink.store,https://space.livelink.store');
console.log('DEBUG=true');
console.log('');
console.log('5. Redémarrez le service :');
console.log('   sudo systemctl restart liveshop-backend');
console.log('   # ou si vous utilisez PM2 :');
console.log('   pm2 restart all');
console.log('');
console.log('6. Vérifiez les logs :');
console.log('   sudo journalctl -u liveshop-backend -f');
console.log('   # ou avec PM2 :');
console.log('   pm2 logs');
console.log('');
console.log('7. Testez l\'API :');
console.log('   curl https://api.livelink.store/api/health');
console.log('');

// Test de connexion à la base de données si les variables sont présentes
if (process.env.DATABASE_URL) {
  console.log('🧪 Test de connexion à la base de données...');
  const { Sequelize } = require('sequelize');
  
  try {
    const sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    });
    
    sequelize.authenticate()
      .then(() => {
        console.log('✅ Connexion à la base de données réussie !');
        sequelize.close();
      })
      .catch(err => {
        console.log('❌ Erreur de connexion à la base de données :', err.message);
      });
  } catch (error) {
    console.log('❌ Erreur lors du test de connexion :', error.message);
  }
} 