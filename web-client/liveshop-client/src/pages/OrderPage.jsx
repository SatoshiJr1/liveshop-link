import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ShoppingCart, Upload, Star, Shield, Truck, CreditCard, Check, ChevronRight, User, MapPin, Phone, Package } from 'lucide-react';
import ImageCapture from '@/components/ImageCapture';

const OrderPage = () => {
  const { linkId, productId } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // États pour les étapes du formulaire
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_address: '',
    quantity: 1,
    payment_method: '',
    payment_proof_url: '',
    comment: ''
  });

  const [capturedImageUrl, setCapturedImageUrl] = useState('');
  const [paymentMethods, setPaymentMethods] = useState({
    wave: { available: false },
    orange_money: { available: false },
    manual: { available: true }
  });

  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

  // Étapes du formulaire
  const steps = [
    { id: 1, title: 'Informations', icon: User, description: 'Vos coordonnées' },
    { id: 2, title: 'Livraison', icon: MapPin, description: 'Adresse de livraison' },
    { id: 3, title: 'Paiement', icon: CreditCard, description: 'Moyen de paiement' },
    { id: 4, title: 'Confirmation', icon: Check, description: 'Finaliser la commande' }
  ];

  useEffect(() => {
    fetchProduct();
    fetchPaymentMethods();
  }, [linkId, productId]);

  const fetchPaymentMethods = async () => {
    try {
      const apiUrl = window.location.hostname.includes('livelink.store') 
        ? `https://api.livelink.store/api/public/${linkId}/payment-methods`
        : `http://localhost:3001/api/public/${linkId}/payment-methods`;
      
      const response = await fetch(apiUrl);
      if (response.ok) {
        const data = await response.json();
        setPaymentMethods(data.data);
      }
    } catch (error) {
      console.error('Erreur récupération méthodes paiement:', error);
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const apiUrl = window.location.hostname.includes('livelink.store') 
        ? `https://api.livelink.store/api/public/${linkId}/products/${productId}`
        : `http://localhost:3001/api/public/${linkId}/products/${productId}`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('Produit non trouvé');
      }
      
      const data = await response.json();
      setProduct(data.product);
      setSeller(data.seller);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePaymentMethodSelect = (method) => {
    setFormData(prev => ({
      ...prev,
      payment_method: method
    }));

    if ((method === 'wave' || method === 'orange_money') && paymentMethods[method]?.available) {
      setSelectedPaymentMethod(method);
      setShowQRModal(true);
    }
  };

  const handleQRCodePayment = () => {
    setShowQRModal(false);
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = (step) => {
    switch (step) {
      case 1:
        return formData.customer_name && formData.customer_phone;
      case 2:
        return formData.customer_address;
      case 3:
        return formData.payment_method;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.customer_name || !formData.customer_phone || !formData.customer_address || !formData.payment_method) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const orderData = {
        ...formData,
        product_id: parseInt(productId),
        quantity: parseInt(formData.quantity)
      };

      const apiUrl = window.location.hostname.includes('livelink.store') 
        ? `https://api.livelink.store/api/public/${linkId}/orders`
        : `http://localhost:3001/api/public/${linkId}/orders`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la commande');
      }

      const result = await response.json();
      navigate(`/${linkId}/confirmation`, { 
        state: { 
          order: result.order,
          product: product,
          seller: seller
        }
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-6"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-purple-400 opacity-20"></div>
          </div>
          <p className="text-gray-600 text-lg">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-8xl mb-6 animate-bounce">😕</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Oups !</h1>
          <p className="text-gray-600 text-lg mb-6">{error}</p>
          <Button 
            onClick={() => navigate(`/${linkId}`)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux produits
          </Button>
        </div>
      </div>
    );
  }

  const totalPrice = product ? product.price * formData.quantity : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header compact */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate(`/${linkId}`)}
              className="p-2 hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="text-center flex-1">
              <h1 className="text-lg font-semibold text-gray-900">Commande</h1>
              <p className="text-sm text-gray-500">{seller?.name}</p>
            </div>
            <div className="w-9"></div> {/* Spacer pour centrer */}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Indicateur de progression moderne */}
        <div className="mb-8">
          <div className="relative">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                
                return (
                  <div key={step.id} className="flex flex-col items-center flex-1 relative">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-300 shadow-lg
                      ${isCompleted ? 'bg-gradient-to-r from-green-500 to-green-600 text-white scale-110' : 
                        isActive ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white scale-110 shadow-purple-200' : 
                        'bg-white text-gray-400 border-2 border-gray-200'}
                    `}>
                      {isCompleted ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <div className="text-center">
                      <p className={`text-sm font-semibold ${isActive ? 'text-purple-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-400 hidden sm:block mt-1">
                        {step.description}
                      </p>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`
                        absolute top-6 left-1/2 w-full h-1 -z-10 rounded-full
                        ${isCompleted ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gray-200'}
                      `} style={{ transform: 'translateX(50%)' }}></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulaire principal moderne */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-white">
              <CardContent className="p-8">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm mb-6">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                      {error}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Étape 1: Informations personnelles modernes */}
                  {currentStep === 1 && (
                    <div className="space-y-8">
                      <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <User className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Vos informations</h2>
                        
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="customer_name" className="text-base font-semibold text-gray-800">
                            Nom complet *
                          </Label>
                          <Input
                            id="customer_name"
                            type="text"
                            value={formData.customer_name}
                            onChange={(e) => handleInputChange('customer_name', e.target.value)}
                            placeholder="Votre nom complet"
                            className="h-12 text-lg border-2 border-gray-200 focus:border-purple-500 rounded-xl"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="customer_phone" className="text-base font-semibold text-gray-800">
                            Numéro de téléphone *
                          </Label>
                          <Input
                            id="customer_phone"
                            type="tel"
                            value={formData.customer_phone}
                            onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                            placeholder="+221 XX XXX XX XX"
                            className="h-12 text-lg border-2 border-gray-200 focus:border-purple-500 rounded-xl"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Étape 2: Adresse de livraison moderne */}
                  {currentStep === 2 && (
                    <div className="space-y-8">
                      <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <MapPin className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Adresse de livraison</h2>
                        <p className="text-gray-600 text-lg text-[14px]">Où souhaitez-vous recevoir votre commande ?</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="customer_address" className="text-base font-semibold text-gray-800">
                          Adresse complète *
                        </Label>
                        <Textarea
                          id="customer_address"
                          value={formData.customer_address}
                          onChange={(e) => handleInputChange('customer_address', e.target.value)}
                          placeholder="Votre adresse complète de livraison"
                          rows={5}
                          className="border-2 border-gray-200 focus:border-blue-500 rounded-xl text-lg resize-none"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Étape 3: Paiement moderne */}
                  {currentStep === 3 && (
                    <div className="space-y-8">
                      <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <CreditCard className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Moyen de paiement</h2>
                        <p className="text-gray-600 text-lg text-[14px]">Choisissez comment vous souhaitez payer</p>
                      </div>

                      <div className="space-y-4">
                        {/* Wave */}
                        <button
                          type="button"
                          onClick={() => handlePaymentMethodSelect('wave')}
                          className={`w-full p-5 rounded-2xl border-2 transition-all duration-300 shadow-sm hover:shadow-md ${
                            formData.payment_method === 'wave'
                              ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 shadow-blue-100'
                              : 'border-gray-200 hover:border-blue-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                                <span className="text-white font-bold text-lg">W</span>
                              </div>
                              <div>
                                <div className="font-bold text-gray-900 text-lg">Wave</div>
                                <div className="text-sm text-gray-500">Paiement par preuve</div>
                              </div>
                            </div>
                            {formData.payment_method === 'wave' && (
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                                <Check className="w-5 h-5 text-white" />
                              </div>
                            )}
                          </div>
                        </button>

                        {/* Orange Money */}
                        <button
                          type="button"
                          onClick={() => handlePaymentMethodSelect('orange_money')}
                          className={`w-full p-5 rounded-2xl border-2 transition-all duration-300 shadow-sm hover:shadow-md ${
                            formData.payment_method === 'orange_money'
                              ? 'border-orange-500 bg-gradient-to-r from-orange-50 to-orange-100 shadow-orange-100'
                              : 'border-gray-200 hover:border-orange-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                                <span className="text-white font-bold text-lg">OM</span>
                              </div>
                              <div>
                                <div className="font-bold text-gray-900 text-lg">Orange Money</div>
                                <div className="text-sm text-gray-500">Paiement par preuve</div>
                              </div>
                            </div>
                            {formData.payment_method === 'orange_money' && (
                              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                <Check className="w-5 h-5 text-white" />
                              </div>
                            )}
                          </div>
                        </button>

                        {/* Espèces */}
                        <button
                          type="button"
                          onClick={() => handlePaymentMethodSelect('cash')}
                          className={`w-full p-5 rounded-2xl border-2 transition-all duration-300 shadow-sm hover:shadow-md ${
                            formData.payment_method === 'cash'
                              ? 'border-green-500 bg-gradient-to-r from-green-50 to-green-100 shadow-green-100'
                              : 'border-gray-200 hover:border-green-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-green-700 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                                <span className="text-white font-bold text-lg">€</span>
                              </div>
                              <div>
                                <div className="font-bold text-gray-900 text-lg">Espèces à la livraison</div>
                                <div className="text-sm text-gray-500">Paiement à la réception</div>
                              </div>
                            </div>
                            {formData.payment_method === 'cash' && (
                              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                                <Check className="w-5 h-5 text-white" />
                              </div>
                            )}
                          </div>
                        </button>
                      </div>

                      {/* Preuve de paiement */}
                      {formData.payment_method && formData.payment_method !== 'cash' && (
                        <div className="mt-6">
                          <Label className="text-sm font-medium text-gray-700">
                            Preuve de paiement
                          </Label>
                          <div className="mt-2">
                            <ImageCapture 
                              onImageCaptured={(imageUrl) => {
                                setCapturedImageUrl(imageUrl);
                                handleInputChange('payment_proof_url', imageUrl);
                              }}
                              onImageRemoved={() => {
                                setCapturedImageUrl('');
                                handleInputChange('payment_proof_url', '');
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Commentaire */}
                      <div>
                        <Label htmlFor="comment" className="text-sm font-medium text-gray-700">
                          Commentaire (optionnel)
                        </Label>
                        <Textarea
                          id="comment"
                          value={formData.comment}
                          onChange={(e) => handleInputChange('comment', e.target.value)}
                          placeholder="Instructions spéciales ou commentaires"
                          rows={3}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}

                  {/* Étape 4: Confirmation moderne */}
                  {currentStep === 4 && (
                    <div className="space-y-8">
                      <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Check className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Récapitulatif</h2>
                        <p className="text-gray-600 text-lg text-[14px]">Vérifiez vos informations avant de confirmer</p>
                      </div>

                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 space-y-5">
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600 font-medium">Nom:</span>
                          <span className="font-bold text-gray-900">{formData.customer_name}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600 font-medium">Téléphone:</span>
                          <span className="font-bold text-gray-900">{formData.customer_phone}</span>
                        </div>
                        <div className="flex justify-between items-start py-3 border-b border-gray-200">
                          <span className="text-gray-600 font-medium">Adresse:</span>
                          <span className="font-bold text-gray-900 text-right max-w-xs leading-relaxed">{formData.customer_address}</span>
                        </div>
                        <div className="flex justify-between items-center py-3">
                          <span className="text-gray-600 font-medium">Paiement:</span>
                          <span className="font-bold text-gray-900">
                            {formData.payment_method === 'wave' ? 'Wave' :
                             formData.payment_method === 'orange_money' ? 'Orange Money' :
                             formData.payment_method === 'cash' ? 'Espèces' : formData.payment_method}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Boutons de navigation modernes */}
                  <div className="flex justify-between mt-10">
                    {currentStep > 1 ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        className="px-8 py-3 h-12 border-2 border-gray-300 hover:border-gray-400 rounded-xl font-semibold"
                      >
                        Précédent
                      </Button>
                    ) : (
                      <div></div>
                    )}

                    {currentStep < steps.length ? (
                      <Button
                        type="button"
                        onClick={nextStep}
                        disabled={!isStepValid(currentStep)}
                        className="px-8 py-3 h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        Suivant
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={submitting || !isStepValid(3)}
                        className="px-8 py-3 h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        {submitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                            Traitement...
                          </>
                        ) : (
                          <>
                            <Check className="w-5 h-5 mr-2" />
                            Confirmer la commande
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Résumé de commande moderne - Toujours visible */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    Votre commande
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Image produit grande et moderne */}
                  <div className="relative">
                    {product?.image_url ? (
                      <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 relative group">
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {product.is_pinned && (
                          <div className="absolute top-3 right-3">
                            <Badge className="bg-gradient-to-r from-orange-500 to-pink-500 text-white animate-pulse shadow-lg">
                              <Star className="w-3 h-3 mr-1" />
                              En Live
                            </Badge>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-square rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <div className="text-6xl">📦</div>
                      </div>
                    )}
                  </div>

                  {/* Informations produit */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-lg text-gray-900 leading-tight">{product?.name}</h3>
                    {product?.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Quantité:</span>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => formData.quantity > 1 && handleInputChange('quantity', formData.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        >
                          <span className="text-gray-600">-</span>
                        </button>
                        <span className="font-semibold text-gray-900 min-w-[2rem] text-center">{formData.quantity}</span>
                        <button 
                          onClick={() => handleInputChange('quantity', formData.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        >
                          <span className="text-gray-600">+</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Prix avec design moderne */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Prix unitaire:</span>
                      <span className="font-medium">{product?.price.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Quantité:</span>
                      <span className="font-medium">{formData.quantity}</span>
                    </div>
                    <div className="border-t border-green-200 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">Total:</span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          {totalPrice.toLocaleString()} FCFA
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Garanties modernes */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                      <Shield className="w-5 h-5 text-green-600 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-green-700">Sécurisé</p>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                      <Truck className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-blue-700">Rapide</p>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                      <CreditCard className="w-5 h-5 text-purple-600 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-purple-700">Support</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Modal QR Code */}
      {showQRModal && selectedPaymentMethod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowQRModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Paiement {selectedPaymentMethod === 'wave' ? 'Wave' : 'Orange Money'}
              </h3>
              
              <div className="mb-6">
                <div className="bg-gray-100 rounded-lg p-4 mb-4">
                  <img 
                    src={`http://localhost:3001${paymentMethods[selectedPaymentMethod]?.qr_code_url}`}
                    alt={`QR Code ${selectedPaymentMethod}`}
                    className="w-48 h-48 mx-auto"
                  />
                </div>
                
                <div className="text-sm text-gray-600 mb-4">
                  <p className="font-medium mb-2">Instructions :</p>
                  <ol className="text-left space-y-1">
                    <li>1. Scannez le QR code avec votre app {selectedPaymentMethod === 'wave' ? 'Wave' : 'Orange Money'}</li>
                    <li>2. Vérifiez le montant : <span className="font-bold">{totalPrice.toLocaleString()} FCFA</span></li>
                    <li>3. Confirmez le paiement</li>
                    <li>4. Cliquez sur "J'ai payé" ci-dessous</li>
                  </ol>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowQRModal(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleQRCodePayment}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  J'ai payé
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderPage;
