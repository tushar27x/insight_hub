"use client";

import { motion, Variants } from "framer-motion";
import { FloatingElements } from "@/components/floating-elements";
import { BackgroundSVGs } from "@/components/background-svgs";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

const titleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8, rotateX: -10 },
  visible: {
    opacity: 1,
    scale: 1,
    rotateX: 0,
    transition: {
      duration: 1,
      ease: "easeOut",
    },
  },
};

const buttonVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay: 0.6,
    },
  },
  hover: {
    scale: 1.08,
    boxShadow: "0 0 60px rgba(168, 85, 247, 0.8)",
    transition: {
      duration: 0.3,
    },
  },
  tap: { scale: 0.92 },
};

export default function Home() {
  const loginWithGithub = () => {
    window.location.href = 'http://localhost:8000/api/auth/login';
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Textured background */}
      <div className="fixed inset-0 opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="noise" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <rect width="100" height="100" fill="white" />
              <circle cx="20" cy="20" r="1" fill="black" opacity="0.3" />
              <circle cx="60" cy="40" r="1.5" fill="black" opacity="0.2" />
              <circle cx="40" cy="80" r="1" fill="black" opacity="0.25" />
              <circle cx="80" cy="60" r="1.2" fill="black" opacity="0.2" />
              <line x1="0" y1="0" x2="100" y2="100" stroke="black" strokeWidth="0.5" opacity="0.1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#noise)" />
        </svg>
      </div>

      {/* Gradient overlays */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animation-pulse" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl" />
      </div>

      {/* Floating elements */}
      <BackgroundSVGs />
      <FloatingElements />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6 font-sans">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl w-full text-center space-y-12"
        >
          {/* Title section */}
          <motion.div variants={itemVariants} className="space-y-6">
            <motion.h1
              variants={titleVariants}
              className="text-7xl md:text-9xl font-black tracking-tighter bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent drop-shadow-2xl"
            >
              INSIGHTS <br className="hidden md:block" /> HUB
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl md:text-2xl text-gray-300 font-light tracking-wide"
            >
              Your year in code. Reimagined.
            </motion.p>
          </motion.div>

          {/* CTA Button */}
          <motion.button
            variants={buttonVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            whileTap="tap"
            onClick={loginWithGithub}
            className="group relative px-8 py-4 rounded-full font-bold text-lg flex items-center gap-3 mx-auto bg-white text-black transition-all duration-300 overflow-hidden"
          >
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ zIndex: -1 }}
            />
            <svg
              className="w-5 h-5 transition-transform duration-300 group-hover:scale-110"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.603-3.369-1.343-3.369-1.343-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.544 2.914 1.19.092-.926.35-1.556.636-1.913-2.22-.253-4.555-1.112-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0110 4.817c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.137 18.191 20 14.441 20 10.017 20 4.484 15.522 0 10 0z"
              />
            </svg>
            Sign in with GitHub
          </motion.button>

        </motion.div>
      </div>
    </div>
  );
}
