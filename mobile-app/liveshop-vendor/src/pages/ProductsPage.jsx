import { useState, useEffect } from 'react';
import ApiService from '../services/api';
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
  Tag
} from 'lucide-react';
import ProductForm from '../components/ProductForm';

const ProductsPage = () => {
  const { refreshCredits } = useAuth();
  const [products, setProducts] = useState([]);
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
  }, []);

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
    try {
      // Vérifier les crédits avant d'ouvrir le dialogue
      const creditCheck = await ApiService.checkCredits('ADD_PRODUCT');
      
      if (!creditCheck.data.hasEnough) {
        alert(`Crédits insuffisants ! Vous avez ${creditCheck.data.currentBalance} crédits, mais il en faut ${creditCheck.data.requiredCredits} pour ajouter un produit.`);
        return;
      }
      
      setEditingProduct(null);
      setShowDialog(true);
    } catch (error) {
      console.error('Erreur lors de la vérification des crédits:', error);
      alert('Erreur lors de la vérification des crédits. Veuillez réessayer.');
    }
  };

  const openEditDialog = (product) => {
    setEditingProduct(product);
    setShowDialog(true);
  };

  const handleSubmit = async (productData) => {
    try {
      if (editingProduct) {
        await ApiService.updateProduct(editingProduct.id, productData);
      } else {
        await ApiService.createProduct(productData);
        // Rafraîchir les crédits après création d'un produit
        await refreshCredits();
      }

      await fetchProducts(currentPage);
      setShowDialog(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
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
        images = [];
      }
    }
    if (!Array.isArray(images)) {
      images = [];
    }

    const mainImage = images.length > 0 
      ? images[0] 
      : product.image_url;

    return (
      <Card key={product.id} className="relative group hover: transition-shadow ">
        <div className="relative ">
          {mainImage ? (
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-48 object-cover rounded-t-lg "
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center ">
              <ImageIcon className="w-12 h-12 text-gray-400 " />
            </div>
          )}
          
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

          {/* Actions au survol */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100 ">
            <div className="flex gap-2 ">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => openEditDialog(product)}
                className="bg-white text-gray-900 hover:bg-gray-100 "
              >
                <Edit className="w-4 h-4 " />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(product.id)}
                className="bg-red-500 hover:bg-red-600 "
              >
                <Trash2 className="w-4 h-4 " />
              </Button>
            </div>
          </div>
        </div>

        <CardContent className="p-4 ">
          <div className="flex items-start justify-between mb-2 ">
            <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2 ">
              {product.name}
            </CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleTogglePin(product.id)}
              className={`p-1 ${product.is_pinned ? 'text-yellow-500' : 'text-gray-400'}`}
            >
              <Star className={`w-4 h-4 ${product.is_pinned ? 'fill-current' : ''}`} />
            </Button>
          </div>

          <CardDescription className="text-gray-600 mb-3 line-clamp-2 ">
            {product.description}
          </CardDescription>

          <div className="flex items-center justify-between mb-3 ">
            <span className="text-xl font-bold text-purple-600 ">
              {product.price?.toLocaleString()} FCFA
            </span>
            <span className="text-sm text-gray-500 ">
              Stock: {product.stock_quantity}
            </span>
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
              return (
                <div className="flex flex-wrap gap-1 mb-3 ">
                  {Object.entries(attributes).slice(0, 3).map(([key, value]) => (
                    <Badge key={key} variant="outline" className="text-xs ">
                      {key}: {value}
                    </Badge>
                  ))}
                  {Object.keys(attributes).length > 3 && (
                    <Badge variant="outline" className="text-xs ">
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
    <div className="space-y-6 ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 ">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 ">Mes Produits</h1>
          <p className="text-gray-600 mt-1 ">Gérez votre catalogue de produits</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700  w-full md:w-auto ">
          <Plus className="w-4 h-4 mr-2 " />
          Ajouter un produit
        </Button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 ">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 ">
          <CardContent className="p-4 ">
            <div className="flex items-center ">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3 ">
                <Package className="w-5 h-5 text-white " />
              </div>
              <div>
                <p className="text-sm text-blue-700 font-medium ">Total</p>
                <p className="text-2xl font-bold text-blue-900 ">{totalProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-yellow-100 ">
          <CardContent className="p-4 ">
            <div className="flex items-center ">
              <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center mr-3 ">
                <Star className="w-5 h-5 text-white " />
              </div>
              <div>
                <p className="text-sm text-yellow-700 font-medium ">Épinglés</p>
                <p className="text-2xl font-bold text-yellow-900 ">{products.filter(p => p.is_pinned).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100 ">
          <CardContent className="p-4 ">
            <div className="flex items-center ">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3 ">
                <Camera className="w-5 h-5 text-white " />
              </div>
              <div>
                <p className="text-sm text-green-700 font-medium ">Avec photos</p>
                <p className="text-2xl font-bold text-green-900 ">{products.filter(p => {
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
        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100 ">
          <CardContent className="p-4 ">
            <div className="flex items-center ">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-3 ">
                <Tag className="w-5 h-5 text-white " />
              </div>
              <div>
                <p className="text-sm text-purple-700 font-medium ">Catégories</p>
                <p className="text-2xl font-bold text-purple-900 ">{new Set(products.map(p => p.category)).size}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grille de produits */}
      {products.length === 0 ? (
        <Card className="text-center py-16 border-0 shadow-sm bg-gradient-to-br from-gray-50 to-gray-100 ">
          <CardContent>
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 ">
              <Package className="w-10 h-10 text-gray-400 " />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 ">Aucun produit</h3>
            <p className="text-gray-600 mb-6 ">Commencez par ajouter votre premier produit</p>
            <Button onClick={openCreateDialog} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700  ">
              <Plus className="w-4 h-4 mr-2 " />
              Ajouter un produit
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ">
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
                className="flex items-center gap-2 px-6 py-3 rounded-lg border-gray-200 hover:bg-gray-50 disabled:opacity-50 w-full sm:w-auto text-sm sm:text-base"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
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
                className="flex items-center gap-2 px-6 py-3 rounded-lg border-gray-200 hover:bg-gray-50 disabled:opacity-50 w-full sm:w-auto text-sm sm:text-base"
              >
                <span className="hidden sm:inline">Suivant</span>
                <span className="sm:hidden">Suiv.</span>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Modal pour ajouter/modifier un produit */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto ">
          <DialogHeader>
            <DialogTitle>
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
    </div>
  );
};

export default ProductsPage;

