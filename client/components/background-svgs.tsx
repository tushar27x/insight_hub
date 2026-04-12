"use client";

import { motion, Variants } from "framer-motion";

const shapes = [
  // Circle/Blob 1
  {
    d: "M25,50 a25,25 0 1,1 50,0 a25,25 0 1,1 -50,0",
    color: "fill-purple-500/10",
    left: "10%",
    top: "15%",
    size: 200,
  },
  // Blob 2
  {
    d: "M20,40 Q40,10 70,30 T90,70 Q70,95 40,80 T20,40",
    color: "fill-pink-500/10",
    left: "75%",
    top: "20%",
    size: 300,
  },
  // Blob 3
  {
    d: "M30,20 Q60,0 80,30 T70,80 Q40,100 20,70 T30,20",
    color: "fill-cyan-500/10",
    left: "15%",
    top: "65%",
    size: 250,
  },
  // Polygon/Diamond
  {
    d: "M50,10 L90,50 L50,90 L10,50 Z",
    color: "fill-indigo-500/10",
    left: "80%",
    top: "70%",
    size: 150,
  },
];

const shapeVariants: Variants = {
  float: (i: number) => ({
    y: [0, -40, 40, 0],
    x: [0, 20, -20, 0],
    rotate: [0, 90, 180, 270, 360],
    scale: [1, 1.1, 0.9, 1],
    transition: {
      duration: 15 + i * 5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  }),
};

export function BackgroundSVGs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-20">
      <svg width="100%" height="100%" className="opacity-40">
        {shapes.map((shape, i) => (
          <motion.g
            key={i}
            custom={i}
            variants={shapeVariants}
            animate="float"
            style={{
              transformOrigin: "center",
              x: shape.left,
              y: shape.top,
            }}
          >
            <svg
              viewBox="0 0 100 100"
              width={shape.size}
              height={shape.size}
              x="-50"
              y="-50"
            >
              <path d={shape.d} className={shape.color} />
            </svg>
          </motion.g>
        ))}
      </svg>
    </div>
  );
}
