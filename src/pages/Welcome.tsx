import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, TrendingUp, ShieldCheck, ArrowRightLeft } from "lucide-react";

export const Welcome = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [isChecking, setIsChecking] = useState(true);

  // Currency ticker mock data
  const currencies = ["USD/INR", "EUR/USD", "GBP/USD", "JPY/INR"];
  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    // 1. FIRST TIME LOAD CHECK
    const hasSeenIntro = localStorage.getItem("forexsaarthi_intro_seen");

    if (hasSeenIntro) {
      // If already seen, redirect immediately without showing anything
      navigate("/home", { replace: true });
    } else {
      // If not seen, allow animation to play
      setIsChecking(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (isChecking) return;

    // Cycle currency text for visual effect
    const currencyInterval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % currencies.length);
    }, 800);

    // Progress bar logic
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          clearInterval(currencyInterval);
          
          // Set the flag in localStorage so this doesn't show again
          localStorage.setItem("forexsaarthi_intro_seen", "true");
          
          navigate("/home");
          return 100;
        }
        // Non-linear progress for realism (fast start, slow finish)
        const increment = p < 60 ? 2 : 1;
        return Math.min(p + increment, 100);
      });
    }, 30);

    return () => {
      clearInterval(interval);
      clearInterval(currencyInterval);
    };
  }, [navigate, isChecking]);

  if (isChecking) return null; // Render nothing while checking localStorage

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden font-sans text-slate-100">
      
      {/* --- BACKGROUND ELEMENTS --- */}
      
      {/* 1. Subtle World Map / Globe Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0 100 C 20 0 50 0 100 100 Z" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-blue-500/20" />
        </svg>
        {/* You can replace this with a real world map SVG image for better effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-slate-800 rounded-full opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-slate-800 rounded-full opacity-30" />
      </div>

      {/* 2. Abstract Financial Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.8)_1px,transparent_1px)] bg-[size:60px_60px] opacity-20" />

      {/* 3. Ambient Glows */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-[100px]" />


      {/* --- MAIN CONTENT CARD --- */}
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex flex-col items-center w-full p-8"
      >
        {/* Logo Section */}
        <motion.div 
          className="mb-12 relative"
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        >
           {/* Replace with your actual Image tag */}
           <img src="/ForexSaarthi Logo Transparent.png" alt="Logo" className="h-44 w-auto drop-shadow-2xl" />
           
           {/* Placeholder Logo Icon if image fails */}
           {/* <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-slate-800 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-900/20 border border-white/10">
              <Globe className="w-12 h-12 text-blue-100" />
           </div>
            */}
           {/* Decor elements around logo */}
           <div className="absolute -right-6 -top-6 animate-pulse">
              <TrendingUp className="w-6 h-6 text-green-400" />
           </div>
           <div className="absolute -left-6 -bottom-4 animate-pulse delay-700">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
           </div>
        </motion.div>

        {/* Text Header */}
        {/* <div className="text-center mb-10 space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-blue-100 to-slate-400 bg-clip-text text-transparent">
            ForexSaarthi
          </h1>
          <p className="text-slate-400 text-sm tracking-widest uppercase">
            Global Import-Export Solution
          </p>
        </div> */}

        {/* Modern Progress Bar */}
        <div className="w-full space-y-4 max-w-md">
          <div className="flex justify-between text-xs text-slate-500 font-mono">
            <span>SYSTEM INITIALIZATION</span>
            <span>{Math.round(progress)}%</span>
          </div>
          
          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-400 relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white/50 to-transparent" />
            </motion.div>
          </div>
        </div>

        {/* Dynamic Status Text */}
        <div className="mt-8 h-10 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={progress < 30 ? "init" : progress < 70 ? "market" : "ready"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center space-x-2 text-slate-400 text-sm"
              >
                {progress < 30 && (
                  <>
                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                    <span>Securing Connection...</span>
                  </>
                )}
                {progress >= 30 && progress < 70 && (
                  <>
                    <Globe className="w-4 h-4 text-cyan-500" />
                    <span>Fetching Exchange Rates...</span>
                  </>
                )}
                {progress >= 70 && (
                   <>
                    <ArrowRightLeft className="w-4 h-4 text-green-500" />
                    <span>Calibrating Hedging Tools...</span>
                   </>
                )}
              </motion.div>
            </AnimatePresence>
        </div>

        {/* Simulated Ticker (Decoration) */}
        <div className="mt-12 py-2 px-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
            <p className="text-xs font-mono text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              LIVE: <span className="text-white">{currencies[tickerIndex]}</span> 
              <span className="text-green-400 text-[10px]">+0.24%</span>
            </p>
        </div>

      </motion.div>
    </div>
  );
};