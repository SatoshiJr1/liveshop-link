const fs = require('fs');
const path = require('path');

// Lire le fichier products.js
const filePath = path.join(__dirname, 'src/routes/products.js');
let content = fs.readFileSync(filePath, 'utf8');

console.log('🔄 Mise à jour du fichier products.js...');

// Ajouter l'import du service Supabase
if (!content.includes('supabaseService')) {
  content = content.replace(
    '// Middleware de crédits\nconst { requireAndConsumeCredits } = require(\'../middleware/creditMiddleware\');',
    '// Middleware de crédits\nconst { requireAndConsumeCredits } = require(\'../middleware/creditMiddleware\');\n\n// Service Supabase pour les notifications temps réel\nconst supabaseService = require(\'../services/supabaseService\');'
  );
}

// Remplacer les notifications product_created
content = content.replace(
  /\/\/ Émettre l'événement temps réel pour tous les clients\s+if \(global\.notifyAllSellers\) \{\s+global\.notifyAllSellers\('product_created', \{[\s\S]*?\}\);\s+\}/g,
  `// Notification temps réel via Supabase
    await supabaseService.notifyProductCreated({
      product: createdProduct,
      seller: {
        id: req.seller.id,
        name: req.seller.name,
        public_link_id: req.seller.public_link_id
      }
    });`
);

// Remplacer les notifications product_updated
content = content.replace(
  /\/\/ Émettre l'événement temps réel pour tous les clients\s+if \(global\.notifyAllSellers\) \{\s+global\.notifyAllSellers\('product_updated', \{[\s\S]*?\}\);\s+\}/g,
  `// Notification temps réel via Supabase
    await supabaseService.notifyProductUpdated({
      product: updatedProduct,
      seller: {
        id: req.seller.id,
        name: req.seller.name,
        public_link_id: req.seller.public_link_id
      }
    });`
);

// Remplacer les notifications product_deleted
content = content.replace(
  /\/\/ Émettre l'événement temps réel pour tous les clients\s+if \(global\.notifyAllSellers\) \{\s+global\.notifyAllSellers\('product_deleted', \{[\s\S]*?\}\);\s+\}/g,
  `// Notification temps réel via Supabase
    await supabaseService.notifyProductDeleted({
      product: {
        id: product.id,
        name: product.name,
        seller_id: product.seller_id
      },
      seller: {
        id: req.seller.id,
        name: req.seller.name,
        public_link_id: req.seller.public_link_id
      }
    });`
);

// Écrire le fichier mis à jour
fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Fichier products.js mis à jour avec Supabase'); 