// Configuration des domaines selon l'environnement
const config = {
  development: {
    clientDomain: 'http://localhost:5174', // Web-client (boutique publique)
    backendDomain: 'http://localhost:3001'
  },
  production: {
    clientDomain: import.meta.env.VITE_CLIENT_DOMAIN || 'https://livelink.store',
    backendDomain: import.meta.env.VITE_BACKEND_DOMAIN || 'https://api.livelink.store'
  }
};

// Détecter l'environnement
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '192.168.1.36';
const environment = isDevelopment ? 'development' : 'production';

// Exporter la configuration actuelle
export const currentConfig = config[environment];

// Fonction utilitaire pour obtenir le domaine client
export const getClientDomain = () => {
  return currentConfig.clientDomain;
};

// Fonction utilitaire pour obtenir le domaine backend
export const getBackendDomain = () => {
  return currentConfig.backendDomain;
};

// Fonction pour construire le lien public d'un vendeur
export const getPublicLink = (sellerId) => {
  return `${getClientDomain()}/${sellerId}`;
};

export default config; 