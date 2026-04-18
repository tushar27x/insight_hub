"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, GitPullRequest, Star, Trophy,
  MessageSquare, Github, Zap, Users, Code2, LogOut, ChevronLeft, ChevronRight
} from "lucide-react";

// shadcn components
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FloatingElements } from "@/components/floating-elements";

import api from "../lib/api";

/* ─── types ─── */
interface UserInsights {
  user_name: string;
  archetype: string;
  stats: {
    total_commits: number;
    total_prs: number;
    total_issues: number;
    top_languages: string[];
    total_stars: number;
    active_days_per_year: number;
    social_ratio: string;
    last_week_heatmap: number[];
  };
  display_json?: string;
  weekly_review?: string;
  updated_at: string;
}

const SLIDE_DURATION = 7000; // 7 seconds per slide

/* ─── counter utility ─── */
function Counter({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      setN(Math.round((1 - Math.pow(1 - p, 4)) * value));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value, duration]);
  return <span>{n.toLocaleString()}</span>;
}

/* ─── loading ─── */
function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-[#080808] flex items-center justify-center z-50">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white"
      />
    </div>
  );
}

/* ─── SLIDE 0: WEEKLY SUMMARY ─── */
function SlideWeeklySummary({ data }: { data: UserInsights }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center h-full text-center space-y-10 p-8"
    >
      <div className="space-y-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full inline-block"
        >
          <span className="text-[10px] font-mono text-white/60 tracking-[0.3em] uppercase">Weekly Sync</span>
        </motion.div>
        <h2 className="text-4xl font-black text-white leading-tight uppercase tracking-tighter">Your Last 7 Days <br /> In Code</h2>
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="relative bg-white/5 border border-white/10 p-8 rounded-[32px] backdrop-blur-sm"
      >
        <p className="text-lg md:text-xl text-white/90 leading-relaxed font-light italic">
          {data.weekly_review ?? "The data is in. Let's see how your week went..."}
        </p>
      </motion.div>

      <p className="text-white/30 font-mono text-[10px] tracking-widest uppercase">Generated using your latest GitHub activity.</p>
    </motion.div>
  );
}

/* ─── SLIDE 1: INTRO ─── */
function SlideIntro({ data }: { data: UserInsights }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center h-full text-center space-y-8 p-8"
    >
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
        <p className="text-white/40 font-mono text-sm tracking-widest uppercase mb-2">Welcome back</p>
        <h2 className="text-5xl font-black tracking-tighter text-white uppercase">{data.user_name}</h2>
      </motion.div>
      <div className="space-y-12 w-full pt-12">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
          <p className="text-6xl font-black text-white"><Counter value={data.stats.total_commits} /></p>
          <p className="text-white/40 font-mono text-xs tracking-widest uppercase">Total Commits</p>
        </motion.div>
        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.8 }}>
          <p className="text-6xl font-black text-white"><Counter value={data.stats.total_prs} /></p>
          <p className="text-white/40 font-mono text-xs tracking-widest uppercase">Pull Requests</p>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ─── SLIDE 2: CONSISTENCY ─── */
function SlideConsistency({ data }: { data: UserInsights }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center h-full text-center space-y-8 p-8 bg-gradient-to-b from-blue-900/20 to-transparent"
    >
      <Trophy size={80} className="text-yellow-400 mb-4" />
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }}>
        <h2 className="text-7xl font-black text-white leading-none">{data.stats.active_days_per_year}</h2>
        <p className="text-xl text-white/80 font-light mt-4 px-6">Days of active contribution this year.</p>
      </motion.div>
      <p className="text-white/30 font-mono text-[10px] tracking-widest uppercase pt-8">Consistency is your superpower.</p>
    </motion.div>
  );
}

/* ─── SLIDE 3: HEATMAP (LAST WEEK) ─── */
function SlideHeatmap({ data }: { data: UserInsights }) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const maxContributions = Math.max(...data.stats.last_week_heatmap, 1);

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center h-full text-center space-y-12 p-8"
    >
      <Activity size={50} className="text-emerald-400" />
      <div className="space-y-4">
        <h3 className="text-white/40 font-mono text-xs tracking-widest uppercase">Last 7 Days</h3>
        <p className="text-4xl font-black text-white leading-tight uppercase">Recent Activity</p>
      </div>

      <div className="flex items-end justify-center gap-3 h-48 w-full px-4">
        {data.stats.last_week_heatmap.map((count, i) => (
          <div key={i} className="flex flex-col items-center gap-3 flex-1">
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: `${(count / maxContributions) * 100}%` }}
              transition={{ delay: 0.2 + i * 0.1, type: "spring", stiffness: 100 }}
              className="w-full bg-emerald-500 rounded-t-lg min-h-[4px]"
              style={{ opacity: count === 0 ? 0.1 : 0.3 + (count / maxContributions) * 0.7 }}
            />
            <span className="text-[10px] font-mono text-white/40 uppercase rotate-45 mt-2">{days[i]}</span>
          </div>
        ))}
      </div>

      <p className="text-white/30 font-mono text-[10px] tracking-widest uppercase">Your rhythm in the last week.</p>
    </motion.div>
  );
}

