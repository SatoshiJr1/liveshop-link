// Script de test pour vérifier le système de temps réel
const { createClient } = require('@supabase/supabase-js');

// Configuration directe pour le test
const supabaseUrl = 'https://uvvwcaiyyxrpurqimxtz.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'your-service-key-here';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testRealtimeSystem() {
  console.log('🧪 Test du système de temps réel...');
  console.log('🔗 URL:', supabaseUrl);
  console.log('🔑 Clé:', supabaseServiceKey.substring(0, 20) + '...');
  
  try {
    // 1. Test de connexion Supabase
    console.log('1️⃣ Test de connexion Supabase...');
    const { data, error } = await supabase
      .from('product_events')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Erreur connexion:', error.message);
      return;
    }
    
    console.log('✅ Connexion Supabase réussie');
    
    // 2. Test d'insertion d'événement
    console.log('2️⃣ Test d\'insertion d\'événement...');
    const testEvent = {
      event_type: 'INSERT',
      product_data: {
        id: 999,
        name: 'Test Produit',
        price: 1000,
        seller_id: 1
      },
      timestamp: new Date().toISOString()
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('product_events')
      .insert(testEvent)
      .select();
    
    if (insertError) {
      console.log('❌ Erreur insertion:', insertError.message);
      return;
    }
    
    console.log('✅ Événement inséré:', insertData);
    
    // 3. Test de récupération d'événements
    console.log('3️⃣ Test de récupération d\'événements...');
    const { data: events, error: eventsError } = await supabase
      .from('product_events')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(5);
    
    if (eventsError) {
      console.log('❌ Erreur récupération:', eventsError.message);
      return;
    }
    
    console.log('✅ Événements récupérés:', events.length);
    events.forEach(event => {
      console.log(`   - ${event.event_type}: ${event.product_data.name}`);
    });
    
    console.log('🎉 Test terminé avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le test
testRealtimeSystem(); 