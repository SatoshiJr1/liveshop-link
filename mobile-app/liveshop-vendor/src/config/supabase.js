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
  // Écouter les nouvelles commandes
  subscribeToOrders(sellerId, callback) {
    return supabase
      .channel(`orders-${sellerId}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'orders',
          filter: `seller_id=eq.${sellerId}`
        },
        (payload) => {
          console.log('🆕 Nouvelle commande reçue:', payload)
          callback(payload)
        }
      )
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'orders',
          filter: `seller_id=eq.${sellerId}`
        },
        (payload) => {
          console.log('✏️ Commande mise à jour:', payload)
          callback(payload)
        }
      )
      .subscribe()
  },

  // Écouter les changements de produits du vendeur
  subscribeToSellerProducts(sellerId, callback) {
    return supabase
      .channel(`products-${sellerId}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'products',
          filter: `seller_id=eq.${sellerId}`
        },
        (payload) => {
          console.log('🔄 Changement produit vendeur:', payload)
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