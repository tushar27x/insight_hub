"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, Trophy, MessageSquare, Github, Zap, Users, Code2, ChevronLeft, ChevronRight, X 
} from "lucide-react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { FloatingElements } from "@/components/floating-elements";
import { useRouter } from "next/navigation";

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
    heatmap_labels?: string[];
    code_churn: { additions: number; deletions: number };
  };
  display_json?: string;
  weekly_review?: string;
  craft_review?: string;
  updated_at: string;
}

const SLIDE_DURATION = 7000;

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

function SlideCraftReview({ data }: { data: UserInsights }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center h-full text-center space-y-10 p-8 bg-gradient-to-br from-emerald-900/20 to-transparent"
    >
      <div className="space-y-4">
        <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full inline-block">
          <span className="text-[10px] font-mono text-emerald-400 tracking-[0.3em] uppercase">Engineering Audit</span>
        </div>
        <h2 className="text-4xl font-black text-white leading-tight uppercase tracking-tighter italic">The Craft</h2>
      </div>
      
      <div className="grid grid-cols-2 gap-4 w-full">
         <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
            <p className="text-3xl font-black text-emerald-400">+{(data.stats.code_churn?.additions ?? 0).toLocaleString()}</p>
            <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest mt-1">Additions</p>
         </div>
         <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
            <p className="text-3xl font-black text-red-500">-{(data.stats.code_churn?.deletions ?? 0).toLocaleString()}</p>
            <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest mt-1">Deletions</p>
         </div>
      </div>

      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5 }} className="relative bg-[#0c0c0c] border border-emerald-500/20 p-8 rounded-[32px]">
        <p className="text-lg text-white/90 leading-relaxed font-light italic">{data.craft_review || "Keep polishing your habits."}</p>
      </motion.div>
    </motion.div>
  );
}

function SlideWeeklySummary({ data }: { data: UserInsights }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center h-full text-center space-y-10 p-8"
    >
      <div className="space-y-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full inline-block">
          <span className="text-[10px] font-mono text-white/60 tracking-[0.3em] uppercase">Weekly Sync</span>
        </motion.div>
        <h2 className="text-4xl font-black text-white leading-tight uppercase tracking-tighter">Your Last 7 Days <br /> In Code</h2>
      </div>
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="relative bg-white/5 border border-white/10 p-8 rounded-[32px] backdrop-blur-sm">
        <p className="text-lg md:text-xl text-white/90 leading-relaxed font-light italic">{data.weekly_review ?? "The data is in. Let's see how your week went..."}</p>
      </motion.div>
      <p className="text-white/30 font-mono text-[10px] tracking-widest uppercase">Generated using your latest GitHub activity.</p>
    </motion.div>
  );
}

function SlideIntro({ data }: { data: UserInsights }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full text-center space-y-8 p-8">
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

function SlideConsistency({ data }: { data: UserInsights }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full text-center space-y-8 p-8 bg-gradient-to-b from-blue-900/20 to-transparent">
      <Trophy size={80} className="text-yellow-400 mb-4" />
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }}>
        <h2 className="text-7xl font-black text-white leading-none">{data.stats.active_days_per_year}</h2>
        <p className="text-xl text-white/80 font-light mt-4 px-6">Days of active contribution this year.</p>
      </motion.div>
      <p className="text-white/30 font-mono text-[10px] tracking-widest uppercase pt-8">Consistency is your superpower.</p>
    </motion.div>
  );
}

function SlideHeatmap({ data }: { data: UserInsights }) {
  const labels = useMemo(() => {
    if (data.stats.heatmap_labels && data.stats.heatmap_labels.length === 7) return data.stats.heatmap_labels;
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const updatedDate = new Date(data.updated_at);
    const fallback = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(updatedDate);
      d.setDate(d.getDate() - i);
      fallback.push(dayNames[d.getDay()]);
    }
    return fallback;
  }, [data.stats.heatmap_labels, data.updated_at]);

  const maxContributions = Math.max(...data.stats.last_week_heatmap, 1);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full text-center space-y-12 p-8">
      <Activity size={50} className="text-emerald-400" />
      <div className="space-y-4">
        <h3 className="text-white/40 font-mono text-xs tracking-widest uppercase">Last 7 Days</h3>
        <p className="text-4xl font-black text-white leading-tight uppercase">Recent Activity</p>
      </div>
      <div className="flex justify-center gap-3 h-48 w-full px-4">
        {data.stats.last_week_heatmap.map((count, i) => (
          <div key={i} className="flex flex-col items-center justify-end gap-3 flex-1 h-full">
            <motion.div 
              initial={{ height: 0 }} 
              animate={{ height: `${(count / maxContributions) * 100}%` }} 
              transition={{ delay: 0.2 + i * 0.1, type: "spring", stiffness: 100 }} 
              className="w-full bg-emerald-500 rounded-t-lg min-h-[4px]" 
              style={{ opacity: count === 0 ? 0.1 : 0.3 + (count / maxContributions) * 0.7 }} 
            />
            <span className="text-[10px] font-mono text-white/40 uppercase rotate-45 mt-2 h-6 flex items-center">{labels[i]}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function SlideStack({ data }: { data: UserInsights }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full space-y-6 p-8">
      <Code2 size={40} className="text-purple-400 mb-4" />
      <h3 className="text-white/40 font-mono text-xs tracking-widest uppercase">Your Weapon of Choice</h3>
      <div className="w-full space-y-4">
        {data.stats.top_languages.slice(0, 5).map((lang, i) => (
          <motion.div key={lang} initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 + i * 0.1 }} className="flex items-center justify-between bg-white/5 border border-white/10 p-5 rounded-2xl">
            <span className="text-white font-bold text-lg">{lang}</span>
            <span className="text-white/20 font-mono text-xs">#{i + 1}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function SlideNetwork({ data }: { data: UserInsights }) {
  const pct = Math.min((parseFloat(data.stats.social_ratio) || 0) * 10, 100);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full text-center space-y-12 p-8">
      <Users size={50} className="text-cyan-400" />
      <div className="space-y-4">
        <h3 className="text-white/40 font-mono text-xs tracking-widest uppercase">Social Connectivity</h3>
        <p className="text-7xl font-black text-white leading-none">{data.stats.social_ratio}</p>
        <p className="text-white/60 text-sm px-8">Your collaborative vs solo commit ratio.</p>
      </div>
      <div className="w-full px-8">
        <Progress value={pct} className="h-2 bg-white/5" />
      </div>
    </motion.div>
  );
}

function SlideArchetype({ data }: { data: UserInsights }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full text-center p-8 bg-gradient-to-t from-purple-900/20 to-transparent">
      <Zap size={60} className="text-amber-400 mb-8" />
      <p className="text-white/40 font-mono text-xs tracking-widest uppercase mb-4">Your Developer Archetype</p>
      <motion.h2 initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 12 }} className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter leading-tight italic">{data.archetype}</motion.h2>
    </motion.div>
  );
}

