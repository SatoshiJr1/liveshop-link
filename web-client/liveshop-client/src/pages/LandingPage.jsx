import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
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
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 1000], [0, 200]);
  const starsY = useTransform(scrollY, [0, 1000], [0, -150]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  // Structured Data
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
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = () => {
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

    try {
      if (!EMAILJS_CONFIG.SERVICE_ID || !EMAILJS_CONFIG.TEMPLATE_ID || !EMAILJS_CONFIG.PUBLIC_KEY) {
        throw new Error('Configuration EmailJS incomplète');
      }
      await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID, 
        EMAILJS_CONFIG.TEMPLATE_ID, 
        data, 
        EMAILJS_CONFIG.PUBLIC_KEY
      );
      setSubmitStatus('success');
      e.target.reset();
    } catch (error) {
      console.error('Error:', error);
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
    setIsMobileMenuOpen(false);
  };

  const menuItems = [
    { label: 'Fonctionnalités', id: '#features' },
    { label: 'Tarifs', id: '#pricing' },
    { label: 'Témoignages', id: '#testimonials' },
    { label: 'Comment ça marche', id: '#how-it-works' },
    { label: 'Contact', id: '#contact' }
  ];

  // Data Arrays
  const features = [
    { icon: BarChart3, title: "Dashboard Temps Réel", description: "Surveillez vos ventes en direct avec des statistiques en temps réel", color: "text-blue-400" },
    { icon: Package, title: "Gestion Produits", description: "Ajoutez, modifiez et gérez vos produits facilement depuis votre mobile", color: "text-emerald-400" },
    { icon: Bell, title: "Notifications Instantanées", description: "Recevez vos commandes en temps réel avec des notifications push", color: "text-rose-400" },
    { icon: Smartphone, title: "Mobile-First", description: "Interface optimisée pour tous les appareils, priorité mobile", color: "text-purple-400" },
    { icon: Video, title: "Ventes Live", description: "Engagez vos clients avec des ventes en direct interactives", color: "text-pink-400" },
    { icon: TrendingUp, title: "Analytics Avancées", description: "Comprenez vos performances avec des rapports détaillés", color: "text-cyan-400" }
  ];

  const howItWorks = [
    { step: "01", title: "Créez votre boutique", description: "Inscrivez-vous en quelques secondes et personnalisez votre boutique mobile", icon: Rocket, color: "bg-blue-500" },
    { step: "02", title: "Ajoutez vos produits", description: "Importez vos produits avec photos et descriptions en quelques clics", icon: Package, color: "bg-emerald-500" },
    { step: "03", title: "Commencez à vendre", description: "Lancez vos ventes en direct et recevez vos commandes en temps réel", icon: TrendingUp, color: "bg-purple-500" }
  ];

  const testimonials = [
    { name: "Fatou Diop", role: "Vendeuse de mode", content: "LiveShop Link a transformé mon business. Mes ventes ont augmenté de 60% en 3 mois !", avatar: "👩🏾‍💼", rating: 5 },
    { name: "Moussa Diallo", role: "Vendeur d'électronique", content: "L'interface mobile est parfaite. Je peux gérer mes ventes n'importe où, n'importe quand.", avatar: "👨🏾‍💻", rating: 5 },
    { name: "Aminata Ba", role: "Vendeuse de cosmétiques", content: "Les notifications en temps réel m'ont fait gagner beaucoup de temps. Je recommande !", avatar: "👩🏾‍🎨", rating: 5 }
  ];

  const pricingPlans = [
    { name: "Découverte", price: "5.000", period: "FCFA", description: "Pour tester la puissance de l'IA", features: ["100 Crédits", "Validité illimitée", "Accès à toutes les fonctionnalités", "Support standard"], popular: false },
    { name: "Vendeur", price: "20.000", period: "FCFA", description: "Pour les vendeurs réguliers", features: ["500 Crédits", "Bonus +50 Crédits offerts", "Priorité de traitement", "Support prioritaire"], popular: true },
    { name: "Business", price: "50.000", period: "FCFA", description: "Pour les gros volumes", features: ["1500 Crédits", "Bonus +200 Crédits offerts", "Account Manager dédié", "API Access"], popular: false }
  ];

  return (
    <>
      <SEO 
        title="LiveShop Link - Le Futur du Commerce en Direct"
        description="L'app qui vend pour vous pendant que vous animez vos lives. Augmentez vos revenus de 40% avec notre écosystème communautaire."
        keywords="commerce en direct, live shopping, vente en ligne, mobile, Sénégal, Afrique, e-commerce, vente directe, live commerce"
        image="/og-image.jpg"
        url="https://livelink.store"
        structuredData={structuredData}
      />
      
      <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-purple-500/30 font-sans overflow-x-hidden">
        {/* Ambient Background Effects */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-slate-950">
          {/* Main Top Gradient - Fixed but flows with scroll opacity/scale */}
          <motion.div 
            style={{ 
              opacity: useTransform(scrollY, [0, 800], [1, 0]),
              y: useTransform(scrollY, [0, 800], [0, -400])
            }}
            className="absolute top-0 left-0 right-0 h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/40 via-slate-950 to-slate-950"
          />
          
          {/* Flowing Gradient that moves with scroll */}
          <motion.div 
            style={{ y: backgroundY }}
            className="absolute inset-0"
          >
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-600/30 rounded-full blur-[120px] mix-blend-screen" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/30 rounded-full blur-[120px] mix-blend-screen" />
          </motion.div>

          {/* Stars with Parallax */}
          <motion.div 
            style={{ 
              y: starsY,
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='400' viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.6'%3E%3Ccircle cx='200' cy='200' r='2'/%3E%3Ccircle cx='50' cy='100' r='1'/%3E%3Ccircle cx='350' cy='300' r='1.5'/%3E%3Ccircle cx='150' cy='350' r='1'/%3E%3Ccircle cx='300' cy='50' r='1.5'/%3E%3Ccircle cx='100' cy='250' r='1.2'/%3E%3Ccircle cx='350' cy='150' r='1.2'/%3E%3Ccircle cx='50' cy='350' r='1'/%3E%3Ccircle cx='250' cy='50' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} 
            className="absolute inset-0 opacity-90"
          />
        </div>

        {/* Navigation */}
        <motion.nav 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            isScrolled ? 'bg-slate-950/95 backdrop-blur-xl border-b border-white/10 shadow-lg' : 'bg-transparent'
          }`}
        >
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
                <div className="relative w-10 h-10">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur opacity-50" />
                  <img src="/liveshop.png" alt="Logo" className="relative w-full h-full object-contain rounded-xl" />
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                  LiveShop Link
                </span>
              </div>

              {/* Desktop Menu */}
              <div className="hidden lg:flex items-center gap-8">
                {menuItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => scrollToSection(item.id)}
                    className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* CTA & Mobile Toggle */}
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-4">
                  <button onClick={handleDemo} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                    Démo
                  </button>
                  <Button 
                    onClick={handleGetStarted}
                    className="bg-white text-black hover:bg-slate-200 rounded-full px-6 font-semibold transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                  >
                    Commencer
                  </Button>
                </div>
                <button 
                  className="lg:hidden text-white p-2"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          <motion.div 
            initial={false}
            animate={{ height: isMobileMenuOpen ? 'auto' : 0, opacity: isMobileMenuOpen ? 1 : 0 }}
            className="lg:hidden overflow-hidden bg-slate-950/95 backdrop-blur-xl border-b border-white/10"
          >
            <div className="px-6 py-8 space-y-6">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => scrollToSection(item.id)}
                  className="block w-full text-left text-lg font-medium text-slate-300 hover:text-white"
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-6 border-t border-white/10 space-y-4">
                <Button onClick={handleDemo} variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                  Voir la démo
                </Button>
                <Button onClick={handleGetStarted} className="w-full bg-white text-black hover:bg-slate-200">
                  Commencer
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.nav>

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-8 text-center lg:text-left relative z-10"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-xs font-medium text-slate-300">Nouvelle version disponible</span>
                </div>
                
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight tracking-tight">
                  Le Futur du <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 animate-gradient-x">
                    Live Commerce
                  </span>
                </h1>
                
                <p className="text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Transformez vos lives en machine à vendre. Une suite d'outils IA puissants pour maximiser vos revenus et automatiser votre gestion.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                  <Button 
                    onClick={handleGetStarted}
                    className="h-14 px-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold text-lg shadow-[0_0_30px_rgba(124,58,237,0.3)] transition-all hover:scale-105"
                  >
                    Créer ma boutique
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button 
                    onClick={handleDemo}
                    variant="outline"
                    className="h-14 px-8 rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white backdrop-blur-sm transition-all"
                  >
                    <Play className="mr-2 w-5 h-5" />
                    Voir la démo
                  </Button>
                </div>

                <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 border-t border-white/5">
                  <div>
                    <div className="text-2xl font-bold text-white">10M+</div>
                    <div className="text-sm text-slate-500">Utilisateurs</div>
                  </div>
                  <div className="w-px h-10 bg-white/10" />
                  <div>
                    <div className="text-2xl font-bold text-white">4.9/5</div>
                    <div className="text-sm text-slate-500">Note moyenne</div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative z-10"
              >
                <div className="relative mx-auto w-[280px] sm:w-[320px]">
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-[3rem] blur-2xl opacity-30 animate-pulse" />
                  <img 
                    src="/imgHero.png" 
                    alt="App Interface" 
                    className="relative z-10 w-full h-auto drop-shadow-2xl transform hover:rotate-[-2deg] transition-transform duration-500"
                  />
                  
                  {/* Floating Elements */}
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute -right-12 top-20 p-4 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl z-20 hidden sm:block"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">Revenus</div>
                        <div className="text-lg font-bold text-white">+24.5%</div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute -left-12 bottom-40 p-4 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl z-20 hidden sm:block"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Bell className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">Nouvelle commande</div>
                        <div className="text-sm font-bold text-white">À l'instant</div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Problem/Solution Section */}
        <section className="py-32 relative border-y border-white/5 bg-slate-900/30">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                <Badge className="bg-red-500/10 text-red-400 border-red-500/20">
                  Le Problème
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-white">
                  La gestion des lives est un <span className="text-red-400">cauchemar</span>
                </h2>
                <div className="space-y-6">
                  {[
                    { title: "Commandes perdues", desc: "Les commentaires défilent trop vite, impossible de tout noter." },
                    { title: "Paiements incertains", desc: "Courir après les clients pour le paiement après le live." },
                    { title: "Stock non synchronisé", desc: "Vendre le même article à plusieurs personnes par erreur." }
                  ].map((item, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex gap-4 p-4 rounded-xl bg-red-500/5 border border-red-500/10"
                    >
                      <div className="shrink-0 w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
                        <XCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{item.title}</h3>
                        <p className="text-slate-400 text-sm">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                  La Solution
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-white">
                  L'automatisation <span className="text-green-400">intelligente</span>
                </h2>
                <div className="space-y-6">
                  {[
                    { title: "Capture automatique", desc: "L'IA détecte les commandes dans les commentaires instantanément." },
                    { title: "Paiement sécurisé", desc: "Lien de paiement envoyé automatiquement en DM." },
                    { title: "Gestion de stock", desc: "Mise à jour du stock en temps réel à chaque vente." }
                  ].map((item, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex gap-4 p-4 rounded-xl bg-green-500/5 border border-green-500/10"
                    >
                      <div className="shrink-0 w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{item.title}</h3>
                        <p className="text-slate-400 text-sm">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <section className="py-32 relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 mb-6">
                Démonstration
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">
                Voyez la magie en action
              </h2>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900 aspect-video group cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10" />
              
              {/* Placeholder for Video */}
              <div className="absolute inset-0 flex items-center justify-center bg-slate-800/50 group-hover:bg-slate-800/40 transition-all">
                <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 text-white fill-white ml-1" />
                </div>
              </div>
              
              {/* Fake UI Elements to look like a video player */}
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-800 animate-pulse" />
                  <div className="space-y-2">
                    <div className="w-32 h-3 bg-slate-800 rounded animate-pulse" />
                    <div className="w-20 h-2 bg-slate-800 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-32 relative">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 mb-4 hover:bg-purple-500/20">
                Fonctionnalités
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Tout ce dont vous avez besoin
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Une suite complète d'outils conçus pour propulser votre commerce vers de nouveaux sommets.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 group h-full">
                    <CardContent className="p-8">
                      <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ${feature.color}`}>
                        <feature.icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                      <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-32 bg-slate-900/50 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 mb-4">
                Processus
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Simple comme bonjour
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-12">
              {howItWorks.map((step, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.2 }}
                  className="relative text-center group"
                >
                  {idx < howItWorks.length - 1 && (
                    <div className="hidden md:block absolute top-12 left-1/2 w-full h-px bg-gradient-to-r from-white/20 to-transparent" />
                  )}
                  <div className={`w-24 h-24 mx-auto rounded-3xl ${step.color} flex items-center justify-center mb-8 shadow-lg transform group-hover:rotate-6 transition-transform duration-300`}>
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-6xl font-bold text-white/5 absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4 relative z-10">{step.title}</h3>
                  <p className="text-slate-400 relative z-10">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-32 relative">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <Badge className="bg-green-500/10 text-green-400 border-green-500/20 mb-4">
                Tarifs
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Payez à l'utilisation
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Pas d'abonnement mensuel. Achetez des crédits et utilisez-les quand vous voulez.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {pricingPlans.map((plan, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card 
                    className={`bg-white/5 border-white/10 relative overflow-hidden transition-all duration-300 hover:-translate-y-2 h-full ${
                      plan.popular ? 'ring-2 ring-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.15)]' : ''
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                        POPULAIRE
                      </div>
                    )}
                    <CardContent className="p-8 flex flex-col h-full">
                      <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                      <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-4xl font-bold text-white">{plan.price}</span>
                        <span className="text-slate-400">{plan.period}</span>
                      </div>
                      <p className="text-slate-400 mb-8 text-sm">{plan.description}</p>
                      
                      <ul className="space-y-4 mb-8 flex-grow">
                        {plan.features.map((feat, i) => (
                          <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                            {feat}
                          </li>
                        ))}
                      </ul>

                      <Button 
                        onClick={handleGetStarted}
                        className={`w-full rounded-xl py-6 ${
                          plan.popular 
                            ? 'bg-purple-600 hover:bg-purple-500 text-white' 
                            : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                      >
                        Choisir ce plan
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-32 bg-slate-900/30 relative z-10">
          <div className="max-w-7xl mx-auto px-6">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-bold text-white text-center mb-16"
            >
              Ils nous font confiance
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((t, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="bg-white/5 border-white/10 p-6 h-full hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="text-4xl">{t.avatar}</div>
                      <div>
                        <div className="font-bold text-white">{t.name}</div>
                        <div className="text-sm text-slate-400">{t.role}</div>
                      </div>
                    </div>
                    <div className="flex gap-1 mb-4">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-slate-300 italic">"{t.content}"</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="py-32 relative overflow-hidden">
          {/* Background elements for contact */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] -z-10" />
          
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left Column: Info */}
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                  Contact
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold text-white">
                  Parlons de votre <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    Projet
                  </span>
                </h2>
                <p className="text-slate-400 text-lg leading-relaxed">
                  Vous avez des questions sur LiveShop Link ? Notre équipe est là pour vous aider à démarrer votre aventure dans le live commerce.
                </p>
                
                <div className="space-y-6 pt-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-purple-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-400">Email</div>
                      <div className="text-white font-medium">contact@livelink.store</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-blue-400">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-400">Support</div>
                      <div className="text-white font-medium">Disponible 7j/7</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right Column: Form */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-slate-900/50 backdrop-blur-xl border-white/10 p-2 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardContent className="p-8 relative z-10">
                    <form onSubmit={handleContactSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-300">Nom</label>
                          <input name="name" required className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder:text-slate-600" placeholder="Votre nom" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-300">Email</label>
                          <input name="email" type="email" required className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder:text-slate-600" placeholder="votre@email.com" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Message</label>
                        <textarea name="message" required rows="4" className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder:text-slate-600" placeholder="Comment pouvons-nous vous aider ?" />
                      </div>

                      {submitStatus === 'success' && (
                        <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-center">
                          Message envoyé avec succès !
                        </div>
                      )}
                      {submitStatus === 'error' && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-center">
                          Erreur lors de l'envoi.
                        </div>
                      )}

                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white py-6 text-lg font-semibold rounded-xl shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02]"
                      >
                        {isSubmitting ? 'Envoi...' : 'Envoyer le message'}
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-black pt-20 pb-10 relative z-10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-12 mb-16">
              <div className="col-span-2">
                <div className="flex items-center gap-3 mb-6">
                  <img src="/liveshop.png" alt="Logo" className="w-10 h-10 rounded-lg" />
                  <span className="text-xl font-bold text-white">LiveShop Link</span>
                </div>
                <p className="text-slate-400 max-w-sm">
                  La plateforme de référence pour le commerce en direct en Afrique.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-white mb-6">Produit</h4>
                <ul className="space-y-4 text-slate-400">
                  <li><a href="#features" className="hover:text-purple-400 transition-colors">Fonctionnalités</a></li>
                  <li><a href="#pricing" className="hover:text-purple-400 transition-colors">Tarifs</a></li>
                  <li><a href="#" className="hover:text-purple-400 transition-colors">API</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-white mb-6">Légal</h4>
                <ul className="space-y-4 text-slate-400">
                  <li><a href="#" className="hover:text-purple-400 transition-colors">Confidentialité</a></li>
                  <li><a href="#" className="hover:text-purple-400 transition-colors">CGU</a></li>
                  <li><a href="#" className="hover:text-purple-400 transition-colors">Mentions légales</a></li>
                </ul>
              </div>
            </div>
            <div className="text-center text-slate-500 pt-8 border-t border-white/5">
              © 2024 LiveShop Link. Tous droits réservés.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;