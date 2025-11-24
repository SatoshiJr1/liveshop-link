#!/usr/bin/env node

/**
 * Test simple du système de notifications
 */

const io = require('socket.io-client');

console.log('🧪 Test simple du système de notifications en temps réel');
console.log('='.repeat(60));

// Test 1: Connexion Socket.IO
console.log('\n1️⃣ Test connexion Socket.IO...');

const socket = io('http://localhost:3001', {
  transports: ['websocket', 'polling'],
  timeout: 5000
});

socket.on('connect', () => {
  console.log('✅ Socket.IO connecté avec succès !');
  console.log(`   Socket ID: ${socket.id}`);
  
  // Test 2: Ping/Pong
  console.log('\n2️⃣ Test ping/pong...');
  socket.emit('ping');
});

socket.on('pong', (latency) => {
  console.log(`✅ Pong reçu ! Latence: ${latency}ms`);
  
  // Test 3: Écouter les événements
  console.log('\n3️⃣ Écoute des événements...');
  
  socket.on('new_order', (data) => {
    console.log('✅ Événement new_order reçu:', data);
  });
  
  socket.on('notification', (data) => {
    console.log('✅ Événement notification reçu:', data);
  });
  
  console.log('✅ Listeners configurés');
  console.log('\n🎯 Système prêt ! Les notifications seront affichées ici.');
  console.log('   Créez une commande depuis l\'interface pour tester.');
  console.log('   Appuyez sur Ctrl+C pour arrêter.');
});

socket.on('connect_error', (error) => {
  console.error('❌ Erreur connexion Socket.IO:', error.message);
  process.exit(1);
});

socket.on('error', (error) => {
  console.error('❌ Erreur Socket.IO:', error);
});

// Gestion propre de l'arrêt
process.on('SIGINT', () => {
  console.log('\n\n🛑 Arrêt du test...');
  socket.disconnect();
  process.exit(0);
});

// Timeout de sécurité
setTimeout(() => {
  if (!socket.connected) {
    console.error('❌ Timeout - Impossible de se connecter au serveur');
    process.exit(1);
  }
}, 10000);
