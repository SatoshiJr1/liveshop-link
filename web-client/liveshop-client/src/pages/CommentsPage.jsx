import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, MessageCircle } from 'lucide-react';

const CommentsPage = () => {
  const { linkId } = useParams();
  const navigate = useNavigate();
  
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      setError('Veuillez saisir un commentaire');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const response = await fetch(`http://localhost:3001/api/public/${linkId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: comment.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'envoi du commentaire');
      }

      setSuccess(true);
      setComment('');
      
      // Réinitialiser le message de succès après 3 secondes
      setTimeout(() => {
        setSuccess(false);
      }, 3000);

    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/${linkId}`)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux produits
          </Button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              💬 Commentaires Live
            </h1>
            <p className="text-gray-600">
              Partagez vos questions ou commentaires avec le vendeur
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Live Comments Widget */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="w-5 h-5 text-blue-500 mr-2" />
              Widget de commentaires en direct
            </CardTitle>
            <CardDescription>
              Envoyez un message qui sera visible par le vendeur en temps réel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
                  ✅ Votre commentaire a été envoyé avec succès !
                </div>
              )}

              <div className="space-y-2">
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tapez votre commentaire ou question ici..."
                  rows={4}
                  className="resize-none"
                  maxLength={500}
                />
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Votre message sera visible par le vendeur</span>
                  <span>{comment.length}/500</span>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
                disabled={submitting || !comment.trim()}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer le commentaire
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Comment ça marche ?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Écrivez votre message</h4>
                <p className="text-sm text-gray-600">
                  Posez une question sur un produit, demandez des informations ou laissez un commentaire.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Envoi instantané</h4>
                <p className="text-sm text-gray-600">
                  Votre message est envoyé directement au vendeur en temps réel.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Réponse rapide</h4>
                <p className="text-sm text-gray-600">
                  Le vendeur peut voir votre message sur son tableau de bord et vous répondre rapidement.
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm text-purple-800">
                <strong>💡 Astuce:</strong> Utilisez cette fonctionnalité pendant les lives pour poser des questions 
                en direct ou demander des détails sur les produits présentés.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Vous voulez passer une commande ?
          </p>
          <Button 
            onClick={() => navigate(`/${linkId}`)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Voir tous les produits
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CommentsPage;

