import { createClient } from '@supabase/supabase-js'

// Configuration Supabase - Valeurs de production
const supabaseUrl = 'https://yxdapixcnkytpspbqiga.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4ZGFwaXhjbmt5dHBzcGJxaWdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyOTkxNjcsImV4cCI6MjA3MTg3NTE2N30.SxQtGOvsOel4aSODcT0bn8c9TcJ-6akc16l7tvZEokY'

// Créer le client Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

export default supabase

// Fonctions utilitaires pour le temps réel
export const realtimeService = {
  // Écouter les changements de produits directement
  subscribeToProducts(callback) {
    return supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'products' 
        },
        (payload) => {
          console.log('🔄 Changement produit détecté:', payload)
          callback(payload)
        }
      )
      .subscribe()
  },

  // Écouter les changements de lives
  subscribeToLives(callback) {
    return supabase
      .channel('lives-changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'lives' 
        },
        (payload) => {
          console.log('🎥 Changement live détecté:', payload)
          callback(payload)
        }
      )
      .subscribe()
  },

  // Écouter les changements de commandes
  subscribeToOrders(callback) {
    return supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'orders' 
        },
        (payload) => {
          console.log('🛒 Changement commande détecté:', payload)
          callback(payload)
        }
      )
      .subscribe()
  },

  // Se désabonner d'un canal
  unsubscribe(channel) {
    if (channel) {
      supabase.removeChannel(channel)
    }
  }
} 