import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowLeft, MessageCircle } from 'lucide-react';

const ConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { linkId } = useParams();
  
  const { order, product, seller } = location.state || {};

  if (!order || !product || !seller) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Page non accessible</h1>
          <p className="text-gray-600 mb-4">
            Cette page n'est accessible qu'après avoir passé une commande.
          </p>
          <Button 
            onClick={() => navigate(`/${linkId}`)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux produits
          </Button>
        </div>
      </div>
    );
  }

  const getPaymentMethodLabel = (method) => {
    const methods = {
      'wave': 'Wave',
      'orange_money': 'Orange Money',
      'free_money': 'Free Money',
      'cash': 'Espèces à la livraison',
      'bank_transfer': 'Virement bancaire'
    };
    return methods[method] || method;
  };

  const getStatusLabel = (status) => {
    const statuses = {
      'pending': 'En attente',
      'paid': 'Payé',
      'delivered': 'Livré'
    };
    return statuses[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'paid': 'text-green-600 bg-green-50 border-green-200',
      'delivered': 'text-blue-600 bg-blue-50 border-blue-200'
    };
    return colors[status] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🎉 Commande confirmée !
            </h1>
            <p className="text-gray-600">
              Votre commande a été envoyée à {seller.name}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                Détails de la commande
              </CardTitle>
              <CardDescription>
                Commande #{order.id} - {new Date(order.created_at).toLocaleDateString('fr-FR')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Statut:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                  {getStatusLabel(order.status)}
                </span>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Produit commandé</h4>
                <div className="flex items-center space-x-3">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                      <span className="text-2xl">📦</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{product.name}</h5>
                    <p className="text-sm text-gray-600">
                      {order.quantity} × {product.price.toLocaleString()} FCFA
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold text-purple-600">
                  <span>Total payé:</span>
                  <span>{order.total_price.toLocaleString()} FCFA</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Moyen de paiement</h4>
                <p className="text-gray-600">{getPaymentMethodLabel(order.payment_method)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informations de livraison</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Nom</h4>
                <p className="text-gray-600">{order.customer_name}</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Téléphone</h4>
                <p className="text-gray-600">{order.customer_phone}</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Adresse de livraison</h4>
                <p className="text-gray-600">{order.customer_address}</p>
              </div>

              {order.comment && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Commentaire</h4>
                  <p className="text-gray-600 italic">"{order.comment}"</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Next Steps */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Prochaines étapes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Validation du vendeur</h4>
                  <p className="text-sm text-gray-600">
                    {seller.name} va examiner votre commande et confirmer la disponibilité.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Préparation</h4>
                  <p className="text-sm text-gray-600">
                    Une fois validée, votre commande sera préparée pour la livraison.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Livraison</h4>
                  <p className="text-sm text-gray-600">
                    Le vendeur vous contactera pour organiser la livraison à l'adresse indiquée.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 Conseil:</strong> Gardez votre téléphone à portée de main. 
                Le vendeur vous contactera directement pour confirmer votre commande et organiser la livraison.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button 
            onClick={() => navigate(`/${linkId}`)}
            variant="outline"
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continuer mes achats
          </Button>
          
          <Button 
            onClick={() => navigate(`/${linkId}/comments`)}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Laisser un commentaire
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;