/* ─── SLIDE 4: STACK ─── */
function SlideStack({ data }: { data: UserInsights }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center h-full space-y-6 p-8"
    >
      <Code2 size={40} className="text-purple-400 mb-4" />
      <h3 className="text-white/40 font-mono text-xs tracking-widest uppercase">Your Weapon of Choice</h3>
      <div className="w-full space-y-4">
        {data.stats.top_languages.slice(0, 5).map((lang, i) => (
          <motion.div 
            key={lang}
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="flex items-center justify-between bg-white/5 border border-white/10 p-5 rounded-2xl"
          >
            <span className="text-white font-bold text-lg">{lang}</span>
            <span className="text-white/20 font-mono text-xs">#{i + 1}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── SLIDE 5: NETWORK ─── */
function SlideNetwork({ data }: { data: UserInsights }) {
  const pct = Math.min((parseFloat(data.stats.social_ratio) || 0) * 10, 100);
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center h-full text-center space-y-12 p-8"
    >
      <Users size={50} className="text-cyan-400" />
      <div className="space-y-4">
        <h3 className="text-white/40 font-mono text-xs tracking-widest uppercase">Social Connectivity</h3>
        <p className="text-7xl font-black text-white leading-none">{data.stats.social_ratio}</p>
        <p className="text-white/60 text-sm px-8">Your collaborative vs solo commit ratio.</p>
      </div>
      <div className="w-full px-8">
        <div className="flex justify-between text-[10px] font-mono text-white/30 uppercase mb-2">
          <span>Solo</span>
          <span>Collaborative</span>
        </div>
        <Progress value={pct} className="h-2 bg-white/5" />
      </div>
    </motion.div>
  );
}

/* ─── SLIDE 6: ARCHETYPE ─── */
function SlideArchetype({ data }: { data: UserInsights }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center h-full text-center p-8 bg-gradient-to-t from-purple-900/20 to-transparent"
    >
      <Zap size={60} className="text-amber-400 mb-8" />
      <p className="text-white/40 font-mono text-xs tracking-widest uppercase mb-4">Your Developer Archetype</p>
      <motion.h2 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 12 }}
        className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter leading-tight italic"
      >
        {data.archetype}
      </motion.h2>
    </motion.div>
  );
}

/* ─── SLIDE 7: ROAST ─── */
function SlideRoast({ data }: { data: UserInsights }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center h-full p-10 bg-[#0a0a0a]"
    >
      <MessageSquare size={32} className="text-red-400 mb-6" />
      <div className="relative">
        <span className="absolute -top-8 -left-6 text-7xl font-serif text-white/5 select-none font-black">&ldquo;</span>
        <p className="text-lg md:text-xl text-white/90 leading-relaxed font-light italic relative z-10">
          {data.display_json ?? "You code in such silence that even the AI is speechless. Commit something!"}
        </p>
        <span className="absolute -bottom-12 -right-4 text-7xl font-serif text-white/5 select-none font-black">&rdquo;</span>
      </div>
      <p className="text-white/20 font-mono text-[10px] tracking-[0.3em] uppercase mt-16">— The Architect Review</p>
    </motion.div>
  );
}

/* ─── SLIDE 8: SUMMARY ─── */
function SlideSummary({ data, onLogout }: { data: UserInsights; onLogout: () => void }) {
  const s = data.stats;
  const router = useRouter();

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center h-full p-6 space-y-6 overflow-y-auto pt-16 pb-20"
    >
      <div className="w-full bg-white/5 border border-white/10 rounded-3xl p-8 space-y-8 backdrop-blur-md shadow-2xl pointer-events-auto">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter">RETROSPECTIVE</h2>
            <p className="text-white/40 font-mono text-[10px] tracking-widest uppercase">Insights Hub · 2026</p>
          </div>
          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
            <Github size={20} className="text-white" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
            <p className="text-2xl font-bold text-white">{s.total_commits}</p>
            <p className="text-[10px] text-white/30 font-mono uppercase tracking-wider">Commits</p>
          </div>
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
            <p className="text-2xl font-bold text-white">{s.active_days_per_year}</p>
            <p className="text-[10px] text-white/30 font-mono uppercase tracking-wider">Active Days</p>
          </div>
          <div className="col-span-2 bg-white/5 p-4 rounded-2xl border border-white/5">
            <p className="text-lg font-bold text-white uppercase italic tracking-tighter">{data.archetype}</p>
            <p className="text-[10px] text-white/30 font-mono uppercase tracking-wider">Archetype</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] text-white/30 font-mono uppercase tracking-wider ml-1">Stack Highlights</p>
          <div className="flex flex-wrap gap-2">
            {s.top_languages.slice(0, 3).map(l => (
              <span key={l} className="bg-white/10 text-white text-[11px] font-bold px-3 py-1 rounded-full border border-white/10">{l}</span>
            ))}
          </div>
        </div>

        <button 
          onClick={() => router.push("/")}
          className="w-full flex items-center justify-center gap-2 bg-white text-black py-4 rounded-2xl font-black uppercase text-sm hover:bg-white/90 transition-colors pointer-events-auto relative z-50"
        >
          <ChevronLeft size={16} />
          Back to Hub
        </button>
      </div>

      <p className="text-white/20 font-mono text-[10px] tracking-widest uppercase text-center px-12 leading-relaxed">
        Screenshot and share your year in code. <br /> See you next week.
      </p>
    </motion.div>
  );
}

