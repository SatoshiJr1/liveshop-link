const { createClient } = require('@supabase/supabase-js');

class SupabaseRealtimeService {
  constructor() {
    this.supabase = null;
    this.isProduction = process.env.NODE_ENV === 'production';
    
    if (this.isProduction) {
      this.initializeSupabase();
    }
  }

  initializeSupabase() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('⚠️ Variables Supabase manquantes pour le temps réel');
      return;
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    console.log('✅ Service Supabase Realtime initialisé');
  }

  // Notifier un changement de produit
  async notifyProductChange(eventType, productData) {
    if (!this.isProduction || !this.supabase) {
      console.log(`🔄 [DEV] Simulation événement: ${eventType}`, productData.id);
      return;
    }

    try {
      // Insérer dans la table products pour déclencher le temps réel
      const { data, error } = await this.supabase
        .from('products')
        .upsert([productData], { onConflict: 'id' });

      if (error) {
        console.error('❌ Erreur notification Supabase:', error);
      } else {
        console.log(`✅ Événement ${eventType} envoyé à Supabase:`, productData.id);
      }
    } catch (error) {
      console.error('❌ Erreur service Supabase:', error);
    }
  }

  // Méthodes spécifiques pour chaque type d'événement
  async notifyProductCreated(product) {
    return this.notifyProductChange('INSERT', product);
  }

  async notifyProductUpdated(product) {
    return this.notifyProductChange('UPDATE', product);
  }

  async notifyProductDeleted(productId) {
    if (!this.isProduction || !this.supabase) {
      console.log(`🔄 [DEV] Simulation suppression: ${productId}`);
      return;
    }

    try {
      const { error } = await this.supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        console.error('❌ Erreur suppression Supabase:', error);
      } else {
        console.log(`✅ Suppression envoyée à Supabase: ${productId}`);
      }
    } catch (error) {
      console.error('❌ Erreur service Supabase:', error);
    }
  }

  // Notifier un changement de commande
  async notifyOrderChange(eventType, orderData) {
    if (!this.isProduction || !this.supabase) {
      console.log(`🔄 [DEV] Simulation événement commande: ${eventType}`, orderData.id);
      return;
    }

    try {
      const { data, error } = await this.supabase
        .from('orders')
        .upsert([orderData], { onConflict: 'id' });

      if (error) {
        console.error('❌ Erreur notification commande Supabase:', error);
      } else {
        console.log(`✅ Événement commande ${eventType} envoyé:`, orderData.id);
      }
    } catch (error) {
      console.error('❌ Erreur service commande Supabase:', error);
    }
  }

  // Vérifier la connexion Supabase
  async testConnection() {
    if (!this.isProduction || !this.supabase) {
      console.log('🔄 [DEV] Test connexion simulé');
      return true;
    }

    try {
      const { data, error } = await this.supabase
        .from('products')
        .select('count')
        .limit(1);

      if (error) {
        console.error('❌ Test connexion Supabase échoué:', error);
        return false;
      }

      console.log('✅ Test connexion Supabase réussi');
      return true;
    } catch (error) {
      console.error('❌ Erreur test connexion Supabase:', error);
      return false;
    }
  }
}

module.exports = new SupabaseRealtimeService(); 