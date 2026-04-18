"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FloatingElements } from "@/components/floating-elements";
import { Github, Activity, Zap, Sparkles, BarChart3, LogOut, ArrowRight } from "lucide-react";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if session token exists in cookies or localStorage
    const hasToken = document.cookie.includes("session_token") || !!localStorage.getItem("session_token");
    setIsLoggedIn(hasToken);
  }, []);

  const loginWithGithub = () => {
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    const backendUrl = envUrl ? envUrl.replace(/\/api\/?$/, '') : "http://localhost:8000";
    window.location.href = `${backendUrl}/api/auth/login`;
  };

  const handleLogout = () => {
    // Clear frontend state
    localStorage.removeItem("session_token");
    document.cookie = "session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax";
    
    // Redirect to backend logout
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    const backendUrl = envUrl ? envUrl.replace(/\/api\/?$/, '') : "http://localhost:8000";
    window.location.href = `${backendUrl}/api/auth/logout`;
  };

  const goToDashboard = () => {
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-sans overflow-x-hidden">
      <FloatingElements />
      
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl w-full text-center space-y-12 relative z-10"
      >
        {/* Badge */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono tracking-[0.2em] uppercase text-white/60"
        >
          <Sparkles size={10} className="text-purple-400" />
          Powered by AI & GitHub GraphQL
        </motion.div>

        {/* Hero Section */}
        <div className="space-y-6">
          <motion.h1 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-7xl md:text-9xl font-black tracking-tighter bg-gradient-to-b from-white via-white to-white/20 bg-clip-text text-transparent leading-[0.9]"
          >
            INSIGHTS <br /> HUB
          </motion.h1>
          <p className="max-w-xl mx-auto text-lg md:text-xl text-gray-400 font-light leading-relaxed">
            Your year in code, transformed into a cinematic story. 
            Discover your coding rhythm, tech stack highlights, and a personalized AI roast.
          </p>
        </div>

        {/* Features Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left pt-8"
        >
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3">
            <Activity size={20} className="text-emerald-400" />
            <h3 className="font-bold">Weekly Sync</h3>
            <p className="text-sm text-gray-500 leading-snug">Real-time analysis of your last 7 days of contributions.</p>
          </div>
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3">
            <BarChart3 size={20} className="text-blue-400" />
            <h3 className="font-bold">Rich Stats</h3>
            <p className="text-sm text-gray-500 leading-snug">Deep dive into languages, social ratios, and streaks.</p>
          </div>
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3">
            <Zap size={20} className="text-amber-400" />
            <h3 className="font-bold">AI Persona</h3>
            <p className="text-sm text-gray-500 leading-snug">Get assigned a developer archetype and a witty roast.</p>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          {!isLoggedIn ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={loginWithGithub}
              className="w-full sm:w-auto bg-white text-black px-10 py-5 rounded-3xl font-black text-lg flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] transition-all uppercase tracking-tight"
            >
              <Github size={22} />
              Sign in with GitHub
            </motion.button>
          ) : (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={goToDashboard}
                className="w-full sm:w-auto bg-white text-black px-10 py-5 rounded-3xl font-black text-lg flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] transition-all uppercase tracking-tight"
              >
                <Activity size={22} />
                See your stats
                <ArrowRight size={18} className="ml-1" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.08)" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="w-full sm:w-auto bg-transparent border border-white/20 text-white px-8 py-5 rounded-3xl font-bold text-lg flex items-center justify-center gap-3 hover:border-white/40 transition-all uppercase tracking-tight"
              >
                <LogOut size={20} />
                Logout
              </motion.button>
            </>
          )}
        </motion.div>
        
        <p className="text-[10px] font-mono text-white/20 tracking-[0.4em] uppercase pt-12">
          Your data is never stored, only celebrated.
        </p>
      </motion.div>
    </div>
  );
}