/* ─── MAIN DASHBOARD ─── */
export default function Dashboard() {
  const [data, setData] = useState<UserInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const TOTAL_SLIDES = 9;
  const router = useRouter();

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev < TOTAL_SLIDES - 1 ? prev + 1 : prev));
  }, []);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("session_token");
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    const backendUrl = envUrl ? envUrl.replace(/\/api\/?$/, '') : "http://localhost:8000";
    window.location.href = `${backendUrl}/api/auth/logout`;
  };

  useEffect(() => {
    // Cross-domain handshake: if token is in URL, save it to BOTH localStorage and Cookie
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("session_token", token);
      // Set cookie for the middleware
      document.cookie = `session_token=${token}; path=/; max-age=${3600 * 24}; samesite=lax`;

      window.history.replaceState({}, document.title, window.location.pathname);
    }

    api.get("/user/insights")
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading || isPaused || activeIndex === TOTAL_SLIDES - 1) return;

    const timer = setTimeout(nextSlide, SLIDE_DURATION);
    return () => clearTimeout(timer);
  }, [activeIndex, isPaused, loading, nextSlide]);

  if (loading || !data) return <LoadingScreen />;

  return (
    <div className="fixed inset-0 bg-black overflow-hidden flex items-center justify-center font-sans select-none">
      {/* Background elements (global) */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-[10%] left-[20%] w-96 h-96 bg-purple-600/20 blur-[100px]" />
        <div className="absolute bottom-[15%] right-[15%] w-96 h-96 bg-pink-600/20 blur-[100px]" />
      </div>
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(#fff 1px,transparent 1px)", backgroundSize: "40px 44px" }} />
      <FloatingElements />

      {/* Story Frame */}
      <div className="relative w-full max-w-md h-full bg-[#080808] shadow-2xl overflow-hidden border-x border-white/5">

        {/* Progress Bars */}
        <div className="absolute top-4 left-0 right-0 z-50 flex gap-1.5 px-4">
          {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
            <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
              {i === activeIndex && (
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: isPaused ? undefined : "100%" }}
                  transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }}
                  className="h-full bg-white"
                />
              )}
              {i < activeIndex && <div className="h-full w-full bg-white" />}
            </div>
          ))}
        </div>

        {/* Navigation Overlays */}
        <div className="absolute inset-0 z-30 flex">
          <div 
            className="w-[30%] h-full cursor-pointer" 
            onClick={prevSlide}
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          />
          <div 
            className="w-[70%] h-full cursor-pointer" 
            onClick={nextSlide}
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          />
        </div>

        {/* Slides Content */}
        <div className="relative h-full z-40">
          <AnimatePresence mode="wait">
            {activeIndex === 0 && <SlideWeeklySummary key="0" data={data} />}
            {activeIndex === 1 && <SlideIntro key="1" data={data} />}
            {activeIndex === 2 && <SlideConsistency key="2" data={data} />}
            {activeIndex === 3 && <SlideHeatmap key="3" data={data} />}
            {activeIndex === 4 && <SlideStack key="4" data={data} />}
            {activeIndex === 5 && <SlideNetwork key="5" data={data} />}
            {activeIndex === 6 && <SlideArchetype key="6" data={data} />}
            {activeIndex === 7 && <SlideRoast key="7" data={data} />}
            {activeIndex === 8 && <SlideSummary key="8" data={data} onLogout={handleLogout} />}
          </AnimatePresence>
        </div>

        {/* Desktop Navigation Hints */}
        <div className="hidden md:flex absolute bottom-8 left-0 right-0 justify-center gap-12 z-50 pointer-events-none opacity-20">
           <div className="flex items-center gap-2 text-white font-mono text-[10px] tracking-widest">
             <ChevronLeft size={14} /> TAP LEFT
           </div>
           <div className="flex items-center gap-2 text-white font-mono text-[10px] tracking-widest">
             TAP RIGHT <ChevronRight size={14} />
           </div>
        </div>
      </div>
    </div>
  );
}

