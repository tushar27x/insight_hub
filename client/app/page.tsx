"use client";

import { motion } from "framer-motion";

export default function Home() {
  const loginWithGithub = () => {
    // Dynamically use the production or local backend URL
    const backendUrl = process.env.NEXT_PUBLIC_API_URL 
      ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') 
      : "http://localhost:8000";
      
    window.location.href = `${backendUrl}/api/auth/login`;
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl w-full text-center space-y-12"
      >
        <div className="space-y-4">
          <motion.h1 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-7xl md:text-9xl font-black tracking-tighter bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent"
          >
            INSIGHTS <br /> HUB
          </motion.h1>
          <p className="text-xl md:text-2xl text-gray-400 font-light">
            Your year in code. Reimagined.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={loginWithGithub}
          className="bg-white text-black px-8 py-4 rounded-full font-bold text-lg flex items-center gap-3 mx-auto shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.5)] transition-all"
        >
          Sign in with GitHub
        </motion.button>
      </motion.div>
    </div>
  );
}
