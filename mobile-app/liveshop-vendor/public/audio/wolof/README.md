# 🎤 Fichiers Audio Wolof

## 📋 Messages à Enregistrer

Ces fichiers doivent être remplacés par vos enregistrements audio réels.

### 🛒 Messages de Base
- `new-order-intro.mp3` - "Amna kou commander" (Vous avez une commande)
- `customer-name-prefix.mp3` - "Jëkkë bi" (Le client)
- `product-prefix.mp3` - "Dëkk bi" (Le produit)
- `address-prefix.mp3` - "Adres bi" (L'adresse)
- `total-price-prefix.mp3` - "Xaalis bi" (Le montant)
- `fcfa-suffix.mp3` - "FCFA"

### 📊 Messages de Statut
- `order-paid.mp3` - "Commande payée"
- `order-delivered.mp3` - "Commande livrée"
- `order-cancelled.mp3` - "Commande annulée"

## 🎙️ Instructions

1. **Enregistrez** chaque message avec votre voix en Wolof
2. **Remplacez** les fichiers placeholders par vos enregistrements
3. **Format** : MP3, 44.1kHz, 128kbps minimum
4. **Testez** en rechargeant l'application

## 🧪 Test

Une fois les fichiers remplacés, testez avec :
```javascript
// Dans la console du navigateur
import voiceNotification from '../src/utils/voiceNotification.js';
await voiceNotification.init();
await voiceNotification.testVoiceNotification();
```

## 🎵 Exemple de Séquence

Quand une nouvelle commande arrive :
1. **Audio Wolof** : "Amna kou commander"
2. **Audio Wolof** : "Jëkkë bi"
3. **Synthèse vocale** : "Mamadou Ba"
4. **Audio Wolof** : "Dëkk bi"
5. **Synthèse vocale** : "Chaussures Nike"
6. **Audio Wolof** : "Adres bi"
7. **Synthèse vocale** : "Yoff, Dakar"
8. **Audio Wolof** : "Xaalis bi"
9. **Synthèse vocale** : "15 000 FCFA" 