import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone,
  BarChart3,
  Package,
  ShoppingCart,
  Bell,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Play,
  Sparkles,
  Rocket,
  Target,
  Award,
  Globe,
  Activity,
  Zap,
  Shield,
  Users,
  Link,
  Star,
  MessageCircle,
  Heart,
  Share2,
  Clock,
  Camera,
  Video,
  ShoppingBag,
  CreditCard,
  Truck,
  MessageSquare,
  ThumbsUp,
  Award as Trophy,
  Zap as Lightning,
  Users as Group,
  TrendingUp as Chart,
  Smartphone as Device,
  Monitor,
  Database,
  Wifi,
  Smartphone as Mobile,
  Phone,
  Laptop,
  Server,
  XCircle
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/register');
  };

  const handleDemo = () => {
    window.open('/demo', '_blank');
  };

  const features = [
    {
      icon: BarChart3,
      title: "Dashboard Temps Réel",
      description: "Surveillez vos ventes en direct avec des statistiques en temps réel",
      color: "from-blue-500 to-indigo-600"
    },
    {
      icon: Package,
      title: "Gestion Produits",
      description: "Ajoutez, modifiez et gérez vos produits facilement depuis votre mobile",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: Bell,
      title: "Notifications Instantanées",
      description: "Recevez vos commandes en temps réel avec des notifications push",
      color: "from-orange-500 to-red-600"
    },
    {
      icon: Smartphone,
      title: "Mobile-First",
      description: "Interface optimisée pour tous les appareils, priorité mobile",
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: Video,
      title: "Ventes Live",
      description: "Engagez vos clients avec des ventes en direct interactives",
      color: "from-rose-500 to-pink-600"
    },
    {
      icon: TrendingUp,
      title: "Analytics Avancées",
      description: "Comprenez vos performances avec des rapports détaillés",
      color: "from-cyan-500 to-blue-600"
    }
  ];


  const platformApps = [
    {
      name: "Mobile Vendor App",
      description: "Interface vendeur optimisée mobile",
      icon: Smartphone,
      features: ["Dashboard temps réel", "Gestion produits", "Suivi commandes", "Notifications push"],
      color: "from-indigo-500 to-purple-600"
    },
    {
      name: "Web Client",
      description: "Boutique en ligne pour vos clients",
      icon: Monitor,
      features: ["Catalogue produits", "Processus de commande", "Commentaires", "Suivi livraison"],
      color: "from-green-500 to-emerald-600"
    },
    {
      name: "Backend API",
      description: "Infrastructure robuste et sécurisée",
      icon: Server,
      features: ["API REST", "WebSocket temps réel", "Base de données", "Sécurité avancée"],
      color: "from-orange-500 to-red-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/liveshop.png" 
                alt="LiveShop Logo" 
                className="w-12 h-12 rounded-2xl shadow-lg"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                LiveShop Link
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={handleDemo}
                className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              >
                Voir la démo
              </Button>
              <Button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Créer ma boutique gratuitement
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Simple et Moderne */}
      <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center">
        {/* Background Pattern Subtile */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Contenu Principal */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                <span className="text-white/90 text-sm font-medium">Plateforme Live Commerce</span>
              </div>

              {/* Titre Principal */}
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
                  Vendez en direct
                  <br />
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    comme jamais
                  </span>
                </h1>
                
                <p className="text-xl text-white/70 max-w-lg leading-relaxed">
                  Créez votre boutique mobile, gérez vos ventes en temps réel et augmentez vos revenus de 40% avec notre plateforme complète.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleGetStarted}
                  size="lg"
                  className="bg-white text-slate-900 hover:bg-white/90 px-8 py-4 text-lg font-semibold rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300"
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  Commencer gratuitement
                </Button>
                
                <Button
                  onClick={handleDemo}
                  variant="outline"
                  size="lg"
                  className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-xl backdrop-blur-sm"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Voir la démo
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">+40%</div>
                  <div className="text-white/60 text-sm">Ventes</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">100%</div>
                  <div className="text-white/60 text-sm">Mobile</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">0%</div>
                  <div className="text-white/60 text-sm">Complexité</div>
                </div>
              </div>
            </div>

            {/* Mockup de Téléphone - Centré et Épuré */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative">
                {/* Téléphone Principal */}
                <img 
                  src="/Phone Mockups.png" 
                  alt="LiveShop Mobile Interface" 
                  className="w-[400px] h-auto drop-shadow-2xl"
                />
                
                {/* Badge Flottant Simple */}
                <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  En ligne
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-bounce"></div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-red-100 text-red-700 px-4 py-2 rounded-full">
                  ❌ Problèmes actuels
                </Badge>
                <h2 className="text-4xl font-bold text-slate-800">
                  Les défis des vendeurs traditionnels
                </h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <XCircle className="w-6 h-6 text-red-500 mt-1" />
                  <div>
                    <h3 className="font-semibold text-slate-800">Gestion complexe</h3>
                    <p className="text-slate-600">Interfaces obsolètes et difficiles à utiliser</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <XCircle className="w-6 h-6 text-red-500 mt-1" />
                  <div>
                    <h3 className="font-semibold text-slate-800">Pas de temps réel</h3>
                    <p className="text-slate-600">Retard dans les notifications et suivi des commandes</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <XCircle className="w-6 h-6 text-red-500 mt-1" />
                  <div>
                    <h3 className="font-semibold text-slate-800">Mobile non optimisé</h3>
                    <p className="text-slate-600">Interfaces non adaptées aux appareils mobiles</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-green-100 text-green-700 px-4 py-2 rounded-full">
                  ✅ Solution LiveShop Link
                </Badge>
                <h2 className="text-4xl font-bold text-slate-800">
                  Une plateforme moderne et complète
                </h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
                  <div>
                    <h3 className="font-semibold text-slate-800">Interface intuitive</h3>
                    <p className="text-slate-600">Design moderne et facile à utiliser</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
                  <div>
                    <h3 className="font-semibold text-slate-800">Temps réel</h3>
                    <p className="text-slate-600">Notifications instantanées et suivi en direct</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
                  <div>
                    <h3 className="font-semibold text-slate-800">Mobile-first</h3>
                    <p className="text-slate-600">Interface optimisée pour tous les appareils</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-8 mb-16">
            <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-full text-sm font-medium">
              🚀 Fonctionnalités principales
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800">
              Tout ce dont vous avez besoin pour réussir
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Une plateforme complète avec toutes les fonctionnalités essentielles pour le live commerce
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                  className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105"
              >
                <CardContent className="p-8">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-800 mb-4">
                    {feature.title}
                  </h3>
                  
                  <p className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Architecture Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-8 mb-16">
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-full text-sm font-medium">
              🏗️ Architecture de la plateforme
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800">
              Trois applications, une solution complète
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Une architecture moderne avec des applications spécialisées pour chaque besoin
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {platformApps.map((app, index) => (
              <Card key={index} className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                <CardContent className="p-8">
                  <div className={`w-20 h-20 bg-gradient-to-r ${app.color} rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <app.icon className="w-10 h-10 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-800 mb-4">
                    {app.name}
                  </h3>
                  
                  <p className="text-slate-600 mb-6">
                    {app.description}
                  </p>
                  
                  <div className="space-y-2">
                    {app.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-slate-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-8 mb-16">
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full text-sm font-medium">
              ⚡ Stack technologique moderne
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800">
              Construit avec les meilleures technologies
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Une stack moderne et performante pour une expérience utilisateur exceptionnelle
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: "React 19", description: "Interface utilisateur moderne", icon: "⚛️" },
              { name: "Node.js", description: "Backend performant et scalable", icon: "🟢" },
              { name: "WebSocket", description: "Communication temps réel", icon: "🔌" },
              { name: "Mobile-First", description: "Design responsive optimisé", icon: "📱" }
            ].map((tech, index) => (
              <Card key={index} className="group text-center border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                <CardContent className="p-8">
                  <div className="text-4xl mb-4">{tech.icon}</div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{tech.name}</h3>
                  <p className="text-slate-600">{tech.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Prêt à transformer vos ventes ?
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Rejoignez des centaines de vendeurs qui ont déjà augmenté leurs ventes avec LiveShop Link
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-white text-indigo-600 hover:bg-gray-50 px-12 py-6 text-lg font-semibold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
              >
                <Rocket className="w-6 h-6 mr-3" />
                Créer ma boutique gratuitement
              </Button>
              
              <Button
                onClick={handleDemo}
                variant="outline"
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-indigo-600 px-12 py-6 text-lg font-semibold rounded-2xl transition-all duration-300"
              >
                <Play className="w-6 h-6 mr-3" />
                Voir la démo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <img 
                  src="/liveshop.png" 
                  alt="LiveShop Logo" 
                  className="w-10 h-10 rounded-xl"
                />
                <span className="text-xl font-bold">LiveShop Link</span>
              </div>
              <p className="text-slate-400">
                La première plateforme complète de live commerce avec interface mobile optimisée.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Produit</h3>
              <div className="space-y-2 text-slate-400">
                <div>Fonctionnalités</div>
                <div>Tarifs</div>
                <div>Démo</div>
                <div>Documentation</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Support</h3>
              <div className="space-y-2 text-slate-400">
                <div>Centre d'aide</div>
                <div>Contact</div>
                <div>Status</div>
                <div>Communauté</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Entreprise</h3>
              <div className="space-y-2 text-slate-400">
                <div>À propos</div>
                <div>Blog</div>
                <div>Carrières</div>
                <div>Presse</div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400">
            <p>&copy; 2024 LiveShop Link. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;