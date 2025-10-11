import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from '@/config/emailjs';
import SEO from '@/components/SEO';
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
  XCircle,
  Home,
  Settings,
  ArrowLeft,
  ArrowUpRight,
  Menu,
  X,
  Mail,
  MapPin,
  Phone as PhoneIcon
} from 'lucide-react';

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  // Structured Data pour le SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "LiveShop Link",
    "description": "L'app qui vend pour vous pendant que vous animez vos lives",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Mobile",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "XOF"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "1000"
    },
    "author": {
      "@type": "Organization",
      "name": "LiveShop Link"
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      // Détecter si on a scrollé au-delà du hero (environ 80vh)
      setIsScrolled(window.scrollY > window.innerHeight * 0.8);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = () => {
    // Rediriger vers l'espace de connexion de space.livelink.store
    window.location.href = 'https://space.livelink.store';
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    const formData = new FormData(e.target);
    const data = {
      from_name: formData.get('name'),
      from_email: formData.get('email'),
      phone: formData.get('phone'),
      message: formData.get('message'),
      to_email: 'manou4pf@gmail.com'
    };

    // Debug: Afficher les données et la configuration
    console.log('📧 Données à envoyer:', data);
    console.log('🔑 Configuration EmailJS:', EMAILJS_CONFIG);

    try {
      // Vérifier que les clés sont présentes
      if (!EMAILJS_CONFIG.SERVICE_ID || !EMAILJS_CONFIG.TEMPLATE_ID || !EMAILJS_CONFIG.PUBLIC_KEY) {
        throw new Error('Configuration EmailJS incomplète');
      }

      console.log('🚀 Envoi en cours...');
      const result = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID, 
        EMAILJS_CONFIG.TEMPLATE_ID, 
        data, 
        EMAILJS_CONFIG.PUBLIC_KEY
      );
      
      console.log('✅ Email envoyé avec succès:', result);
      setSubmitStatus('success');
      e.target.reset(); // Reset le formulaire
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi:', error);
      console.error('Détails de l\'erreur:', {
        message: error.message,
        status: error.status,
        text: error.text
      });
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemo = () => {
    window.open('/demo', '_blank');
  };

  const scrollToSection = (sectionId) => {
    const section = document.querySelector(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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

  // Section "How it works" - 3 étapes
  const howItWorks = [
    {
      step: "01",
      title: "Créez votre boutique",
      description: "Inscrivez-vous en quelques secondes et personnalisez votre boutique mobile",
      icon: Rocket,
      color: "from-blue-500 to-indigo-600"
    },
    {
      step: "02", 
      title: "Ajoutez vos produits",
      description: "Importez vos produits avec photos et descriptions en quelques clics",
      icon: Package,
      color: "from-green-500 to-emerald-600"
    },
    {
      step: "03",
      title: "Commencez à vendre",
      description: "Lancez vos ventes en direct et recevez vos commandes en temps réel",
      icon: TrendingUp,
      color: "from-purple-500 to-pink-600"
    }
  ];

  // Section témoignages
  const testimonials = [
    {
      name: "Fatou Diop",
      role: "Vendeuse de mode",
      content: "LiveShop Link a transformé mon business. Mes ventes ont augmenté de 60% en 3 mois !",
      avatar: "👩🏾‍💼",
      rating: 5
    },
    {
      name: "Moussa Diallo", 
      role: "Vendeur d'électronique",
      content: "L'interface mobile est parfaite. Je peux gérer mes ventes n'importe où, n'importe quand.",
      avatar: "👨🏾‍💻",
      rating: 5
    },
    {
      name: "Aminata Ba",
      role: "Vendeuse de cosmétiques", 
      content: "Les notifications en temps réel m'ont fait gagner beaucoup de temps. Je recommande !",
      avatar: "👩🏾‍🎨",
      rating: 5
    }
  ];

  // Section tarification
  const pricingPlans = [
    {
      name: "Gratuit",
      price: "0",
      period: "€/mois",
      description: "Parfait pour commencer",
      features: [
        "Jusqu'à 10 produits",
        "Interface mobile",
        "Notifications de base",
        "Support par email"
      ],
      color: "from-gray-500 to-gray-600",
      popular: false
    },
    {
      name: "Pro",
      price: "29",
      period: "€/mois", 
      description: "Pour les vendeurs actifs",
      features: [
        "Produits illimités",
        "Analytics avancées",
        "Notifications push",
        "Support prioritaire",
        "Ventes en direct"
      ],
      color: "from-blue-500 to-indigo-600",
      popular: true
    },
    {
      name: "Entreprise",
      price: "99",
      period: "€/mois",
      description: "Pour les grandes équipes",
      features: [
        "Tout du plan Pro",
        "Multi-vendeurs",
        "API personnalisée",
        "Support dédié",
        "Formation personnalisée"
      ],
      color: "from-purple-500 to-pink-600",
      popular: false
    }
  ];

  return (
    <>
      <SEO 
        title="LiveShop Link - Commerce en Direct Révolutionnaire"
        description="L'app qui vend pour vous pendant que vous animez vos lives. Augmentez vos revenus de 40% avec notre écosystème communautaire. Rejoignez +1000 vendeurs actifs."
        keywords="commerce en direct, live shopping, vente en ligne, mobile, Sénégal, Afrique, e-commerce, vente directe, live commerce"
        image="/og-image.jpg"
        url="https://livelink.store"
        structuredData={structuredData}
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
      {/* Navigation - Style Glassmorphism */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ 
          y: 0, 
          opacity: 1,
          backgroundColor: isScrolled ? 'rgba(126, 34, 206, 0.95)' : 'rgba(255, 255, 255, 0.1)'
        }}
        transition={{ duration: 0.3 }}
        className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b ${
          isScrolled ? 'border-purple-700/30 shadow-xl' : 'border-white/20'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 sm:py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center space-x-2 sm:space-x-3"
            >
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="flex items-center space-x-2"
              >
                <img 
                  src="/liveshop.png" 
                  alt="LiveShopLogo" 
                  className="w-8 h-8 sm:w-10 sm:h-10 object-contain" 
                />
                <span className="text-sm sm:text-lg lg:text-2xl font-bold text-white">
                  LiveShop Link
                </span>
              </motion.div>
            </motion.div>
            
            {/* Navigation Links - Desktop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="hidden lg:flex items-center space-x-6"
            >
              <motion.button 
                whileHover={{ y: -2 }}
                onClick={() => scrollToSection('#features')}
                className="text-white/80 hover:text-white transition-colors cursor-pointer bg-transparent border-none text-sm"
              >
                Fonctionnalités
              </motion.button>
              <motion.button 
                whileHover={{ y: -2 }}
                onClick={() => scrollToSection('#pricing')}
                className="text-white/80 hover:text-white transition-colors cursor-pointer bg-transparent border-none text-sm"
              >
                Tarifs
              </motion.button>
              <motion.button 
                whileHover={{ y: -2 }}
                onClick={() => scrollToSection('#testimonials')}
                className="text-white/80 hover:text-white transition-colors cursor-pointer bg-transparent border-none text-sm"
              >
                Témoignages
              </motion.button>
              <motion.button 
                whileHover={{ y: -2 }}
                onClick={() => scrollToSection('#how-it-works')}
                className="text-white/80 hover:text-white transition-colors cursor-pointer bg-transparent border-none text-sm"
              >
                Comment ça marche
              </motion.button>
              <motion.button 
                whileHover={{ y: -2 }}
                onClick={() => scrollToSection('#contact')}
                className="text-white/80 hover:text-white transition-colors cursor-pointer bg-transparent border-none text-sm"
              >
                Contact
              </motion.button>
            </motion.div>
            
            {/* CTA Buttons - Desktop */}
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="hidden md:flex items-center space-x-3"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  onClick={handleDemo}
                  className="border-white/30 text-black hover:bg-white/10 backdrop-blur-sm text-sm px-4 py-2"
                >
                  Voir la démo
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleGetStarted}
                  className="bg-purple-500 hover:bg-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-sm px-4 py-2"
                >
                  Commencer
                </Button>
              </motion.div>
            </motion.div>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-white"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
            </div>

          {/* Mobile Menu */}
          <motion.div
            initial={false}
            animate={{ height: isMobileMenuOpen ? 'auto' : 0, opacity: isMobileMenuOpen ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden"
          >
            <div className="py-4 space-y-4">
              <button 
                onClick={() => { scrollToSection('#features'); setIsMobileMenuOpen(false); }}
                className="block w-full text-left text-white/80 hover:text-white transition-colors py-2"
              >
                Fonctionnalités
              </button>
              <button 
                onClick={() => { scrollToSection('#pricing'); setIsMobileMenuOpen(false); }}
                className="block w-full text-left text-white/80 hover:text-white transition-colors py-2"
              >
                Tarifs
              </button>
              <button 
                onClick={() => { scrollToSection('#testimonials'); setIsMobileMenuOpen(false); }}
                className="block w-full text-left text-white/80 hover:text-white transition-colors py-2"
              >
                Témoignages
              </button>
              <button 
                onClick={() => { scrollToSection('#how-it-works'); setIsMobileMenuOpen(false); }}
                className="block w-full text-left text-white/80 hover:text-white transition-colors py-2"
              >
                Comment ça marche
              </button>
              <button 
                onClick={() => { scrollToSection('#contact'); setIsMobileMenuOpen(false); }}
                className="block w-full text-left text-white/80 hover:text-white transition-colors py-2"
              >
                Contact
              </button>
              <div className="pt-4 space-y-3 border-t border-white/20">
              <Button
                variant="outline"
                onClick={handleDemo}
                  className="w-full border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
              >
                Voir la démo
              </Button>
              <Button
                onClick={handleGetStarted}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white shadow-lg"
              >
                  Commencer
              </Button>
            </div>
          </div>
          </motion.div>
        </div>
      </motion.nav>

      {/* Hero Section - Style Moderne et Épuré */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center overflow-hidden"
      >
        {/* Background Pattern subtil */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="absolute inset-0"
        >
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-24 sm:py-32 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Contenu Principal */}
            <motion.div 
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="space-y-6 sm:space-y-8 text-center lg:text-left"
            >

              {/* Titre Principal avec gradient */}
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="space-y-4 sm:space-y-6"
              >
                <motion.h1 
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight"
                >
                  Entrez dans le futur du
                  <br />
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 1 }}
                    className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
                  >
                    Commerce en Direct
                  </motion.span>
                </motion.h1>
                
                <motion.p 
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.9 }}
                  className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
                >
                  Notre application révolutionne la façon dont vous vendez en direct, offrant des insights personnalisés et des stratégies actionables pour maximiser vos revenus pendant vos lives.
                </motion.p>
              </motion.div>

              {/* CTA Button */}
              <motion.div 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.1 }}
                className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center lg:justify-start"
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto"
                >
                <Button
                  onClick={handleGetStarted}
                  size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-2 border-white/30 text-black hover:bg-white/10 px-8 sm:px-10 py-4 sm:py-5 text-lg sm:text-xl font-bold rounded-2xl backdrop-blur-sm transition-all duration-300 flex items-center justify-center gap-3"
                  >
                    Créer ma boutique 
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6" />
                    </motion.div>
                </Button>
                </motion.div>
              </motion.div>
              
              {/* Social Proof */}
              <motion.div 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.3 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4"
              >
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1.5 }}
                  className="flex -space-x-2"
                >
                  {[1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.5, delay: 1.7 + i * 0.1 }}
                      whileHover={{ scale: 1.1, y: -5 }}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 border-2 border-white/20 flex items-center justify-center text-white font-bold text-xs sm:text-sm"
                    >
                      {i}
                    </motion.div>
                  ))}
                </motion.div>
                <motion.div 
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1.6 }}
                  className="text-white/70 text-center lg:text-left"
                >
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 1.8 }}
                    className="font-semibold text-base sm:text-lg"
                  >
                    10M+
                  </motion.div>
                  <div className="text-xs sm:text-sm">10+ millions de vendeurs utilisent notre produit chaque jour</div>
                </motion.div>
              </motion.div>

              {/* Stats avec design moderne */}
         
            </motion.div>

            {/* Smartphone Mockup */}
            <motion.div 
              initial={{ x: 100, opacity: 0, scale: 0.8 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="relative flex justify-center lg:justify-end mt-8 lg:mt-0"
            >
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 2 }}
                transition={{ duration: 0.3 }}
                className="relative z-10 w-full max-w-sm sm:max-w-md lg:max-w-lg"
              >
                <motion.img 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 1 }}
                  src="/imgHero.png" 
                  alt="LiveShop Link App"
                  className="w-full h-auto"
                />
              </motion.div>
              
              {/* Background Glow */}
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1.5, opacity: 0.2 }}
                transition={{ duration: 2, delay: 1.2 }}
                className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl"
              ></motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator amélioré */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
          onClick={() => {
            const nextSection = document.querySelector('#problem-solution');
            if (nextSection) {
              nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }}
        >
          <motion.div 
            whileHover={{ scale: 1.2, y: 5 }}
            whileTap={{ scale: 0.9 }}
            animate={{ y: [0, 10, 0] }}
            transition={{ 
              y: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
            }}
            className="w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm bg-white/10 hover:bg-white/20 border border-white/30 transition-colors"
          >
            <ArrowUpRight className="w-6 h-6 text-white rotate-90" />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Problem/Solution Section */}
      <motion.section 
        id="problem-solution"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.1 }}
        className="py-20 bg-white"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Problèmes - Côté gauche */}
            <motion.div 
              initial={{ x: -100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <motion.div 
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true, amount: 0.2 }}
                className="space-y-4"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  viewport={{ once: true }}
                >
                <Badge className="bg-red-100 text-red-700 px-4 py-2 rounded-full">
                  ❌ Problèmes actuels
                </Badge>
                </motion.div>
                <motion.h2 
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  viewport={{ once: true }}
                  className="text-4xl font-bold text-slate-800"
                >
                  Les défis des vendeurs traditionnels
                </motion.h2>
              </motion.div>
              
              <div className="space-y-4">
                {[
                  { title: "Gestion complexe", desc: "Interfaces obsolètes et difficiles à utiliser" },
                  { title: "Pas de temps réel", desc: "Retard dans les notifications et suivi des commandes" },
                  { title: "Mobile non optimisé", desc: "Interfaces non adaptées aux appareils mobiles" }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: -50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ x: 10, scale: 1.02 }}
                    className="flex items-start space-x-3"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -90 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                      viewport={{ once: true }}
                    >
                  <XCircle className="w-6 h-6 text-red-500 mt-1" />
                    </motion.div>
                  <div>
                      <h3 className="font-semibold text-slate-800">{item.title}</h3>
                      <p className="text-slate-600">{item.desc}</p>
                  </div>
                  </motion.div>
                ))}
                </div>
            </motion.div>

            {/* Solution - Côté droit */}
            <motion.div 
              initial={{ x: 100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <motion.div 
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true, amount: 0.2 }}
                className="space-y-4"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  viewport={{ once: true }}
                >
                <Badge className="bg-green-100 text-green-700 px-4 py-2 rounded-full">
                  ✅ Solution LiveShop Link
                </Badge>
                </motion.div>
                <motion.h2 
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  viewport={{ once: true }}
                  className="text-4xl font-bold text-slate-800"
                >
                  Une plateforme moderne et complète
                </motion.h2>
              </motion.div>
              
              <div className="space-y-4">
                {[
                  { title: "Interface intuitive", desc: "Design moderne et facile à utiliser" },
                  { title: "Temps réel", desc: "Notifications instantanées et suivi en direct" },
                  { title: "Mobile-first", desc: "Interface optimisée pour tous les appareils" }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: 50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ x: -10, scale: 1.02 }}
                    className="flex items-start space-x-3"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: 90 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                      viewport={{ once: true }}
                    >
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
                    </motion.div>
                  <div>
                      <h3 className="font-semibold text-slate-800">{item.title}</h3>
                      <p className="text-slate-600">{item.desc}</p>
                  </div>
                  </motion.div>
                ))}
                </div>
            </motion.div>
                  </div>
                </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        id="features"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.1 }}
        className="py-20 bg-gradient-to-br from-slate-50 to-blue-50"
      >
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true, amount: 0.1 }}
            className="text-center space-y-8 mb-16"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
            <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-full text-sm font-medium">
              🚀 Fonctionnalités principales
            </Badge>
            </motion.div>
            <motion.h2 
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-slate-800"
            >
              Tout ce dont vous avez besoin pour réussir
            </motion.h2>
            <motion.p 
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
              className="text-xl text-slate-600 max-w-3xl mx-auto"
            >
              Une plateforme complète avec toutes les fonctionnalités essentielles pour le live commerce
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index} 
                initial={{ y: 50, opacity: 0, scale: 0.9 }}
                whileInView={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                viewport={{ once: true, amount: 0.3 }}
                whileHover={{ y: -10, scale: 1.05 }}
              >
                <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 h-full">
                <CardContent className="p-8">
                    <motion.div 
                      whileHover={{ rotate: 360, scale: 1.2 }}
                      transition={{ duration: 0.6 }}
                      className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6`}
                    >
                    <feature.icon className="w-8 h-8 text-white" />
                    </motion.div>
                  
                  <h3 className="text-xl font-bold text-slate-800 mb-4">
                    {feature.title}
                  </h3>
                  
                  <p className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* How it works Section */}
      <motion.section 
        id="how-it-works"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.1 }}
        className="py-20 bg-white"
      >
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true, amount: 0.1 }}
            className="text-center space-y-8 mb-16"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-full text-sm font-medium">
                🚀 Comment ça marche
              </Badge>
            </motion.div>
            <motion.h2 
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-slate-800"
            >
              Commencez en 3 étapes simples
            </motion.h2>
            <motion.p 
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
              className="text-xl text-slate-600 max-w-3xl mx-auto"
            >
              De l'inscription à vos premières ventes, tout est conçu pour être simple et rapide
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <motion.div 
                key={index} 
                initial={{ y: 50, opacity: 0, scale: 0.9 }}
                whileInView={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 * index }}
                viewport={{ once: true, amount: 0.3 }}
                whileHover={{ y: -10 }}
                className="relative"
              >
                {/* Ligne de connexion */}
                {index < howItWorks.length - 1 && (
                  <motion.div 
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 + index * 0.2 }}
                    viewport={{ once: true }}
                    className="hidden md:block absolute top-16 left-1/2 w-full h-0.5 bg-gradient-to-r from-slate-200 to-slate-300 transform translate-x-8 origin-left"
                  ></motion.div>
                )}
                
                <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 h-full">
                  <CardContent className="p-8 text-center">
                    <motion.div 
                      whileHover={{ rotate: 360, scale: 1.2 }}
                      transition={{ duration: 0.6 }}
                      className={`w-20 h-20 bg-gradient-to-r ${step.color} rounded-3xl flex items-center justify-center mb-6 mx-auto`}
                    >
                      <step.icon className="w-10 h-10 text-white" />
                    </motion.div>
                    
                    <motion.div 
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                      viewport={{ once: true }}
                      className="text-6xl font-bold text-slate-200 mb-4"
                    >
                      {step.step}
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold text-slate-800 mb-4">
                      {step.title}
                    </h3>
                    
                    <p className="text-slate-600 leading-relaxed">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section 
        id="testimonials"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.1 }}
        className="py-20 bg-gradient-to-br from-slate-50 to-indigo-50"
      >
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true, amount: 0.1 }}
            className="text-center space-y-8 mb-16"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-full text-sm font-medium">
                💬 Témoignages
              </Badge>
            </motion.div>
            <motion.h2 
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-slate-800"
            >
              Ce que disent nos vendeurs
            </motion.h2>
            <motion.p 
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
              className="text-xl text-slate-600 max-w-3xl mx-auto"
            >
              Découvrez comment LiveShop Link transforme les ventes de nos utilisateurs
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0, rotate: -5 }}
                whileInView={{ y: 0, opacity: 1, rotate: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                viewport={{ once: true, amount: 0.3 }}
                whileHover={{ y: -10, rotate: 2 }}
              >
                <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 h-full">
                  <CardContent className="p-8">
                    <motion.div 
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center mb-6"
                    >
                      <div className="text-4xl mr-4">{testimonial.avatar}</div>
                      <div>
                        <h4 className="font-bold text-slate-800">{testimonial.name}</h4>
                        <p className="text-slate-600 text-sm">{testimonial.role}</p>
                      </div>
                    </motion.div>
                    
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0, rotate: -180 }}
                          whileInView={{ scale: 1, rotate: 0 }}
                          transition={{ duration: 0.3, delay: 0.5 + i * 0.05 }}
                          viewport={{ once: true }}
                        >
                          <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        </motion.div>
                      ))}
                    </div>
                    
                    <p className="text-slate-600 italic leading-relaxed">
                      "{testimonial.content}"
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Pricing Section */}
      <motion.section 
        id="pricing"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.1 }}
        className="py-20 bg-white"
      >
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true, amount: 0.1 }}
            className="text-center space-y-8 mb-16"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-full text-sm font-medium">
                💰 Tarification
              </Badge>
            </motion.div>
            <motion.h2 
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-slate-800"
            >
              Choisissez votre plan
            </motion.h2>
            <motion.p 
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
              className="text-xl text-slate-600 max-w-3xl mx-auto"
            >
              Des tarifs transparents pour tous les besoins, du débutant à l'entreprise
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0, scale: 0.9 }}
                whileInView={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                viewport={{ once: true, amount: 0.3 }}
                whileHover={{ y: -15, scale: 1.05 }}
              >
                <Card className={`group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 h-full ${plan.popular ? 'ring-2 ring-indigo-500' : ''}`}>
                  {plan.popular && (
                    <motion.div 
                      initial={{ y: -20, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      viewport={{ once: true }}
                      className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    >
                      <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                        Le plus populaire
                      </Badge>
                    </motion.div>
                  )}
                  
                  <CardContent className="p-8">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-slate-800 mb-2">{plan.name}</h3>
                      <p className="text-slate-600 mb-4">{plan.description}</p>
                      
                      <motion.div 
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                        viewport={{ once: true }}
                        className="flex items-baseline justify-center mb-6"
                      >
                        <span className="text-5xl font-bold text-slate-800">{plan.price}</span>
                        <span className="text-slate-600 ml-2">{plan.period}</span>
                      </motion.div>
                    </div>
                    
                    <div className="space-y-4 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <motion.div 
                          key={featureIndex} 
                          initial={{ x: -20, opacity: 0 }}
                          whileInView={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.4, delay: 0.5 + featureIndex * 0.05 }}
                          viewport={{ once: true }}
                          className="flex items-center space-x-3"
                        >
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-slate-600">{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                    
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={handleGetStarted}
                        className={`w-full py-3 text-lg font-semibold rounded-xl transition-all duration-300 ${
                          plan.popular 
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl' 
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        {plan.price === "0" ? "Commencer gratuitement" : "Choisir ce plan"}
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

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

    

      {/* Final CTA Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-24 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden"
      >
        {/* Background Pattern */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.1 }}
          transition={{ duration: 1.5 }}
          viewport={{ once: true }}
          className="absolute inset-0"
        >
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </motion.div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <div className="space-y-12">
            {/* Badge */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="inline-flex items-center px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20"
            >
              <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></div>
              <span className="text-white/90 text-sm font-medium">Rejoignez +1000 vendeurs actifs</span>
            </motion.div>

          <div className="space-y-8">
              <motion.h2 
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true, amount: 0.2 }}
                className="text-5xl md:text-6xl font-bold text-white leading-tight"
              >
                Prêt à révolutionner
                <br />
                <motion.span 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                >
                  vos ventes ?
                </motion.span>
              </motion.h2>
              
              <motion.p 
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                viewport={{ once: true, amount: 0.2 }}
                className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed"
              >
                Transformez votre business avec la première plateforme de live commerce mobile. 
                Augmentez vos ventes de 40% dès le premier mois.
              </motion.p>
            
            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
              <Button
                onClick={handleGetStarted}
                size="lg"
                  className="bg-white text-slate-900 hover:bg-white/90 px-12 py-6 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300"
              >
                <Rocket className="w-6 h-6 mr-3" />
                  Commencer gratuitement
              </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
              <Button
                onClick={handleDemo}
                variant="outline"
                size="lg"
                  className="border-2 border-white/30 text-white hover:bg-white/10 px-12 py-6 text-xl font-bold rounded-2xl backdrop-blur-sm transition-all duration-300"
              >
                <Play className="w-6 h-6 mr-3" />
                Voir la démo
              </Button>
              </motion.div>
            </motion.div>
              
              {/* Trust indicators */}
              <motion.div 
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.1 }}
                viewport={{ once: true, amount: 0.2 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8 text-white/60"
              >
                {[
                  { icon: Shield, text: "100% Sécurisé" },
                  { icon: Zap, text: "Configuration en 5 min" },
                  { icon: Heart, text: "Support 24/7" }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.1, y: -3 }}
                    className="flex items-center gap-2"
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Contact Section */}
      <motion.section 
        id="contact"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.1 }}
        className="py-20 bg-gradient-to-br from-slate-50 to-indigo-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true, amount: 0.1 }}
            className="text-center space-y-8 mb-16"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true, amount: 0.2 }}
            >
              <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-full text-sm font-medium">
                📧 Contactez-nous
              </Badge>
            </motion.div>
            <motion.h2 
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true, amount: 0.2 }}
              className="text-4xl md:text-5xl font-bold text-slate-800"
            >
              Une question ? Parlons-en !
            </motion.h2>
            <motion.p 
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true, amount: 0.2 }}
              className="text-xl text-slate-600 max-w-3xl mx-auto"
            >
              Notre équipe est là pour vous accompagner dans votre transformation digitale
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Informations de contact */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true, amount: 0.3 }}
              className="space-y-8"
            >
              <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-6">Restons en contact</h3>
                <p className="text-slate-600 mb-8">
                  N'hésitez pas à nous contacter pour toute question, démonstration ou pour démarrer votre boutique en ligne.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  { icon: Mail, title: "Email", value: "contact@livelink.store", link: "mailto:contact@livelink.store" },
                  { icon: PhoneIcon, title: "Téléphone", value: "+221 XX XXX XX XX", link: "tel:+221XXXXXXXXX" },
                  { icon: MapPin, title: "Adresse", value: "Dakar, Sénégal", link: null }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: -30, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    whileHover={{ x: 5, scale: 1.02 }}
                    className="flex items-start space-x-4 p-4 rounded-xl hover:bg-white/50 transition-colors"
                  >
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0"
                    >
                      <item.icon className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                      <h4 className="font-semibold text-slate-800 mb-1">{item.title}</h4>
                      {item.link ? (
                        <a href={item.link} className="text-slate-600 hover:text-indigo-600 transition-colors">
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-slate-600">{item.value}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Formulaire de contact */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true, amount: 0.3 }}
            >
              <Card className="border-0 shadow-2xl">
                <CardContent className="p-8">
                  <form className="space-y-6" onSubmit={handleContactSubmit}>
                    {/* Message de statut */}
                    {submitStatus === 'success' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-xl"
                      >
                        ✅ Message envoyé avec succès ! Nous vous contacterons bientôt.
                      </motion.div>
                    )}
                    
                    {submitStatus === 'error' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl"
                      >
                        ❌ Erreur lors de l'envoi. Veuillez réessayer.
                      </motion.div>
                    )}

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Nom complet
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                        placeholder="Votre nom"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                        placeholder="votre@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                        placeholder="+221 184 27 87"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Message
                      </label>
                      <textarea
                        name="message"
                        required
                        rows="4"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none"
                        placeholder="Parlez-nous de votre projet..."
                      ></textarea>
                    </div>

                    <motion.div
                      whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                      whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                    >
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Envoi en cours...
                          </>
                        ) : (
                          <>
                            <Mail className="w-5 h-5 mr-2" />
                            Envoyer le message
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <img 
                  src="/liveshop.png" 
                  alt="LiveShop Logo" 
                  className="w-12 h-12 rounded-2xl shadow-lg"
                />
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  LiveShop Link
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                La première plateforme complète de live commerce avec interface mobile optimisée.
                Transformez vos ventes dès aujourd'hui.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors cursor-pointer">
                  <span className="text-lg">📘</span>
                </div>
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors cursor-pointer">
                  <span className="text-lg">🐦</span>
                </div>
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors cursor-pointer">
                  <span className="text-lg">📷</span>
                </div>
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors cursor-pointer">
                  <span className="text-lg">💼</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h3 className="font-bold text-lg">Produit</h3>
              <div className="space-y-3 text-slate-400">
                <div className="hover:text-white transition-colors cursor-pointer">Fonctionnalités</div>
                <div className="hover:text-white transition-colors cursor-pointer">Tarifs</div>
                <div className="hover:text-white transition-colors cursor-pointer">Démo</div>
                <div className="hover:text-white transition-colors cursor-pointer">Documentation</div>
                <div className="hover:text-white transition-colors cursor-pointer">API</div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h3 className="font-bold text-lg">Support</h3>
              <div className="space-y-3 text-slate-400">
                <div className="hover:text-white transition-colors cursor-pointer">Centre d'aide</div>
                <div className="hover:text-white transition-colors cursor-pointer">Contact</div>
                <div className="hover:text-white transition-colors cursor-pointer">Status</div>
                <div className="hover:text-white transition-colors cursor-pointer">Communauté</div>
                <div className="hover:text-white transition-colors cursor-pointer">Formation</div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h3 className="font-bold text-lg">Entreprise</h3>
              <div className="space-y-3 text-slate-400">
                <div className="hover:text-white transition-colors cursor-pointer">À propos</div>
                <div className="hover:text-white transition-colors cursor-pointer">Blog</div>
                <div className="hover:text-white transition-colors cursor-pointer">Carrières</div>
                <div className="hover:text-white transition-colors cursor-pointer">Presse</div>
                <div className="hover:text-white transition-colors cursor-pointer">Partenaires</div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-16 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-slate-400">
                &copy; 2024 LiveShop Link. Tous droits réservés.
              </p>
              <div className="flex space-x-6 text-slate-400 text-sm">
                <span className="hover:text-white transition-colors cursor-pointer">Mentions légales</span>
                <span className="hover:text-white transition-colors cursor-pointer">Politique de confidentialité</span>
                <span className="hover:text-white transition-colors cursor-pointer">CGU</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
};

export default LandingPage;