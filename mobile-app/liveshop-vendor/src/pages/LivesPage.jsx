import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LiveDetail from './LiveDetail';
import { Badge } from '@/components/ui/badge';
import { 
  Copy, 
  ExternalLink, 
  Plus, 
  Edit2, 
  Trash2, 
  Repeat,
  Share2,
  Eye,
  Settings,
  Play,
  Users,
  Calendar,
  Package,
  Link,
  Globe,
  Video,
  Radio,
  Zap,
  Heart,
  MessageCircle,
  Send,
  CheckCircle
} from 'lucide-react';
import LiveIcon from '/images/diffusion-en-direct.png';
import { getPublicLink } from '../config/domains';

// Composant SVG LiveIconGlitch
function LiveIconGlitch({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="live-gradient" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fd5d47"/>
          <stop offset="0.5" stopColor="#ff2a68"/>
          <stop offset="1" stopColor="#6c63ff"/>
        </linearGradient>
      </defs>
      {/* TV stylisée */}
      <rect x="8" y="18" width="48" height="32" rx="12" stroke="url(#live-gradient)" strokeWidth="4" fill="none"/>
      <path d="M20 18 L32 8 L44 18" stroke="url(#live-gradient)" strokeWidth="4" fill="none" strokeLinecap="round"/>
      {/* Effet glitch : texte cyan décalé à gauche */}
      <text x="31" y="44" textAnchor="middle" fontWeight="bold" fontSize="18" fill="#00fff7" fontFamily="Poppins, Arial, sans-serif" opacity="0.7">LIVE</text>
      {/* Effet glitch : texte rose décalé à droite */}
      <text x="33" y="44" textAnchor="middle" fontWeight="bold" fontSize="18" fill="#ff2a68" fontFamily="Poppins, Arial, sans-serif" opacity="0.7">LIVE</text>
      {/* Texte principal dégradé */}
      <text x="32" y="44" textAnchor="middle" fontWeight="bold" fontSize="18" fill="url(#live-gradient)" fontFamily="Poppins, Arial, sans-serif">LIVE</text>
    </svg>
  );
}

