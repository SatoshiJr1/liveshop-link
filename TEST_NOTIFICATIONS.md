# 🧪 Test des notifications temps réel

## 1. Démarrer l'app vendeur en local
```bash
cd mobile-app/liveshop-vendor
npm run dev
```
Ouvre sur: http://localhost:5173

## 2. Connectez-vous avec un compte vendeur

## 3. Tester une notification
Dans un autre terminal, créez une notification test:

```bash
curl -X POST http://localhost:3001/api/notifications/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN_VENDEUR" \
  -d '{"message": "Test notification temps réel"}'
```

## 4. Résultat attendu
- ✅ Notification apparaît instantanément dans l'app
- ✅ Console affiche: "🛍️ Nouvelle commande reçue"
- ✅ ACK envoyé automatiquement

## 5. Pour la production
Le problème CORS sera résolu en déployant le backend avec les bonnes variables d'environnement.