function SlideRoast({ data }: { data: UserInsights }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full p-10 bg-[#0a0a0a]">
      <MessageSquare size={32} className="text-red-400 mb-6" />
      <div className="relative">
        <span className="absolute -top-8 -left-6 text-7xl font-serif text-white/5 select-none font-black">&ldquo;</span>
        <p className="text-lg md:text-xl text-white/90 leading-relaxed font-light italic relative z-10">{data.display_json ?? "You code in such silence that even the AI is speechless. Commit something!"}</p>
        <span className="absolute -bottom-12 -right-4 text-7xl font-serif text-white/5 select-none font-black">&rdquo;</span>
      </div>
    </motion.div>
  );
}

function SlideSummary({ data, onClose }: { data: UserInsights; onClose: () => void }) {
  const s = data.stats;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full p-6 space-y-6">
      <div className="w-full bg-white/5 border border-white/10 rounded-3xl p-8 space-y-8 backdrop-blur-md shadow-2xl">
        <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">{data.archetype}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
            <p className="text-2xl font-bold text-white">{s.total_commits}</p>
            <p className="text-[10px] text-white/30 font-mono uppercase tracking-wider">Commits</p>
          </div>
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
            <p className="text-2xl font-bold text-white">{s.active_days_per_year}</p>
            <p className="text-[10px] text-white/30 font-mono uppercase tracking-wider">Active Days</p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase text-sm hover:bg-white/90 transition-colors pointer-events-auto"
        >
          Back to Dashboard
        </button>
      </div>
    </motion.div>
  );
}

export default function StoryMode({ data, onClose }: { data: UserInsights; onClose: () => void }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const router = useRouter();
  const TOTAL_SLIDES = 10;

  const handleClose = useCallback(() => {
    onClose();
    router.push("/dashboard");
  }, [onClose, router]);

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev < TOTAL_SLIDES - 1 ? prev + 1 : prev));
  }, []);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  useEffect(() => {
    if (isPaused || activeIndex === TOTAL_SLIDES - 1) return;
    const timer = setTimeout(nextSlide, SLIDE_DURATION);
    return () => clearTimeout(timer);
  }, [activeIndex, isPaused, nextSlide]);

  return (
    <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center font-sans select-none">
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-[10%] left-[20%] w-96 h-96 bg-purple-600/20 blur-[100px]" />
        <div className="absolute bottom-[15%] right-[15%] w-96 h-96 bg-pink-600/20 blur-[100px]" />
      </div>
      <FloatingElements />

      <div className="relative w-full max-w-md h-full bg-[#080808] shadow-2xl overflow-hidden border-x border-white/5">
        <button onClick={handleClose} className="absolute top-12 right-6 z-[110] text-white/40 hover:text-white transition-colors">
          <X size={24} />
        </button>

        <div className="absolute top-4 left-0 right-0 z-50 flex gap-1.5 px-4 pt-4">
          {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
            <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
              {i === activeIndex && (
                <motion.div initial={{ width: 0 }} animate={{ width: isPaused ? undefined : "100%" }} transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }} className="h-full bg-white" />
              )}
              {i < activeIndex && <div className="h-full w-full bg-white" />}
            </div>
          ))}
        </div>

        <div className="absolute inset-0 z-40 flex">
          <div className="w-[30%] h-full cursor-pointer" onClick={prevSlide} onMouseDown={() => setIsPaused(true)} onMouseUp={() => setIsPaused(false)} />
          <div className="w-[70%] h-full cursor-pointer" onClick={nextSlide} onMouseDown={() => setIsPaused(true)} onMouseUp={() => setIsPaused(false)} />
        </div>

        <div className="relative h-full z-50 pointer-events-none">
          <AnimatePresence mode="wait">
            {activeIndex === 0 && <SlideWeeklySummary key="0" data={data} />}
            {activeIndex === 1 && <SlideIntro key="1" data={data} />}
            {activeIndex === 2 && <SlideConsistency key="2" data={data} />}
            {activeIndex === 3 && <SlideHeatmap key="3" data={data} />}
            {activeIndex === 4 && <SlideCraftReview key="4" data={data} />}
            {activeIndex === 5 && <SlideStack key="5" data={data} />}
            {activeIndex === 6 && <SlideNetwork key="6" data={data} />}
            {activeIndex === 7 && <SlideArchetype key="7" data={data} />}
            {activeIndex === 8 && <SlideRoast key="8" data={data} />}
            {activeIndex === 9 && <SlideSummary key="9" data={data} onClose={handleClose} />}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
