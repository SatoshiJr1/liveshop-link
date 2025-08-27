const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://yxdapixcnkytpspbqiga.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4ZGFwaXhjbmt5dHBzcGJxaWdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyOTkxNjcsImV4cCI6MjA3MTg3NTE2N30.SxQtGOvsOel4aSODcT0bn8c9TcJ-6akc16l7tvZEokY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔔 Test du temps réel Supabase');
console.log('==============================');

// Écouter les changements sur les tables
const channel = supabase
  .channel('test-realtime')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'products'
    },
    (payload) => {
      console.log('📦 Changement détecté sur products:', {
        event: payload.eventType,
        id: payload.new?.id || payload.old?.id,
        name: payload.new?.name || payload.old?.name
      });
    }
  )
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'orders'
    },
    (payload) => {
      console.log('📋 Changement détecté sur orders:', {
        event: payload.eventType,
        id: payload.new?.id || payload.old?.id,
        status: payload.new?.status || payload.old?.status
      });
    }
  )
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'notifications'
    },
    (payload) => {
      console.log('🔔 Changement détecté sur notifications:', {
        event: payload.eventType,
        id: payload.new?.id || payload.old?.id,
        title: payload.new?.title || payload.old?.title
      });
    }
  )
  .subscribe((status) => {
    console.log('📡 Status de la connexion temps réel:', status);
  });

console.log('✅ Écoute du temps réel activée');
console.log('📝 Testez maintenant :');
console.log('1. Créez un produit via l\'API');
console.log('2. Modifiez un produit');
console.log('3. Créez une commande');
console.log('4. Créez une notification');
console.log('');
console.log('⏹️  Appuyez sur Ctrl+C pour arrêter');

// Garder le script en vie
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du test temps réel');
  supabase.removeChannel(channel);
  process.exit(0);
}); 