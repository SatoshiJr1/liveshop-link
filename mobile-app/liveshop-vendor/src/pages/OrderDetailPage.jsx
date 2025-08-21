import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:3001/api/orders/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (res.ok) {
          setOrder(data.order);
        } else {
          setError(data.error || 'Erreur lors du chargement de la commande');
        }
      } catch {
        setError('Erreur réseau');
      } finally {
        setLoading(false);
      }
    };
    if (orderId && token) fetchOrder();
  }, [orderId, token]);

  if (loading) {
    return <div className="p-8 text-center ">Chargement...</div>;
  }
  if (error) {
    return <div className="p-8 text-center text-red-500 ">{error}</div>;
  }
  if (!order) {
    return <div className="p-8 text-center ">Commande introuvable</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4 ">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2 ">
        <ArrowLeft className="w-4 h-4 " /> Retour
      </Button>
      <Card>
        <CardContent className="p-6 ">
          <h2 className="text-xl font-bold mb-2 ">Commande #{order.id}</h2>
          <div className="mb-4 text-sm text-gray-500 ">Créée le {new Date(order.created_at).toLocaleString()}</div>
          <div className="mb-4 ">
            <span className="font-semibold ">Statut :</span> <span className="capitalize ">{order.status}</span>
          </div>
          <div className="mb-4 ">
            <span className="font-semibold ">Client :</span> {order.customer_name}<br/>
            <span className="font-semibold ">Téléphone :</span> {order.customer_phone}<br/>
            <span className="font-semibold ">Adresse :</span> {order.customer_address}
          </div>
          <div className="mb-4 ">
            <span className="font-semibold ">Produit :</span> {order.product?.name}<br/>
            <span className="font-semibold ">Quantité :</span> {order.quantity}<br/>
            <span className="font-semibold ">Total :</span> {order.total_price.toLocaleString()} FCFA
          </div>
          <div className="mb-4 ">
            <span className="font-semibold ">Méthode de paiement :</span> {order.payment_method}
          </div>
          {order.comment && (
            <div className="mb-4 ">
              <span className="font-semibold ">Commentaire :</span> {order.comment}
            </div>
          )}
          
          {/* Preuve de paiement */}
          {order.payment_proof_url && (
            <div className="mb-4 ">
              <span className="font-semibold ">Preuve de paiement :</span>
              <div className="mt-2">
                <img 
                  src={`http://localhost:3001/api/upload${order.payment_proof_url}`}
                  alt="Preuve de paiement"
                  className="w-full max-w-md rounded-lg border-2 border-gray-200"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div className="hidden text-sm text-gray-500 mt-1">
                  Image non disponible
                </div>
                <a 
                  href={`http://localhost:3001/api/upload${order.payment_proof_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm mt-1 inline-block"
                >
                  Voir l'image en plein écran
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDetailPage; 