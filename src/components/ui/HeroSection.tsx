import React, { useState, useEffect } from 'react';
import { ArrowRight, Play, TrendingUp, Globe, Shield, Activity } from 'lucide-react';

export const HeroSection = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Subtle parallax effect on mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans selection:bg-teal-500/30 transition-colors duration-500">
      
      {/* --- INJECTED STYLES FOR ANIMATIONS (Copy this) --- */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 7s ease-in-out infinite 1s; }
        .animate-pulse-glow { animation: pulse-glow 4s ease-in-out infinite; }
        .animate-shimmer { animation: shimmer 2s infinite; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
      `}</style>

      {/* --- BACKGROUND LAYERS --- */}

      {/* 1. Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black_40%,transparent_100%)] pointer-events-none" />

      {/* 2. Cinematic Spotlights (Interactive) */}
      <div 
        className="absolute top-0 left-0 w-[800px] h-[800px] bg-teal-400/20 dark:bg-teal-600/10 rounded-full blur-[120px] pointer-events-none transition-all duration-1000 ease-out"
        style={{ transform: `translate(${mousePosition.x * -30}px, ${mousePosition.y * -30}px)` }}
      />
      <div 
        className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[100px] pointer-events-none transition-all duration-1000 ease-out"
        style={{ transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)` }}
      />
      
      {/* 3. Center Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-300/20 dark:bg-indigo-500/10 rounded-full blur-[100px] animate-pulse-glow" />


      {/* --- MAIN CONTENT --- */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        
        {/* Badge */}
        <div className="opacity-0 animate-fade-in-up flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 backdrop-blur-md shadow-lg mb-8 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors cursor-default">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-300 tracking-wide uppercase text-[10px]">v1.0 Now Live</span>
          <span className="w-px h-3 bg-gray-300 dark:bg-white/20 mx-1"></span>
          <span className="text-sm text-gray-600 dark:text-slate-300">Intelligent Forex Management</span>
        </div>

        {/* Headline */}
        <h1 className="opacity-0 animate-fade-in-up delay-100 max-w-4xl text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-gray-900 dark:text-white mb-6 leading-[1.1]">
          Trade Globally. <br />
          <span className="bg-gradient-to-r from-teal-500 via-blue-500 to-emerald-500 dark:from-teal-300 dark:via-blue-400 dark:to-emerald-300 bg-clip-text text-transparent">
            Settle Confidently.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="opacity-0 animate-fade-in-up delay-200 max-w-2xl text-lg md:text-xl text-gray-600 dark:text-slate-400 mb-10 font-light leading-relaxed">
          The all-in-one platform designed for modern import-export businesses. 
          Automate hedging, track global rates, and manage risk with <span className="text-gray-900 dark:text-white font-medium">enterprise-grade precision</span>.
        </p>

        {/* Buttons */}
        <div className="opacity-0 animate-fade-in-up delay-300 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          
          {/* Primary Button */}
          <button className="group relative w-full sm:w-auto overflow-hidden rounded-full bg-gray-900 dark:bg-white px-8 py-4 text-base font-bold text-white dark:text-slate-900 shadow-[0_0_40px_-10px_rgba(0,0,0,0.3)] dark:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_60px_-15px_rgba(0,0,0,0.5)] dark:hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)]">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-400/20 to-blue-400/20 opacity-0 transition-opacity group-hover:opacity-100" />
            <span className="relative flex items-center justify-center gap-2">
              Start Free Trial
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </button>

          {/* Secondary Button */}
          <button className="group relative w-full sm:w-auto rounded-full border border-gray-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/50 px-8 py-4 text-base font-semibold text-gray-900 dark:text-white backdrop-blur-sm transition-all hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-gray-400 dark:hover:border-slate-600">
            <span className="flex items-center justify-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 dark:bg-white/10 group-hover:bg-gray-300 dark:group-hover:bg-white/20 transition-colors">
                <Play className="h-3 w-3 fill-gray-700 dark:fill-white text-gray-700 dark:text-white" />
              </span>
              Watch Demo
            </span>
          </button>
        </div>

        {/* Stats Glass Strip */}
        {/* <div className="opacity-0 animate-fade-in-up delay-300 mt-20 w-full max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-xl shadow-2xl shadow-black/50">
            {[
              { label: "Volume Processed", value: "$50M+", icon: TrendingUp },
              { label: "Global Currencies", value: "15+", icon: Globe },
              { label: "Risk Mitigation", value: "99.9%", icon: Shield },
              { label: "Real-time Updates", value: "<50ms", icon: Activity },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/0 hover:bg-white/5 transition-colors group">
                <stat.icon className="w-5 h-5 text-teal-400 mb-2 opacity-70 group-hover:opacity-100 transition-opacity" />
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div> */}

      </div>

      {/* --- FLOATING 3D ELEMENTS (Decorative) --- */}
      <div className="absolute top-[20%] left-[10%] opacity-30 dark:opacity-20 animate-float-slow pointer-events-none">
         <span className="text-6xl font-serif text-teal-600 dark:text-teal-200">₹</span>
      </div>
      <div className="absolute top-[15%] right-[10%] opacity-30 dark:opacity-20 animate-float-delayed pointer-events-none">
         <span className="text-7xl font-serif text-blue-600 dark:text-blue-200">$</span>
      </div>
      <div className="absolute bottom-[30%] left-[5%] opacity-20 dark:opacity-10 animate-float-delayed pointer-events-none">
         <span className="text-5xl font-serif text-emerald-600 dark:text-emerald-200">£</span>
      </div>

    </section>
  );
};

export default HeroSection;