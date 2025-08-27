const supabase = require('../config/supabase');

class SupabaseService {
  constructor() {
    this.supabase = supabase;
  }

  // Notifier tous les clients des changements de produits
  async notifyProductChange(eventType, productData) {
    try {
      console.log(`📡 Supabase: Émission ${eventType} pour produit:`, productData.id);
      
      // Insérer directement dans la table products pour déclencher l'événement temps réel
      if (eventType === 'INSERT') {
        const { data, error } = await this.supabase
          .from('products')
          .insert({
            id: productData.id,
            name: productData.name,
            price: productData.price,
            seller_id: productData.seller_id,
            created_at: new Date().toISOString()
          });

        if (error) {
          console.error('❌ Erreur Supabase notification:', error);
          return false;
        }
      } else if (eventType === 'UPDATE') {
        const { data, error } = await this.supabase
          .from('products')
          .update({
            name: productData.name,
            price: productData.price,
            updated_at: new Date().toISOString()
          })
          .eq('id', productData.id);

        if (error) {
          console.error('❌ Erreur Supabase notification:', error);
          return false;
        }
      } else if (eventType === 'DELETE') {
        const { data, error } = await this.supabase
          .from('products')
          .delete()
          .eq('id', productData.id);

        if (error) {
          console.error('❌ Erreur Supabase notification:', error);
          return false;
        }
      }

      console.log('✅ Notification Supabase envoyée:', eventType);
      return true;
    } catch (error) {
      console.error('❌ Erreur service Supabase:', error);
      return false;
    }
  }

  // Notifier les changements de produits (création, mise à jour, suppression)
  async notifyProductCreated(product) {
    return this.notifyProductChange('INSERT', product);
  }

  async notifyProductUpdated(product) {
    return this.notifyProductChange('UPDATE', product);
  }

  async notifyProductDeleted(product) {
    return this.notifyProductChange('DELETE', product);
  }

  // Méthode de compatibilité avec l'ancien système Socket.IO
  async notifyAllSellers(eventType, data) {
    console.log(`🔄 Supabase: Conversion ${eventType} vers Supabase`);
    
    switch (eventType) {
      case 'product_created':
        return this.notifyProductCreated(data);
      case 'product_updated':
        return this.notifyProductUpdated(data);
      case 'product_deleted':
        return this.notifyProductDeleted(data);
      default:
        console.log('⚠️ Événement non géré:', eventType);
        return false;
    }
  }
}

module.exports = new SupabaseService(); 