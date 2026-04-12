"use client";

import { memo, useMemo } from "react";
import { motion } from "framer-motion";

type ShapeKind = "circle" | "square" | "triangle";

type FloatingConfig = {
  id: number;
  shape: ShapeKind;
  size: number;
  left: number;
  opacity: number;
  delay: number;
  duration: number;
  drift: number;
  rotate: number;
};

const BASE_ELEMENTS: FloatingConfig[] = [
  { id: 1, shape: "circle", size: 70, left: 6, opacity: 0.06, delay: 0, duration: 28, drift: -22, rotate: 140 },
  { id: 2, shape: "square", size: 58, left: 18, opacity: 0.08, delay: 3, duration: 24, drift: 16, rotate: 120 },
  { id: 3, shape: "triangle", size: 66, left: 32, opacity: 0.07, delay: 7, duration: 30, drift: -18, rotate: 160 },
  { id: 4, shape: "circle", size: 92, left: 46, opacity: 0.05, delay: 1.5, duration: 34, drift: 20, rotate: 180 },
  { id: 5, shape: "square", size: 74, left: 60, opacity: 0.09, delay: 5, duration: 26, drift: -14, rotate: 130 },
  { id: 6, shape: "triangle", size: 60, left: 71, opacity: 0.06, delay: 2.2, duration: 29, drift: 12, rotate: 150 },
  { id: 7, shape: "circle", size: 84, left: 82, opacity: 0.07, delay: 6.5, duration: 31, drift: -20, rotate: 170 },
  { id: 8, shape: "triangle", size: 56, left: 92, opacity: 0.08, delay: 4.2, duration: 27, drift: 14, rotate: 110 },
];

function FloatingShape({ shape }: { shape: ShapeKind }) {
  if (shape === "circle") {
    return <circle cx="50" cy="50" r="28" fill="currentColor" />;
  }

  if (shape === "square") {
    return <rect x="22" y="22" width="56" height="56" rx="12" fill="currentColor" />;
  }

  return <polygon points="50,16 82,84 18,84" fill="currentColor" />;
}

export const FloatingElements = memo(function FloatingElements() {
  const elements = useMemo(() => BASE_ELEMENTS, []);

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 5,
      }}
    >
      {elements.map((item) => (
        <motion.div
          key={item.id}
          style={{
            position: "absolute",
            left: `${item.left}%`,
            top: "110%",
            opacity: item.opacity,
            color: "rgba(255,255,255,0.9)",
            filter: "blur(0.7px) drop-shadow(0 0 10px rgba(255,255,255,0.2))",
            willChange: "transform",
          }}
          animate={{
            y: ["0vh", "-130vh"],
            x: [0, item.drift, -item.drift * 0.5, 0],
            rotate: [0, item.rotate],
          }}
          transition={{
            y: { duration: item.duration, repeat: Infinity, ease: "linear", delay: item.delay },
            x: { duration: item.duration * 0.6, repeat: Infinity, ease: "easeInOut", delay: item.delay },
            rotate: { duration: item.duration * 1.3, repeat: Infinity, ease: "linear", delay: item.delay },
          }}
        >
          <svg width={item.size} height={item.size} viewBox="0 0 100 100" role="presentation">
            <FloatingShape shape={item.shape} />
          </svg>
        </motion.div>
      ))}
    </div>
  );
});
