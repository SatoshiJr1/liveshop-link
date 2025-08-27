import { createClient } from '@supabase/supabase-js'

// Configuration Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

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