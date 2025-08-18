import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Star, 
  MessageCircle, 
  Heart, 
  Share2, 
  Package, 
  Clock, 
  Zap, 
  Shield, 
  TrendingUp, 
  Users, 
  Smartphone,
  Link,
  CheckCircle,
  ArrowRight,
  Play,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Rocket,
  Target,
  Award,
  Globe,
  Smartphone as Phone,
  BarChart3,
  Activity,
  AlertTriangle,
  XCircle,
  UserX,
  FileText,
  DollarSign,
  Timer,
  UserCheck,
  Smartphone as Mobile,
  Wifi,
  Gift,
  Calendar,
  MapPin,
  Camera,
  Video,
  Smartphone as PhoneIcon,
  ShoppingBag,
  CreditCard,
  Truck,
  MessageSquare,
  Bell,
  ThumbsUp,
  Award as Trophy,
  Zap as Lightning,
  Users as Group,
  TrendingUp as Chart,
  Smartphone as Device
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 4);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => {
    navigate('/register');
  };

  const handleDemo = () => {
    window.open('/demo', '_blank');
  };

  const backgroundSlides = [
    {
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      overlay: "from-orange-900/60 via-rose-900/50 to-violet-900/60"
    },
    {
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      overlay: "from-rose-900/60 via-violet-900/50 to-orange-900/60"
    },
    {
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      overlay: "from-violet-900/60 via-orange-900/50 to-rose-900/60"
    },
    {
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      overlay: "from-orange-900/60 via-rose-900/50 to-violet-900/60"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-violet-50 overflow-hidden">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-xl border-b border-orange-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Link className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
                LiveShop Link
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="bg-white/60 hover:bg-white/80 border-orange-200 text-orange-700 hover:text-orange-900 rounded-2xl px-6 py-2 font-medium">
                Se connecter
              </Button>
              <Button 
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white rounded-2xl px-8 py-3 font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Commencer gratuitement
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section avec Carrousel d'Images */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Carrousel d'images en arrière-plan */}
        <div className="absolute inset-0">
          {backgroundSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div 
                className="w-full h-full bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${slide.image})` }}
              ></div>
              <div className={`absolute inset-0 bg-gradient-to-br ${slide.overlay}`}></div>
            </div>
          ))}
        </div>

        {/* Motif de grille par-dessus */}
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3Cpattern id='grid' width='10' height='10' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 10 0 L 0 0 0 10' fill='none' stroke='%23fed7aa' stroke-width='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23grid)'/%3E%3C/svg%3E")`
          }}></div>
        </div>

        {/* Éléments flottants business */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-orange-400 to-rose-400 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-br from-rose-400 to-violet-400 rounded-full opacity-20 animate-bounce"></div>
          <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-gradient-to-br from-violet-400 to-orange-400 rounded-full opacity-20 animate-ping"></div>
        </div>

        {/* Indicateurs de slides */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
          {backgroundSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            ></button>
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          <div className="text-center space-y-12">
            <div className="space-y-8">
              <Badge className="bg-gradient-to-r from-orange-500 to-rose-500 text-white px-6 py-3 rounded-full text-sm font-medium shadow-lg">
                💰 Gagnez 3x plus en vendant en direct
              </Badge>
              
              <h1 className="text-6xl md:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-orange-600 via-rose-600 to-violet-600 bg-clip-text text-transparent">
                  Vendez plus facilement
                </span>
                <span className="block text-white mt-4 drop-shadow-lg">
                  pendant vos lives
                </span>
              </h1>
              
              <p className="text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed font-medium drop-shadow-lg">
                Transformez vos lives Instagram/TikTok en machine à vendre. 
                <span className="bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent font-semibold">
                  Vos clients commandent en 2 clics, vous gagnez plus d'argent.
                </span>
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-6 sm:space-y-0 sm:space-x-8">
              <Button 
                onClick={handleGetStarted}
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white px-10 py-6 rounded-2xl text-xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
              >
                <DollarSign className="w-6 h-6 mr-3" />
                Commencer à vendre
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
              <Button 
                onClick={handleDemo}
                variant="outline" 
                size="lg"
                className="bg-white/20 hover:bg-white/30 border-white/30 text-white hover:text-white px-10 py-6 rounded-2xl text-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
              >
                <Play className="w-6 h-6 mr-3" />
                Voir la démo
              </Button>
            </div>

            {/* Stats business */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-16">
              {[
                { number: "300%", label: "Plus de ventes", icon: TrendingUp, image: "📈" },
                { number: "5min", label: "Configuration", icon: Timer, image: "⚡" },
                { number: "24/7", label: "Disponible", icon: Wifi, image: "🌐" },
                { number: "0€", label: "Pendant la bêta", icon: Gift, image: "🎁" }
              ].map((stat, index) => (
                <div key={index} className="bg-white/20 backdrop-blur-xl rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-white/20">
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-rose-500 rounded-2xl flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-2">{stat.image}</div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">
                      {stat.number}
                    </div>
                    <div className="text-white/90 font-medium">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section Problèmes Business */}
      <section className="py-24 bg-white/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              🚨 Problèmes qui vous coûtent de l'argent
            </Badge>
            <h2 className="text-5xl font-bold text-slate-800 mb-6">
              Vous perdez des ventes à cause de
              <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                ces problèmes
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Chaque problème = ventes perdues et argent qui s'envole
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: DollarSign,
                title: "Ventes perdues",
                description: "Les clients abandonnent quand ils doivent commenter pour commander",
                impact: "Perte de 40% des ventes",
                color: "red",
                image: "💸",
                illustration: "📱"
              },
              {
                icon: Clock,
                title: "Temps gaspillé",
                description: "Vous passez plus de temps à gérer les commandes qu'à vendre",
                impact: "2h perdues par live",
                color: "orange",
                image: "⏰",
                illustration: "📝"
              },
              {
                icon: UserX,
                title: "Clients frustrés",
                description: "L'expérience d'achat compliquée fait fuir vos clients",
                impact: "60% d'abandons",
                color: "yellow",
                image: "😤",
                illustration: "❌"
              },
              {
                icon: AlertTriangle,
                title: "Erreurs de commande",
                description: "Notes manuelles = erreurs = clients mécontents",
                impact: "15% d'erreurs",
                color: "red",
                image: "📋",
                illustration: "✏️"
              },
              {
                icon: XCircle,
                title: "Plateformes instables",
                description: "Les solutions OCR sont interdites et instables",
                impact: "Risque de bannissement",
                color: "orange",
                image: "⚠️",
                illustration: "🚫"
              },
              {
                icon: BarChart3,
                title: "Pas de suivi",
                description: "Impossible de savoir combien vous vendez réellement",
                impact: "Pas de stratégie",
                color: "yellow",
                image: "📊",
                illustration: "❓"
              }
            ].map((item, index) => (
              <Card key={index} className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-3 rounded-3xl overflow-hidden group">
                <div className={`w-full h-2 bg-gradient-to-r from-${item.color}-500 to-${item.color === 'red' ? 'orange' : item.color === 'orange' ? 'yellow' : 'orange'}-500`}></div>
                <CardHeader className="text-center pb-6 pt-8">
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className={`w-full h-full bg-gradient-to-br from-${item.color}-100 to-${item.color === 'red' ? 'orange' : item.color === 'orange' ? 'yellow' : 'orange'}-100 rounded-3xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-300`}>
                      {item.image}
                    </div>
                    <div className={`absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-${item.color}-500 to-${item.color === 'red' ? 'orange' : item.color === 'orange' ? 'yellow' : 'orange'}-500 rounded-full flex items-center justify-center text-sm`}>
                      {item.illustration}
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-800">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-slate-600 leading-relaxed text-base mb-4">
                    {item.description}
                  </CardDescription>
                  <Badge className={`bg-gradient-to-r from-${item.color}-500 to-${item.color === 'red' ? 'orange' : item.color === 'orange' ? 'yellow' : 'orange'}-500 text-white px-4 py-2 rounded-full font-medium`}>
                    {item.impact}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section Solution Business */}
      <section className="py-24 bg-gradient-to-br from-orange-50 via-rose-50 to-violet-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <Badge className="bg-gradient-to-r from-orange-500 to-rose-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              ✅ Solution simple et efficace
            </Badge>
            <h2 className="text-5xl font-bold text-slate-800 mb-6">
              Un lien unique qui 
              <span className="bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
                transforme vos lives en machine à vendre
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Vos clients commandent en 2 clics, vous gagnez plus d'argent
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Étapes business */}
            <div className="space-y-8">
              {[
                {
                  step: "1",
                  title: "Créez votre boutique",
                  description: "Ajoutez vos produits en 5 minutes",
                  icon: Package,
                  benefit: "Prêt en 5 minutes",
                  image: "🏪"
                },
                {
                  step: "2", 
                  title: "Partagez votre lien",
                  description: "Copiez le lien et mettez-le dans votre bio",
                  icon: Link,
                  benefit: "Un seul lien",
                  image: "🔗"
                },
                {
                  step: "3",
                  title: "Vendez en live",
                  description: "Vos clients commandent pendant votre live",
                  icon: ShoppingCart,
                  benefit: "Commandes automatiques",
                  image: "📱"
                },
                {
                  step: "4",
                  title: "Gagnez plus",
                  description: "Recevez les commandes et l'argent",
                  icon: DollarSign,
                  benefit: "+300% de ventes",
                  image: "💰"
                }
              ].map((item, index) => (
                <div key={index} className="flex items-start space-x-6 group">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-rose-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white font-bold text-xl">{item.step}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-2xl">{item.image}</span>
                      <h3 className="text-2xl font-bold text-slate-800">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-lg mb-2">
                      {item.description}
                    </p>
                    <Badge className="bg-orange-100 text-orange-700 border-orange-200 px-3 py-1 rounded-full text-sm font-medium">
                      {item.benefit}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {/* Mockup Mobile Business */}
            <div className="relative">
              <div className="w-80 h-[700px] bg-gradient-to-br from-slate-900 to-slate-800 rounded-[3rem] shadow-2xl mx-auto relative overflow-hidden">
                <div className="absolute inset-2 bg-white rounded-[2.5rem] overflow-hidden">
                  {/* Header business */}
                  <div className="bg-gradient-to-r from-orange-500 to-rose-500 p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          <ShoppingCart className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-lg">Ma Boutique</span>
                      </div>
                      <Badge className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                        🔴 EN LIVE
                      </Badge>
                    </div>
                  </div>

                  {/* Contenu business */}
                  <div className="p-6 space-y-6">
                    <div className="aspect-square bg-gradient-to-br from-orange-100 to-rose-100 rounded-3xl mb-6 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-rose-500/20"></div>
                      <div className="text-6xl">👗</div>
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-gradient-to-r from-orange-500 to-rose-500 text-white px-2 py-1 rounded-full text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          VEDETTE
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-slate-800">Robe africaine</h3>
                      <p className="text-slate-600">Robe traditionnelle en wax</p>
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
                          15.000 XOF
                        </span>
                        <Badge className="bg-green-100 text-green-700 border-green-200 px-3 py-1 rounded-full">
                          En stock
                        </Badge>
                      </div>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white rounded-2xl py-4 text-lg font-bold shadow-lg">
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Commander maintenant
                    </Button>

                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { name: "Sac", price: "25.000", emoji: "👜" },
                        { name: "Chaussures", price: "12.000", emoji: "👠" },
                        { name: "Bijoux", price: "8.000", emoji: "💍" }
                      ].map((product, index) => (
                        <div key={index} className="bg-slate-100 rounded-2xl p-3 text-center">
                          <div className="text-2xl mb-2">{product.emoji}</div>
                          <div className="text-xs font-medium text-slate-700">{product.name}</div>
                          <div className="text-xs font-bold text-orange-600">{product.price}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-transparent via-white/10 to-transparent pointer-events-none"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Avantages Business */}
      <section className="py-24 bg-white/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <Badge className="bg-gradient-to-r from-orange-500 to-rose-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              💰 Pourquoi ça marche
            </Badge>
            <h2 className="text-5xl font-bold text-slate-800 mb-6">
              Des résultats 
              <span className="bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
                concrets et mesurables
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Nos vendeurs voient des résultats immédiats
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: TrendingUp,
                title: "+300% de ventes",
                description: "Vos clients commandent plus facilement",
                color: "orange",
                image: "📈"
              },
              {
                icon: Timer,
                title: "5 min de setup",
                description: "Configuration ultra-rapide",
                color: "rose",
                image: "⚡"
              },
              {
                icon: UserCheck,
                title: "Clients satisfaits",
                description: "Expérience d'achat fluide",
                color: "violet",
                image: "😊"
              },
              {
                icon: DollarSign,
                title: "Revenus garantis",
                description: "Gagnez plus d'argent",
                color: "orange",
                image: "💎"
              }
            ].map((item, index) => (
              <Card key={index} className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-3 rounded-3xl overflow-hidden group">
                <div className={`w-full h-2 bg-gradient-to-r from-${item.color}-500 to-${item.color === 'orange' ? 'rose' : item.color === 'rose' ? 'violet' : 'orange'}-500`}></div>
                <CardHeader className="text-center pb-6 pt-8">
                  <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className={`w-full h-full bg-gradient-to-br from-${item.color}-100 to-${item.color === 'orange' ? 'rose' : item.color === 'rose' ? 'violet' : 'orange'}-100 rounded-3xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300`}>
                      {item.image}
                    </div>
                    <div className={`absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-${item.color}-500 to-${item.color === 'orange' ? 'rose' : item.color === 'rose' ? 'violet' : 'orange'}-500 rounded-full flex items-center justify-center`}>
                      <item.icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-800">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-600 leading-relaxed text-center text-base">
                    {item.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section Témoignages Business */}
      <section className="py-24 bg-gradient-to-br from-orange-50 via-rose-50 to-violet-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <Badge className="bg-gradient-to-r from-orange-500 to-rose-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              🎯 Ils ont réussi
            </Badge>
            <h2 className="text-5xl font-bold text-slate-800 mb-6">
              Ce que disent nos 
              <span className="bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
                vendeurs stars
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Fatou D.",
                business: "Mode africaine",
                testimonial: "J'ai triplé mes ventes en 2 semaines ! Mes clients adorent commander en 2 clics.",
                sales: "+250%",
                avatar: "👩‍💼",
                image: "👗"
              },
              {
                name: "Moussa K.",
                business: "Électronique",
                testimonial: "Plus d'erreurs de commande, plus de clients satisfaits. Je recommande !",
                sales: "+180%",
                avatar: "👨‍💼",
                image: "📱"
              },
              {
                name: "Aissatou B.",
                business: "Beauté",
                testimonial: "Mes lives sont maintenant de vraies machines à vendre. Incroyable !",
                sales: "+320%",
                avatar: "👩‍💼",
                image: "💄"
              }
            ].map((testimonial, index) => (
              <Card key={index} className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-3 rounded-3xl overflow-hidden">
                <CardHeader className="text-center pb-6 pt-8">
                  <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="w-full h-full bg-gradient-to-br from-orange-100 to-rose-100 rounded-3xl flex items-center justify-center text-4xl">
                      {testimonial.avatar}
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-orange-500 to-rose-500 rounded-full flex items-center justify-center text-sm">
                      {testimonial.image}
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-800">
                    {testimonial.name}
                  </CardTitle>
                  <CardDescription className="text-orange-600 font-medium">
                    {testimonial.business}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-slate-600 leading-relaxed text-base mb-4">
                    "{testimonial.testimonial}"
                  </CardDescription>
                  <Badge className="bg-gradient-to-r from-orange-500 to-rose-500 text-white px-4 py-2 rounded-full font-medium">
                    {testimonial.sales} de ventes
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section CTA Business */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-orange-900 to-rose-900 relative overflow-hidden">
        <div className="absolute inset-0"></div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="space-y-12">
            <div className="space-y-8">
              <Badge className="bg-gradient-to-r from-orange-500 to-rose-500 text-white px-6 py-3 rounded-full text-sm font-medium shadow-lg animate-pulse">
                🚀 Prêt à multiplier vos ventes ?
              </Badge>
              
              <h2 className="text-5xl md:text-6xl font-bold text-white leading-tight">
                Rejoignez les vendeurs qui 
                <span className="bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">
                  gagnent plus
                </span>
              </h2>
              
              <p className="text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
                Commencez gratuitement et voyez vos ventes exploser dès la première semaine.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-6 sm:space-y-0 sm:space-x-8">
              <Button 
                onClick={handleGetStarted}
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white px-12 py-6 rounded-2xl text-xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
              >
                <DollarSign className="w-6 h-6 mr-3" />
                Commencer gratuitement
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
              <Button 
                onClick={handleDemo}
                variant="outline" 
                size="lg"
                className="bg-white/10 hover:bg-white/20 border-white/20 text-white hover:text-white px-12 py-6 rounded-2xl text-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Play className="w-6 h-6 mr-3" />
                Voir la démo
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="flex items-center justify-center space-x-3 text-slate-300">
                <CheckCircle className="w-6 h-6 text-orange-400" />
                <span className="text-lg font-medium">Gratuit pendant la bêta</span>
              </div>
              <div className="flex items-center justify-center space-x-3 text-slate-300">
                <CheckCircle className="w-6 h-6 text-orange-400" />
                <span className="text-lg font-medium">Configuration en 5 minutes</span>
              </div>
              <div className="flex items-center justify-center space-x-3 text-slate-300">
                <CheckCircle className="w-6 h-6 text-orange-400" />
                <span className="text-lg font-medium">Support prioritaire</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Business */}
      <footer className="bg-white/90 backdrop-blur-xl border-t border-orange-200/50">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12">
            <div className="flex items-center space-x-4 mb-6 md:mb-0">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Link className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
                LiveShop Link
              </span>
            </div>
            <div className="flex items-center space-x-8 text-slate-600">
              <a href="#" className="hover:text-orange-600 transition-colors font-medium">À propos</a>
              <a href="#" className="hover:text-orange-600 transition-colors font-medium">Contact</a>
              <a href="#" className="hover:text-orange-600 transition-colors font-medium">Support</a>
              <a href="#" className="hover:text-orange-600 transition-colors font-medium">Mentions légales</a>
            </div>
          </div>
          <div className="border-t border-slate-200/50 pt-8 text-center text-slate-500">
            <p>&copy; 2024 LiveShop Link. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 