const axios = require('axios');

console.log('🚀 Test de l\'API pour déclencher le temps réel');
console.log('==============================================');

// Configuration API
const API_BASE = 'http://127.0.0.1:3001/api';

// Test de création d'un produit
async function testCreateProduct() {
  try {
    console.log('📦 Création d\'un produit de test...');
    
    const response = await axios.post(`${API_BASE}/products`, {
      seller_id: 1,
      name: 'Test Produit Temps Réel ' + Date.now(),
      description: 'Produit de test pour vérifier le temps réel Supabase',
      price: 5000.00,
      category: 'test',
      stock_quantity: 10,
      status: 'active'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Produit créé avec succès:', response.data);
    return response.data.id;
  } catch (error) {
    console.error('❌ Erreur lors de la création du produit:', error.response?.data || error.message);
    return null;
  }
}

// Test de mise à jour d'un produit
async function testUpdateProduct(productId) {
  if (!productId) return;
  
  try {
    console.log('🔄 Mise à jour du produit...');
    
    const response = await axios.put(`${API_BASE}/products/${productId}`, {
      name: 'Produit Mis à Jour ' + Date.now(),
      price: 7500.00
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Produit mis à jour avec succès:', response.data);
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error.response?.data || error.message);
  }
}

// Test de suppression d'un produit
async function testDeleteProduct(productId) {
  if (!productId) return;
  
  try {
    console.log('🗑️  Suppression du produit...');
    
    const response = await axios.delete(`${API_BASE}/products/${productId}`);
    
    console.log('✅ Produit supprimé avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error.response?.data || error.message);
  }
}

// Exécution des tests
async function runTests() {
  console.log('⏳ Attendez 3 secondes pour que le temps réel se connecte...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const productId = await testCreateProduct();
  
  if (productId) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    await testUpdateProduct(productId);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    await testDeleteProduct(productId);
  }
  
  console.log('✅ Tests terminés !');
  process.exit(0);
}

runTests(); 