import { useState, useEffect } from 'react';
import ApiService from '../services/api';
import realtimeService from '../services/realtimeService';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  Package, 
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Camera,
  Tag,
  Maximize2
} from 'lucide-react';
import ProductForm from '../components/ProductForm';
import ImageLightbox from '../components/ImageLightbox';

const ProductsPage = () => {
  const { refreshCredits } = useAuth();
  const [products, setProducts] = useState([]);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [productsPerPage] = useState(6);

  useEffect(() => {
    fetchProducts();
    setupRealtime();
    
    return () => {
      // Nettoyer les listeners à la fermeture
      realtimeService.off('product_created', handleProductCreated);
      realtimeService.off('product_updated', handleProductUpdated);
      realtimeService.off('product_deleted', handleProductDeleted);
    };
  }, []);

  // Configuration du temps réel
  const setupRealtime = () => {
    // Connexion WebSocket
    realtimeService.connect();
    
    // Écouter les événements de produits
    realtimeService.on('product_created', handleProductCreated);
    realtimeService.on('product_updated', handleProductUpdated);
    realtimeService.on('product_deleted', handleProductDeleted);
  };

  // Gestion des événements temps réel
  const handleProductCreated = (newProduct) => {
    console.log('🆕 Nouveau produit créé:', newProduct);
    setProducts(prev => [newProduct, ...prev.slice(0, -1)]); // Ajouter au début, retirer le dernier
    setTotalProducts(prev => prev + 1);
    
    // Notification toast
    showNotification('Nouveau produit ajouté', 'success');
  };

  const handleProductUpdated = (updatedProduct) => {
    console.log('✏️ Produit mis à jour:', updatedProduct);
    setProducts(prev => prev.map(product => 
      product.id === updatedProduct.id ? updatedProduct : product
    ));
    
    // Notification toast
    showNotification('Produit mis à jour', 'info');
  };

  const handleProductDeleted = (deletedProduct) => {
    console.log('🗑️ Produit supprimé:', deletedProduct);
    setProducts(prev => prev.filter(product => product.id !== deletedProduct.id));
    setTotalProducts(prev => prev - 1);
    
    // Notification toast
    showNotification('Produit supprimé', 'warning');
  };


  // Fonction pour afficher les notifications
  const showNotification = (message, type = 'info') => {
    // Vous pouvez utiliser une librairie de toast comme react-hot-toast
    console.log(`📢 ${type.toUpperCase()}: ${message}`);
    
    // Exemple simple avec alert (à remplacer par un toast)
    if (type === 'success') {
      // alert(`✅ ${message}`);
    }
  };

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      const data = await ApiService.getProducts(page, productsPerPage);
      
      // Gérer les deux formats de réponse
      if (data.products && data.pagination) {
        // Format avec pagination
      setProducts(data.products);
        setCurrentPage(data.pagination.currentPage);
        setTotalPages(data.pagination.totalPages);
        setTotalProducts(data.pagination.totalProducts);
      } else {
        // Format sans pagination (fallback)
        setProducts(Array.isArray(data) ? data : []);
        setCurrentPage(1);
        setTotalPages(1);
        setTotalProducts(Array.isArray(data) ? data.length : 0);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = async () => {
    // Plus de vérification de crédits - ouverture directe du dialogue
    setEditingProduct(null);
    setShowDialog(true);
  };

  // Déterminer si on est en desktop (>= sm)
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(min-width: 640px)').matches;
  });
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width: 640px)');
    const handler = (e) => setIsDesktop(e.matches);
    try { mq.addEventListener('change', handler); } catch { mq.addListener(handler); }
    return () => { try { mq.removeEventListener('change', handler); } catch { mq.removeListener(handler); } };
  }, []);

  const openEditDialog = (product) => {
    setEditingProduct(product);
    setShowDialog(true);
  };

  const handleSubmit = async (productData) => {
    try {
      console.log('🔄 Début handleSubmit - Mode:', editingProduct ? 'Modification' : 'Création');
      console.log('🔄 ID produit à modifier:', editingProduct?.id);
      console.log('🔄 Données reçues:', productData);
      
      if (editingProduct) {
        console.log('📝 Modification du produit:', editingProduct.id);
        await ApiService.updateProduct(editingProduct.id, productData);
        console.log('✅ Produit modifié avec succès');
      } else {
        console.log('➕ Création d\'un nouveau produit');
        await ApiService.createProduct(productData);
        console.log('✅ Produit créé avec succès');
        // Rafraîchir les crédits après création d'un produit
        await refreshCredits();
      }

      await fetchProducts(currentPage);
      setShowDialog(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      console.error('❌ Message d\'erreur:', error.message);
      console.error('❌ Stack trace:', error.stack);
      throw error; // Laisser ProductForm gérer l'erreur
    }
  };

  const handleCancel = () => {
    setShowDialog(false);
    setEditingProduct(null);
  };

  const handleDelete = async (productId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      return;
    }

    try {
      await ApiService.deleteProduct(productId);
      await fetchProducts(currentPage);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du produit');
    }
  };

  const handleTogglePin = async (productId) => {
    try {
      await ApiService.togglePinProduct(productId);
      await fetchProducts(currentPage);
    } catch (error) {
      console.error('Erreur lors de l\'épinglage:', error);
      alert('Erreur lors de l\'épinglage du produit');
    }
  };

  // Fonctions de pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchProducts(newPage);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const renderProductCard = (product) => {
    // Traiter les images qui peuvent être une chaîne JSON
    let images = product.images;
    if (typeof images === 'string') {
      try {
        images = JSON.parse(images);
      } catch (e) {
        console.error('Erreur parsing images:', e);
        images = [];
      }
    }
    if (!Array.isArray(images)) {
      images = [];
    }

    // Extraire l'URL de l'image principale
    let mainImageUrl = null;
    if (images.length > 0) {
      const mainImage = images[0];
      // Si c'est un objet d'Unsplash, extraire l'URL
      if (typeof mainImage === 'object' && mainImage.url) {
        mainImageUrl = mainImage.url;
      } else if (typeof mainImage === 'string') {
        mainImageUrl = mainImage;
      }
    } else if (product.image_url) {
      mainImageUrl = product.image_url;
    }

    console.log('🖼️ Affichage image produit:', {
      productName: product.name,
      images: images,
      mainImageUrl: mainImageUrl
    });

    return (
      <Card key={product.id} className="relative group hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <div className="relative">
          {mainImageUrl ? (
            <div className="relative cursor-pointer" onClick={() => setLightboxImage({ url: mainImageUrl, name: product.name })}>
              <img
                src={mainImageUrl}
                alt={product.name}
                className="w-full h-32 sm:h-48 object-cover rounded-t-lg transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  console.error('❌ Erreur chargement image produit:', {
                    productName: product.name,
                    imageUrl: mainImageUrl
                  });
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              {/* Overlay hover avec icône zoom */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center rounded-t-lg">
                <Maximize2 className="w-6 h-6 sm:w-8 sm:h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
          ) : null}
          
          {/* Placeholder si pas d'image ou erreur */}
          <div className={`w-full h-32 sm:h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg flex items-center justify-center ${mainImageUrl ? 'hidden' : ''}`}>
            <div className="text-center">
              <ImageIcon className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 dark:text-gray-500 mx-auto mb-1 sm:mb-2" />
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 px-1">{product.name}</p>
            </div>
          </div>

          {/* Badge de catégorie */}
          {product.category && product.category !== 'general' && (
            <Badge className="absolute top-2 left-2 bg-purple-600 text-white ">
              {product.category}
            </Badge>
          )}

          {/* Badge de stock */}
          {product.stock_quantity === 0 && (
            <Badge className="absolute top-2 right-2 bg-red-500 text-white ">
              Rupture
            </Badge>
          )}

          {/* Actions au survol - Desktop seulement */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 items-center justify-center opacity-0 group-hover:opacity-100 hidden lg:flex">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => openEditDialog(product)}
                className="bg-white text-gray-900 hover:bg-gray-100"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(product.id)}
                className="bg-red-500 hover:bg-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <CardContent className="p-2 sm:p-4">
          <div className="flex items-start justify-between mb-1 sm:mb-2">
            <CardTitle className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
              {product.name}
            </CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleTogglePin(product.id)}
              className={`p-1 ${product.is_pinned ? 'text-yellow-500 dark:text-yellow-400' : 'text-gray-400 dark:text-gray-500'}`}
            >
              <Star className={`w-3 h-3 sm:w-4 sm:h-4 ${product.is_pinned ? 'fill-current' : ''}`} />
            </Button>
          </div>

          <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-2 sm:mb-3 line-clamp-2 hidden sm:block">
            {product.description}
          </CardDescription>

          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-sm sm:text-xl font-bold text-purple-600 dark:text-purple-400">
              {product.price?.toLocaleString()} FCFA
            </span>
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Stock: {product.stock_quantity}
            </span>
          </div>

          {/* Actions rapides pour mobile */}
          <div className="flex gap-1 sm:hidden">
            <Button
              size="sm"
              variant="outline"
              onClick={() => openEditDialog(product)}
              className="flex-1 h-8 text-xs border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Edit className="w-3 h-3 sm:mr-1" />
              <span className="hidden sm:inline">Modifier</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDelete(product.id)}
              className="flex-1 h-8 text-xs border-red-200 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="w-3 h-3 sm:mr-1" />
              <span className="hidden sm:inline">Supprimer</span>
            </Button>
          </div>

          {/* Attributs spécifiques */}
          {(() => {
            let attributes = product.attributes;
            if (typeof attributes === 'string') {
              try {
                attributes = JSON.parse(attributes);
              } catch (e) {
                attributes = {};
              }
            }
            if (attributes && Object.keys(attributes).length > 0) {
              // Helper pour les couleurs d'attributs
              const getAttributeColor = (key) => {
                const colorMap = {
                  size: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
                  taille: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
                  color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
                  couleur: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
                  material: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
                  matériel: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
                  material: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
                  weight: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
                  poids: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                };
                return colorMap[key.toLowerCase()] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
              };

              const formatKey = (key) => {
                const keyMap = {
                  size: 'Taille',
                  color: 'Couleur',
                  material: 'Matériel',
                  weight: 'Poids'
                };
                return keyMap[key.toLowerCase()] || key.charAt(0).toUpperCase() + key.slice(1);
              };

              return (
                <div className="flex flex-wrap gap-1 mb-3">
                  {Object.entries(attributes).slice(0, 3).map(([key, value]) => (
                    <Badge 
                      key={key} 
                      className={`${getAttributeColor(key)} text-xs font-medium border-0`}
                    >
                      <span className="font-bold">{formatKey(key)}:</span> {value}
                    </Badge>
                  ))}
                  {Object.keys(attributes).length > 3 && (
                    <Badge className="bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 text-xs border-0">
                      +{Object.keys(attributes).length - 3} autres
                    </Badge>
                  )}
                </div>
              );
            }
            return null;
          })()}

          {/* Tags */}
          {(() => {
            let tags = product.tags;
            if (typeof tags === 'string') {
              try {
                tags = JSON.parse(tags);
              } catch (e) {
                tags = [];
              }
            }
            if (Array.isArray(tags) && tags.length > 0) {
              return (
                <div className="flex flex-wrap gap-1 ">
                  {tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs ">
                      <Tag className="w-3 h-3 mr-1 " />
                      {tag}
                    </Badge>
                  ))}
                  {tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs ">
                      +{tags.length - 3}
                    </Badge>
                  )}
                </div>
              );
            }
            return null;
          })()}

          {/* Variantes */}
          {product.has_variants && product.variants && product.variants.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200 ">
              <p className="text-xs text-gray-500 mb-1 ">
                {product.variants.length} variante{product.variants.length > 1 ? 's' : ''}
              </p>
              <div className="flex flex-wrap gap-1 ">
                {product.variants.slice(0, 3).map((variant, index) => (
                  <Badge key={index} variant="outline" className="text-xs ">
                    {variant.name}
                  </Badge>
                ))}
                {product.variants.length > 3 && (
                  <Badge variant="outline" className="text-xs ">
                    +{product.variants.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen ">
        <div className="text-center ">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4 "></div>
          <p className="text-gray-600 ">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 md:space-y-6">
      {/* Header avec titre et bouton d'ajout - Desktop seulement */}
      <div className="hidden md:flex md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Mes Produits</h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">Gérez votre catalogue de produits</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={openCreateDialog}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un produit
          </Button>
        </div>
      </div>

      {/* Statistiques rapides - Une ligne mobile (scrollable) + grille desktop */}
      {/* Mobile: chips compactes scrollables */}
      <div className="sm:hidden -mx-4 px-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          <div className="flex items-center gap-2 shrink-0 rounded-xl border border-blue-200/40 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-900/20 px-3 py-2">
            <div className="w-5 h-5 rounded bg-blue-500 flex items-center justify-center">
              <Package className="w-3 h-3 text-white" />
            </div>
            <div className="text-xs">
              <div className="text-blue-800 dark:text-blue-200 font-medium">Total</div>
              <div className="text-blue-900 dark:text-blue-100 font-bold">{totalProducts}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 rounded-xl border border-yellow-200/40 dark:border-yellow-900/40 bg-yellow-50/60 dark:bg-yellow-900/20 px-3 py-2">
            <div className="w-5 h-5 rounded bg-yellow-500 flex items-center justify-center">
              <Star className="w-3 h-3 text-white" />
            </div>
            <div className="text-xs">
              <div className="text-yellow-800 dark:text-yellow-200 font-medium">Épinglés</div>
              <div className="text-yellow-900 dark:text-yellow-100 font-bold">{products.filter(p => p.is_pinned).length}</div>
            </div>
          </div>
          {/* Photos retiré du ruban mobile pour éviter le débordement */}
          <div className="flex items-center gap-2 shrink-0 rounded-xl border border-purple-200/40 dark:border-purple-900/40 bg-purple-50/60 dark:bg-purple-900/20 px-3 py-2">
            <div className="w-5 h-5 rounded bg-purple-500 flex items-center justify-center">
              <Tag className="w-3 h-3 text-white" />
            </div>
            <div className="text-xs">
              <div className="text-purple-800 dark:text-purple-200 font-medium">Catégories</div>
              <div className="text-purple-900 dark:text-purple-100 font-bold">{new Set(products.map(p => p.category)).size}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: grille 4 colonnes */}
      <div className="hidden sm:grid grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardContent className="p-1 md:p-4">
            <div className="flex items-center justify-between">
              <div className="w-4 h-4 md:w-10 md:h-10 bg-blue-500 rounded flex items-center justify-center">
                <Package className="w-2 h-2 md:w-5 md:h-5 text-white" />
              </div>
              <div className="text-right">
                <p className="text-xs md:text-sm text-blue-700 dark:text-blue-300 font-medium">Total</p>
                <p className="text-xs md:text-2xl font-bold text-blue-900 dark:text-blue-100">{totalProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20">
          <CardContent className="p-1 md:p-4">
            <div className="flex items-center justify-between">
              <div className="w-4 h-4 md:w-10 md:h-10 bg-yellow-500 rounded flex items-center justify-center">
                <Star className="w-2 h-2 md:w-5 md:h-5 text-white" />
              </div>
              <div className="text-right">
                <p className="text-xs md:text-sm text-yellow-700 dark:text-yellow-300 font-medium">Épinglés</p>
                <p className="text-xs md:text-2xl font-bold text-yellow-900 dark:text-yellow-100">{products.filter(p => p.is_pinned).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <CardContent className="p-1 md:p-4">
            <div className="flex items-center justify-between">
              <div className="w-4 h-4 md:w-10 md:h-10 bg-green-500 rounded flex items-center justify-center">
                <Camera className="w-2 h-2 md:w-5 md:h-5 text-white" />
              </div>
              <div className="text-right">
                <p className="text-xs md:text-sm text-green-700 dark:text-green-300 font-medium">Photos</p>
                <p className="text-xs md:text-2xl font-bold text-green-900 dark:text-green-100">{products.filter(p => {
                  let images = p.images;
                  if (typeof images === 'string') {
                    try {
                      images = JSON.parse(images);
                    } catch (e) {
                      images = [];
                    }
                  }
                  return Array.isArray(images) && images.length > 0;
                }).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <CardContent className="p-1 md:p-4">
            <div className="flex items-center justify-between">
              <div className="w-4 h-4 md:w-10 md:h-10 bg-purple-500 rounded flex items-center justify-center">
                <Tag className="w-2 h-2 md:w-5 md:h-5 text-white" />
              </div>
              <div className="text-right">
                <p className="text-xs md:text-sm text-purple-700 dark:text-purple-300 font-medium">Catégories</p>
                <p className="text-xs md:text-2xl font-bold text-purple-900 dark:text-purple-100">{new Set(products.map(p => p.category)).size}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grille de produits */}
      {products.length === 0 ? (
        <Card className="text-center py-12 md:py-16 border-0 shadow-sm bg-gradient-to-br from-gray-50 to-gray-100">
          <CardContent className="px-4 md:px-6">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
              <Package className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">Aucun produit</h3>
            <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6 px-4">Commencez par ajouter votre premier produit</p>
            <Button onClick={openCreateDialog} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-6 py-3 text-sm md:text-base">
              <Plus className="w-4 h-4 md:w-4 md:h-4 mr-2" />
              Ajouter un produit
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-6">
            {products.map(renderProductCard)}
          </div>

          {/* Pagination optimisée pour mobile */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8 px-4">
              {/* Boutons Précédent/Suivant - Plus grands sur mobile */}
              <Button
                variant="outline"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 md:px-6 py-3 md:py-3 rounded-lg border-gray-200 hover:bg-gray-50 disabled:opacity-50 w-full sm:w-auto text-sm md:text-base"
              >
                <ChevronLeft className="w-5 h-5 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Précédent</span>
                <span className="sm:hidden">Préc.</span>
              </Button>
              
              {/* Indicateur de page - Simplifié sur mobile */}
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                  Page {currentPage} / {totalPages}
                </span>
                
                {/* Numéros de page - Limités sur mobile */}
                <div className="hidden sm:flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 rounded-lg ${
                          currentPage === page 
                            ? 'bg-blue-600 text-white' 
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
              </div>
                  
              <Button
                variant="outline"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 md:px-6 py-3 md:py-3 rounded-lg border-gray-200 hover:bg-gray-50 disabled:opacity-50 w-full sm:w-auto text-sm md:text-base"
              >
                <span className="hidden sm:inline">Suivant</span>
                <span className="sm:hidden">Suiv.</span>
                <ChevronRight className="w-5 h-5 md:w-5 md:h-5" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Bouton flottant pour ajouter un produit */}
      <Button
        onClick={() => setShowDialog(true)}
        className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 lg:hidden"
        size="lg"
      >
        <Plus className="w-6 h-6 text-white" />
      </Button>

      {/* Modal desktop + plein écran mobile */}
      <Dialog open={showDialog && isDesktop} onOpenChange={setShowDialog}>
        <DialogContent className="hidden sm:block max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}
            </DialogTitle>
          </DialogHeader>
          <ProductForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            initialData={editingProduct}
          />
        </DialogContent>
      </Dialog>

      {/* Plein écran mobile */}
      {showDialog && !isDesktop && (
        <div className="sm:hidden fixed inset-0 z-[70] flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowDialog(false)} />
          {/* Sheet content */}
          <div className="relative flex flex-col bg-white dark:bg-gray-900 w-full h-full overscroll-contain">
          {/* Header mobile */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <button
              aria-label="Fermer"
              onClick={() => setShowDialog(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="text-base font-semibold">
              {editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}
            </div>
            <div className="w-8" />
          </div>

          {/* Contenu scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-4">
              <ProductForm
                onSubmit={handleSubmit}
                onCancel={() => setShowDialog(false)}
                initialData={editingProduct}
              />
            </div>
          </div>
          </div>
        </div>
      )}

      {/* Lightbox pour visualiser les images */}
      <ImageLightbox
        imageUrl={lightboxImage?.url}
        productName={lightboxImage?.name}
        isOpen={!!lightboxImage}
        onClose={() => setLightboxImage(null)}
      />
    </div>
  );
};

export default ProductsPage;

