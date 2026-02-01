import { useEffect, useRef } from 'react';
import { Navbar } from '../components/ui/Navbar';
import { 
  Globe, Shield, TrendingUp, FileCheck, Users, Building2, 
  Ship, Plane, Package, DollarSign, ArrowRightLeft, 
  Clock, Lock, ArrowRight, Banknote, Receipt, CheckCircle2,
  Container, Anchor, CircleDollarSign, BadgeCheck, Zap,
  BarChart3, FileText, CreditCard, PiggyBank,Sparkles,Play
} from 'lucide-react';
import HeroSection from '../components/ui/HeroSection';

// Hook for scroll-based reveal animations
const useScrollReveal = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-reveal');
            entry.target.classList.remove('opacity-0', 'translate-y-10');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = ref.current?.querySelectorAll('.scroll-reveal');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return ref;
};

export const Home = () => {
  const scrollRef = useScrollReveal();

  return (
    <div ref={scrollRef} className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      {/* Hero Section - Full Screen with Premium Design */}
      <HeroSection/>
     

      {/* Trade Lifecycle Section - Complete Journey Visualization */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 overflow-hidden transition-colors duration-500">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-blue-200/40 dark:bg-blue-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-cyan-200/40 dark:bg-cyan-500/10 rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16 scroll-reveal opacity-0 translate-y-10 transition-all duration-700">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-full mb-6">
              <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">End-to-End Solution</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">
              Complete Trade Lifecycle
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto transition-colors">
              From order placement to settlement - manage every step of your international trade journey
            </p>
          </div>

          {/* Trade Journey Visual */}
          <div className="relative">
            {/* Connection Path - SVG Line */}
            <svg className="absolute top-1/2 left-0 right-0 w-full h-4 -translate-y-1/2 z-0 hidden lg:block" preserveAspectRatio="none">
              <defs>
                <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              <line x1="10%" y1="50%" x2="90%" y2="50%" stroke="url(#pathGradient)" strokeWidth="3" strokeDasharray="8 4" className="animate-dash" />
            </svg>

            {/* Lifecycle Steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4 relative z-10">
              {[
                {
                  step: 1,
                  icon: FileText,
                  title: 'Order Created',
                  description: 'PO/Contract initiated',
                  color: 'blue',
                  bgGradient: 'from-blue-600 to-blue-700',
                  glowColor: 'blue-500/30',
                  subIcon: Receipt,
                },
                {
                  step: 2,
                  icon: Ship,
                  title: 'Shipment Booked',
                  description: 'Cargo on the move',
                  color: 'cyan',
                  bgGradient: 'from-cyan-500 to-cyan-600',
                  glowColor: 'cyan-500/30',
                  subIcon: Container,
                },
                {
                  step: 3,
                  icon: Plane,
                  title: 'In Transit',
                  description: 'Real-time tracking',
                  color: 'purple',
                  bgGradient: 'from-purple-500 to-purple-600',
                  glowColor: 'purple-500/30',
                  subIcon: Globe,
                },
                {
                  step: 4,
                  icon: CircleDollarSign,
                  title: 'Forex Managed',
                  description: 'Rates locked & hedged',
                  color: 'emerald',
                  bgGradient: 'from-emerald-500 to-emerald-600',
                  glowColor: 'emerald-500/30',
                  subIcon: TrendingUp,
                },
                {
                  step: 5,
                  icon: BadgeCheck,
                  title: 'Settled',
                  description: 'Payment complete',
                  color: 'green',
                  bgGradient: 'from-green-500 to-green-600',
                  glowColor: 'green-500/30',
                  subIcon: CheckCircle2,
                },
              ].map((item, index) => (
                <div key={index} className="group relative scroll-reveal opacity-0 translate-y-10 transition-all duration-700" style={{ transitionDelay: `${index * 100}ms` }}>
                  <div className={`relative bg-white dark:bg-slate-800/60 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-lg dark:shadow-none hover:border-${item.color}-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-${item.glowColor}`}>
                    {/* Step Number */}
                    <div className={`absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-br ${item.bgGradient} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                      {item.step}
                    </div>
                    
                    {/* Main Icon */}
                    <div className={`relative w-20 h-20 mx-auto mb-4 bg-gradient-to-br ${item.bgGradient} rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500`}>
                      <item.icon className="w-10 h-10 text-white" />
                      {/* Floating Sub Icon */}
                      <div className={`absolute -bottom-2 -right-2 w-8 h-8 bg-gray-100 dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 rounded-lg flex items-center justify-center`}>
                        <item.subIcon className={`w-4 h-4 text-${item.color}-400`} />
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-1 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center transition-colors">
                      {item.description}
                    </p>

                    {/* Animated Pulse */}
                    <div className={`absolute inset-0 rounded-2xl bg-${item.color}-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  </div>

                  {/* Arrow Connector (hidden on last item and mobile) */}
                  {index < 4 && (
                    <div className="hidden lg:flex absolute top-1/2 -right-4 transform -translate-y-1/2 z-20">
                      <ArrowRight className="w-6 h-6 text-gray-600 animate-pulse" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Live Stats Row */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 scroll-reveal opacity-0 translate-y-10 transition-all duration-700">
            {[
              { label: 'Active Trades', value: '2,847', icon: TrendingUp, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-500/10' },
              { label: 'Countries', value: '120+', icon: Globe, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-100 dark:bg-cyan-500/10' },
              { label: 'Total Volume', value: '$2.4B', icon: DollarSign, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/10' },
              { label: 'Avg Settlement', value: '24hrs', icon: Clock, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-500/10' },
            ].map((stat, i) => (
              <div
                key={i}
                className={`${stat.bg} backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-5 hover:border-gray-300 dark:hover:border-white/20 transition-all duration-300 group`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  <span className="text-gray-600 dark:text-gray-400 text-sm">{stat.label}</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white group-hover:scale-105 transition-transform">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Currency Pairs Ticker */}
      <section className="py-4 bg-slate-900 dark:bg-slate-900 border-y border-slate-800 overflow-hidden">
        <div className="flex animate-scroll">
          {[
            { pair: 'USD/EUR', rate: '0.92', change: '+0.25%', up: true },
            { pair: 'GBP/USD', rate: '1.27', change: '-0.15%', up: false },
            { pair: 'USD/JPY', rate: '148.50', change: '+0.80%', up: true },
            { pair: 'USD/INR', rate: '83.25', change: '+0.10%', up: true },
            { pair: 'EUR/GBP', rate: '0.86', change: '-0.05%', up: false },
            { pair: 'AUD/USD', rate: '0.66', change: '+0.40%', up: true },
            { pair: 'USD/CAD', rate: '1.35', change: '+0.20%', up: true },
            { pair: 'USD/CHF', rate: '0.85', change: '-0.30%', up: false },
          ].map((currency, i) => (
            <div
              key={i}
              className="flex items-center space-x-4 px-8 py-2 border-r border-slate-800 flex-shrink-0"
            >
              <span className="text-gray-300 font-semibold">{currency.pair}</span>
              <span className="text-white font-bold">{currency.rate}</span>
              <span className={`text-sm font-medium ${currency.up ? 'text-green-400' : 'text-red-400'}`}>
                {currency.change}
              </span>
            </div>
          ))}
          {/* Duplicate for seamless loop */}
          {[
            { pair: 'USD/EUR', rate: '0.92', change: '+0.25%', up: true },
            { pair: 'GBP/USD', rate: '1.27', change: '-0.15%', up: false },
            { pair: 'USD/JPY', rate: '148.50', change: '+0.80%', up: true },
            { pair: 'USD/INR', rate: '83.25', change: '+0.10%', up: true },
            { pair: 'EUR/GBP', rate: '0.86', change: '-0.05%', up: false },
            { pair: 'AUD/USD', rate: '0.66', change: '+0.40%', up: true },
            { pair: 'USD/CAD', rate: '1.35', change: '+0.20%', up: true },
            { pair: 'USD/CHF', rate: '0.85', change: '-0.30%', up: false },
          ].map((currency, i) => (
            <div
              key={`dup-${i}`}
              className="flex items-center space-x-4 px-8 py-2 border-r border-slate-800 flex-shrink-0"
            >
              <span className="text-gray-300 font-semibold">{currency.pair}</span>
              <span className="text-white font-bold">{currency.rate}</span>
              <span className={`text-sm font-medium ${currency.up ? 'text-green-400' : 'text-red-400'}`}>
                {currency.change}
              </span>
            </div>
          ))}
        </div>
      </section>


      {/* Forex Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-slate-900 relative overflow-hidden transition-colors duration-300">
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16 scroll-reveal opacity-0 translate-y-10 transition-all duration-700">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-full mb-6">
              <CircleDollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">Forex Management</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">
              Master Your Currency Exposure
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto transition-colors">
              Real-time rates, smart hedging, and complete visibility into your forex position
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Banknote,
                title: 'Live Exchange Rates',
                description: '150+ currency pairs with real-time updates',
                gradient: 'from-blue-500 to-blue-600',
                bg: 'bg-blue-50 dark:bg-blue-900/20',
              },
              {
                icon: BarChart3,
                title: 'Hedging Tools',
                description: 'Forward contracts & options management',
                gradient: 'from-purple-500 to-purple-600',
                bg: 'bg-purple-50 dark:bg-purple-900/20',
              },
              {
                icon: PiggyBank,
                title: 'Exposure Tracking',
                description: 'Monitor open positions across trades',
                gradient: 'from-emerald-500 to-emerald-600',
                bg: 'bg-emerald-50 dark:bg-emerald-900/20',
              },
              {
                icon: CreditCard,
                title: 'Payment Processing',
                description: 'Seamless cross-border settlements',
                gradient: 'from-orange-500 to-orange-600',
                bg: 'bg-orange-50 dark:bg-orange-900/20',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={`${feature.bg} rounded-2xl p-6 border border-gray-100 dark:border-slate-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 scroll-reveal opacity-0 translate-y-10`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 transition-colors">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-950 relative overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-0 w-72 h-72 bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-0 w-96 h-96 bg-cyan-200/30 dark:bg-cyan-900/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-20 scroll-reveal opacity-0 translate-y-10 transition-all duration-700">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 transition-colors">
              Simple, powerful workflow for global trade management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative scroll-reveal opacity-0 translate-y-10 transition-all duration-700">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 dark:from-blue-800 via-cyan-300 dark:via-cyan-700 to-blue-200 dark:to-blue-800" style={{ top: '6rem' }} />

            {[
              {
                step: '01',
                title: 'Create Trade',
                description: 'Enter trade details, parties, and shipping information',
                icon: FileCheck,
              },
              {
                step: '02',
                title: 'Track Shipment',
                description: 'Monitor containers, vessels, and delivery status',
                icon: Ship,
              },
              {
                step: '03',
                title: 'Manage Forex',
                description: 'Handle currency conversions and hedging automatically',
                icon: DollarSign,
              },
              {
                step: '04',
                title: 'Settle & Report',
                description: 'Complete payments and generate compliance reports',
                icon: TrendingUp,
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:border-slate-700">
                  {/* Step Number */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg z-10">
                    {item.step}
                  </div>

                  {/* Icon */}
                  <div className="mt-8 mb-6 flex justify-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-2xl flex items-center justify-center">
                      <item.icon className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 text-center transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center leading-relaxed transition-colors">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Security Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="scroll-reveal opacity-0 translate-y-10 transition-all duration-700">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full mb-6">
                <Lock className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm text-green-700 dark:text-green-300 font-medium">Bank-Grade Security</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 transition-colors">
                Built for Importers & Exporters
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed transition-colors">
                Trusted by businesses worldwide to manage billions in forex exposure with enterprise-grade security and compliance.
              </p>

              <div className="space-y-6">
                {[
                  {
                    title: 'ISO 27001 Certified',
                    description: 'International security standards compliance',
                    icon: Shield,
                  },
                  {
                    title: 'End-to-End Encryption',
                    description: 'Military-grade data protection',
                    icon: Lock,
                  },
                  {
                    title: 'Audit Trail',
                    description: 'Complete transaction history and reporting',
                    icon: FileCheck,
                  },
                  {
                    title: 'Multi-Factor Authentication',
                    description: 'Advanced access control and security',
                    icon: Shield,
                  },
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-4 group">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 transition-colors">{item.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 transition-colors">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative scroll-reveal opacity-0 translate-y-10 transition-all duration-700" style={{ transitionDelay: '200ms' }}>
              <div className="relative bg-gradient-to-br from-slate-900 to-blue-900 rounded-3xl p-12 shadow-2xl overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:30px_30px]" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl" />

                {/* Stats Cards */}
                <div className="relative space-y-4">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 animate-fade-in">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300">Total Trade Volume</span>
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">$2.4B</div>
                    <div className="text-sm text-green-400">↑ 24% vs last quarter</div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 animate-fade-in animation-delay-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300">Active Shipments</span>
                      <Ship className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">847</div>
                    <div className="text-sm text-blue-400">Across 45 countries</div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 animate-fade-in animation-delay-400">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300">Currency Pairs</span>
                      <DollarSign className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">150+</div>
                    <div className="text-sm text-yellow-400">Real-time rates</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-cyan-50/30 dark:from-slate-900 dark:to-slate-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 scroll-reveal opacity-0 translate-y-10 transition-all duration-700">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">
              Who It's For
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 transition-colors">
              Designed for every role in international trade
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 scroll-reveal opacity-0 translate-y-10 transition-all duration-700">
            {[
              { icon: Ship, label: 'Exporters', gradient: 'from-blue-500 to-blue-600' },
              { icon: Package, label: 'Importers', gradient: 'from-cyan-500 to-cyan-600' },
              { icon: Users, label: 'Finance Teams', gradient: 'from-green-500 to-green-600' },
              { icon: Building2, label: 'CFOs', gradient: 'from-purple-500 to-purple-600' },
              { icon: FileCheck, label: 'Compliance', gradient: 'from-orange-500 to-orange-600' },
              { icon: TrendingUp, label: 'Traders', gradient: 'from-pink-500 to-pink-600' },
            ].map((role, index) => (
              <div
                key={index}
                className="group text-center bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:border-slate-700"
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${role.gradient} rounded-2xl mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <role.icon className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-900 dark:text-white font-semibold text-lg transition-colors">{role.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900" />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        </div>

        {/* Trade icons floating */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <Ship className="absolute top-20 left-20 w-12 h-12 text-blue-400 animate-float" />
          <Plane className="absolute top-40 right-32 w-10 h-10 text-cyan-400 animate-float-delayed" />
          <Package className="absolute bottom-32 left-32 w-10 h-10 text-purple-400 animate-float" />
          <Globe className="absolute bottom-20 right-20 w-12 h-12 text-green-400 animate-float-delayed" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center scroll-reveal opacity-0 translate-y-10 transition-all duration-700">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500/10 backdrop-blur-sm border border-blue-500/20 rounded-full mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-blue-300 font-medium">Join 5,000+ Businesses Worldwide</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Ready to Transform Your
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
              Global Trade Operations?
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed max-w-3xl mx-auto">
            Start managing your forex exposure, shipments, and settlements with confidence today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
            <button className="group px-10 py-5 text-lg font-bold text-slate-900 bg-white hover:bg-gray-100 rounded-xl transition-all duration-300 shadow-2xl hover:shadow-white/20 hover:scale-105 flex items-center space-x-3">
              <span>Start Free Trial</span>
              <ArrowRightLeft className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            </button>
            <button className="px-10 py-5 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/50 hover:scale-105">
              Schedule Demo
            </button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { number: '5,000+', label: 'Active Users' },
              { number: '$2.4B+', label: 'Trade Volume' },
              { number: '120+', label: 'Countries' },
              { number: '99.9%', label: 'Uptime' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <Globe className="w-8 h-8 text-blue-500" />
                <span className="text-2xl font-bold text-white">ForexSaarthi</span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                AI-powered forex and trade management platform for import-export businesses worldwide.
              </p>
              <div className="flex space-x-4">
                {['twitter', 'linkedin', 'facebook', 'instagram'].map((social) => (
                  <button
                    key={social}
                    className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <span className="sr-only">{social}</span>
                    <div className="w-5 h-5 bg-gray-400 rounded-full" />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-3">
                {['Features', 'Pricing', 'Demo', 'Updates'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-3">
                {['About', 'Blog', 'Careers', 'Contact'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">&copy; 2026 ForexSaarthi. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