export default function LivesPage() {
  const { seller } = useAuth();
  const [lives, setLives] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [liveCreated, setLiveCreated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedLive, setSelectedLive] = useState(null);
  const [copiedLiveId, setCopiedLiveId] = useState(null);
  const [search] = useState('');
  // const [sortOrder, setSortOrder] = useState('desc'); // plus utilisé
  const [pageSize] = useState(5);
  const [deletingId, setDeletingId] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);

  // Pour la duplication
  // const [duplicateLive, setDuplicateLive] = useState(null); // plus utilisé

  // Récupérer tous les lives du vendeur
  useEffect(() => {
    if (!seller?.id) return;
    async function fetchLives() {
      try {
        setLoading(true);
        const res = await api.getLives(seller.id);
        setLives(Array.isArray(res) ? res : (res.lives || []));
      } catch {
        setLives([]);
      } finally {
        setLoading(false);
      }
    }
    fetchLives();
  }, [seller, liveCreated]);

  // Récupérer les produits du vendeur pour le formulaire
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const res = await api.getProducts();
        setProducts(Array.isArray(res) ? res : (res.products || []));
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const handleProductSelect = (id) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const handleCreateLive = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!title || !date || selectedProducts.length === 0) {
      setError('Remplis tous les champs et sélectionne au moins un produit.');
      return;
    }
    try {
      setLoading(true);
      const sellerId = seller?.id;
      const liveRes = await api.createLive({ title, date, sellerId });
      await api.associateProductsToLive(liveRes.id, selectedProducts);
      setLiveCreated(liveRes);
      setShowCreate(false);
      setTitle('');
      setDate('');
      setSelectedProducts([]);
      setSuccess('Live créé avec succès !');
    } catch {
      setError('Erreur lors de la création du live.');
    } finally {
      setLoading(false);
    }
  };

  // Suppression d'un live
  const handleDeleteLive = async (liveId) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce live ?')) return;
    setDeletingId(liveId);
    try {
      await api.deleteLive(liveId);
      setLives(lives => lives.filter(l => l.id !== liveId));
    } catch {
      alert('Erreur lors de la suppression du live.');
    } finally {
      setDeletingId(null);
    }
  };

  // Filtrage et tri
  // const filteredLives = lives
  //   .filter(live => live.title.toLowerCase().includes(search.toLowerCase()))
  //   .sort((a, b) => sortField === 'desc' ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date));

  // Pagination calculée
  // Recherche/tri avancé (exemple sur titre, date)
  const [sortField] = useState('date');
  const [sortDirection] = useState('desc');
  const advancedFilteredLives = lives
    .filter(live => live.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (sortField === 'date') {
        valA = new Date(valA);
        valB = new Date(valB);
      }
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  // Utiliser advancedFilteredLives pour la pagination
  const totalPages = Math.ceil(advancedFilteredLives.length / pageSize);
  const advancedPaginatedLives = advancedFilteredLives.slice((page - 1) * pageSize, page * pageSize);

  // Badge statut live
  const getLiveStatus = (live) => {
    const now = new Date();
    const liveDate = new Date(live.date);
    return liveDate >= new Date(now.toDateString()) ? 'En cours' : 'Terminé';
  };

  // Handler duplication
  const handleDuplicateLive = (live) => {
    setTitle(live.title + ' (copie)');
    setDate('');
    setSelectedProducts(live.products ? live.products.map(p => p.id) : []);
    setShowCreate(true);
  };

  // Génère dynamiquement le lien public (web-client) selon l'environnement
  // Lien public de la boutique
  const getPublicShopLink = () => {
    if (!seller?.public_link_id) return '#';
    return getPublicLink(seller.public_link_id);
  };

  // Lien public d'un live
  const getLivePublicLink = (live) => {
    if (!seller?.public_link_id) return '#';
    return `${getPublicLink(seller.public_link_id)}/live/${live.slug}`;
  };

  const handleCopyLink = async (url, liveId = null) => {
    try {
      // Essayer d'abord l'API Clipboard moderne
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback pour les contextes non sécurisés
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Erreur lors de la copie:', err);
        }
        
        document.body.removeChild(textArea);
      }
      
      setCopiedLiveId(liveId);
      setSuccess('Lien copié !');
      setTimeout(() => {
        setSuccess('');
        setCopiedLiveId(null);
      }, 1500);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
      setError('Erreur lors de la copie du lien');
      setTimeout(() => {
        setError('');
      }, 3000);
    }
  };

  // Dernier live créé (le plus récent)
  const lastLive = lives.length > 0 ? [...lives].sort((a, b) => new Date(b.date) - new Date(a.date))[0] : null;

  return (
    <div className="w-full max-w-full md:max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-8 mt-4 md:mt-8 min-h-screen flex flex-col pb-20 sm:pb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6 gap-2 md:gap-4 ">
        <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-400 flex items-center gap-2">
          <div className="relative">
            <Video className="w-8 h-8 text-red-500" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          </div>
          Mes Lives
        </h2>
        {/* Le bouton 'Créer un live' n'est plus ici sur mobile */}
        <div className="hidden md:flex flex-col gap-3 w-full md:w-auto">
          <button 
            onClick={() => setShowCreate(!showCreate)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded transition w-full md:w-auto whitespace-nowrap"
          >
            {showCreate ? 'Annuler' : 'Créer un live'}
          </button>
        </div>
      </div>
      {success && <div className="mb-4 text-green-600 dark:text-green-400 font-medium">{success}</div>}
      {error && <div className="mb-4 text-red-600 dark:text-red-400 font-medium">{error}</div>}

      {/* Lien public de la boutique */}
      {seller?.public_link_id && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="min-w-0 flex-1">
              <span className="font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Lien public de la boutique :
              </span>
              <div className="font-mono text-blue-800 dark:text-blue-200 text-sm break-all mt-1">
                {getPublicShopLink()}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 min-w-0">
              <button 
                onClick={() => handleCopyLink(getPublicShopLink())}
                className={`px-3 py-2 rounded text-sm font-medium border whitespace-nowrap transition-all duration-300 flex items-center gap-2 ${
                  copiedLiveId === 'shop' 
                    ? 'bg-green-500 hover:bg-green-600 text-white border-green-400 scale-105' 
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-800/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-600 hover:scale-105'
                }`}
              >
                {copiedLiveId === 'shop' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copiedLiveId === 'shop' ? 'Lien copié !' : 'Copier le lien'}
              </button>
              <a 
                href={getPublicShopLink()} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium text-center whitespace-nowrap flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Voir la page
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Lien du dernier live créé */}
      {lastLive && (
        <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="min-w-0 flex-1">
              <span className="font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                <Radio className="w-4 h-4" />
                Dernier live créé :
              </span>
              <div className="font-medium dark:text-white break-words mt-1">
                {lastLive.title}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                ({new Date(lastLive.date).toLocaleString()})
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 min-w-0">
              <button 
                onClick={() => handleCopyLink(getLivePublicLink(lastLive), lastLive.id)}
                className="bg-gray-100 dark:bg-gray-700 hover:bg-purple-100 dark:hover:bg-purple-800/30 text-purple-700 dark:text-purple-300 px-3 py-2 rounded text-sm font-medium border border-purple-200 dark:border-purple-600 whitespace-nowrap transition-colors duration-200 active:scale-95 flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                {copiedLiveId === lastLive.id ? 'Lien copié !' : 'Copier le lien'}
              </button>
              <a 
                href={getLivePublicLink(lastLive)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm font-medium text-center whitespace-nowrap flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Voir la page
              </a>
            </div>
          </div>
        </div>
      )}

      {showCreate && (
        <form onSubmit={handleCreateLive} className="space-y-5 mb-8 bg-purple-50 dark:bg-purple-900/20 p-6 rounded ">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
              <Video className="w-4 h-4" />
              Titre du live
            </label>
            <input value={title} onChange={e => setTitle(e.target.value)} required
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white " />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date et heure
            </label>
            <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} required
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white " />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Produits à mettre en avant
            </label>
            <div className="grid grid-cols-1 gap-2 ">
              {products.length === 0 && <span className="text-gray-400 dark:text-gray-500 text-sm ">Aucun produit disponible</span>}
              {products.map(prod => (
                <label key={prod.id} className="flex items-center space-x-2 cursor-pointer ">
                  <input type="checkbox" checked={selectedProducts.includes(prod.id)} onChange={() => handleProductSelect(prod.id)}
                    className="accent-purple-600 w-4 h-4 " />
                  <span className="dark:text-white ">{prod.name}</span>
                </label>
              ))}
            </div>
          </div>
          {error && <div className="text-red-600 dark:text-red-400 text-sm font-medium ">{error}</div>}
          <div className="flex gap-3">
            <button 
              type="button"
              onClick={() => {
                setShowCreate(false);
                setTitle('');
                setDate('');
                setSelectedProducts([]);
                setError('');
              }}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition"
            >
              Annuler
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded transition disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Création...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Créer le live
                </>
              )}
            </button>
          </div>
        </form>
      )}
      {/* Bouton flottant mobile pour créer un live */}
      {!showCreate && (
        <button
          onClick={() => setShowCreate(true)}
          className="fixed bottom-29 right-6 z-40 bg-purple-600 hover:bg-purple-700 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-xl md:hidden animate-fade-in-up"
          style={{ boxShadow: '0 4px 24px rgba(80,0,120,0.18)' }}
          title="Créer un live"
        >
          <Video className="w-8 h-8" />
        </button>
      )}
      {/* Liste paginée des lives */}
      <div className="space-y-4 flex-1 w-full ">
        {advancedPaginatedLives.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 ">Aucun live trouvé.</div>
        ) : (
          advancedPaginatedLives.map(live => (
            <div key={live.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 w-full mb-2">
              {/* Ligne titre + icône live + badge */}
              <div className="flex items-center gap-3 mb-1">
                {/* Icône live moderne */}
                <div className="relative">
                  <Video className="w-8 h-8 text-red-500" />
                  {getLiveStatus(live) === 'En cours' && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                </div>
                <span className="font-bold text-lg text-gray-900 dark:text-white">{live.title}</span>
                {getLiveStatus(live) === 'En cours' && (
                  <span className="ml-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-live-pulse flex items-center gap-1">
                    <Radio className="w-3 h-3" />
                    EN LIVE
                  </span>
                )}
                {getLiveStatus(live) === 'Terminé' && (
                  <span className="ml-2 bg-gray-300 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">Terminé</span>
                )}
              </div>
              {/* Infos date + produits */}
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                <Calendar className="w-3 h-3" />
                <span>{new Date(live.date).toLocaleString()}</span>
                <span>•</span>
                <Package className="w-3 h-3" />
                <span>{live.products ? live.products.length : '?'} produits</span>
              </div>
              {/* Actions en ligne avec icônes plus parlantes */}
              <div className="flex gap-2 mt-2">
                <button 
                  onClick={() => handleCopyLink(getLivePublicLink(live), live.id)} 
                  title={copiedLiveId === live.id ? "Lien copié !" : "Copier le lien de partage"} 
                  className={`p-2 rounded-full transition-all duration-300 ${
                    copiedLiveId === live.id 
                      ? 'text-white bg-green-500 hover:bg-green-600 scale-110' 
                      : 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:scale-105'
                  }`}
                >
                  {copiedLiveId === live.id ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Share2 className="w-5 h-5" />
                  )}
                </button>
                <a 
                  href={getLivePublicLink(live)} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  title="Regarder le live" 
                  className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 p-2 rounded-full bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                >
                  <Play className="w-5 h-5" />
                </a>
                <button 
                  onClick={() => setSelectedLive(live)} 
                  title="Paramètres du live" 
                  className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 p-2 rounded-full bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleDuplicateLive(live)} 
                  title="Dupliquer ce live" 
                  className="text-purple-400 hover:text-purple-700 dark:text-purple-300 dark:hover:text-purple-200 p-2 rounded-full bg-purple-100 dark:bg-purple-900/20 hover:bg-purple-200 dark:hover:bg-purple-900/30 transition-colors"
                >
                  <Repeat className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleDeleteLive(live.id)} 
                  disabled={deletingId === live.id} 
                  title="Supprimer ce live" 
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-full bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-6 w-full">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))} 
            disabled={page === 1} 
            className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 w-full sm:w-auto dark:text-white font-medium"
          >
            Précédent
          </button>
          <span className="text-sm dark:text-white font-medium">
            Page {page} / {totalPages}
          </span>
          <button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
            disabled={page === totalPages} 
            className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 w-full sm:w-auto dark:text-white font-medium"
          >
            Suivant
          </button>
        </div>
      )}
      {selectedLive && <LiveDetail live={selectedLive} onClose={() => setSelectedLive(null)} />}
    </div>
  );
} 