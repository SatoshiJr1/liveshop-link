# 🚀 Système de Déploiement Sélectif - LiveShop Link

## 🎯 Objectif
Déployer seulement les projets modifiés au lieu du projet complet, pour un déploiement plus rapide et plus sûr.

## 📋 Scripts Disponibles

| Script | Usage | Description |
|--------|-------|-------------|
| `./deploy-watch.sh` | **Surveillance** | Détecte les modifications et recommande le déploiement |
| `./deploy-smart.sh` | **Production** | Déploie automatiquement les services modifiés |
| `./deploy-local.sh` | **Développement** | Instructions pour redémarrer localement |
| `./deploy-backend.sh` | **Backend** | Déploie uniquement le backend |
| `./deploy-web-client.sh` | **Web Client** | Déploie uniquement le web client |
| `./deploy-mobile.sh` | **Mobile App** | Déploie uniquement l'app mobile |

## 🚀 Workflow Recommandé

### 1. **Vérifier les modifications**
```bash
./deploy-watch.sh
```

### 2. **Choisir la stratégie**
- **Développement local** : `./deploy-local.sh`
- **Production sélective** : `./deploy-smart.sh`
- **Production complète** : `./deploy.sh`

## 💡 Avantages

- ⚡ **Plus rapide** : Pas de rebuild des services inchangés
- 🔒 **Plus sûr** : Moins de risque de casser les services stables
- 💰 **Plus économique** : Moins de ressources utilisées
- 🎯 **Plus précis** : Déploiement ciblé selon les besoins

## 📚 Documentation Complète
Voir `DEPLOYMENT_GUIDE.md` pour plus de détails et d'exemples.

---

**💡 Conseil :** Commencez toujours par `./deploy-watch.sh` !
