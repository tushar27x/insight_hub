"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, GitPullRequest, Star, Trophy,
  MessageSquare, Github, Zap, Users, Code2, LogOut, Play, BarChart3, MoveDown, Scissors, MessageCircleCode, CheckCircle2
} from "lucide-react";

// shadcn components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FloatingElements } from "@/components/floating-elements";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import api from "../lib/api";
import StoryMode from "./StoryMode";

/* ─── types ─── */
interface RankedRepo {
  name: string;
  count: number;
  summary: string;
}

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
    last_month_heatmap?: number[];
    heatmap_labels?: string[];
    ranked_repos: RankedRepo[];
    recent_commits: string[];
    code_churn: { additions: number; deletions: number };
  };
  display_json?: string;
  weekly_review?: string;
  craft_review?: string;
  updated_at: string;
}

function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-[#080808] flex flex-col items-center justify-center z-50 space-y-6">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 rounded-full border-2 border-white/5 border-t-purple-500"
      />
      <div className="text-center space-y-2">
         <p className="text-[10px] font-mono text-purple-400 uppercase tracking-[0.5em] animate-pulse">Initializing Audit</p>
         <p className="text-white/20 font-mono text-[9px] uppercase tracking-widest">Gathering technical evidence...</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<UserInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [isStoryMode, setIsStoryMode] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("session_token", token);
      document.cookie = `session_token=${token}; path=/; max-age=${3600 * 24}; samesite=lax`;
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    api.get("/user/insights")
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const monthHeatmap = data?.stats.last_month_heatmap || data?.stats.last_week_heatmap || [];
  const maxMonthContributions = Math.max(...(monthHeatmap.length > 0 ? monthHeatmap : [1]), 1);

  const monthLabels = useMemo(() => {
    if (!data) return [];
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const updatedDate = new Date(data.updated_at);
    const labels = [];
    const len = monthHeatmap.length;
    for (let i = len - 1; i >= 0; i--) {
      const d = new Date(updatedDate);
      d.setDate(d.getDate() - i);
      labels.push(dayNames[d.getDay()]);
    }
    return labels;
  }, [data?.updated_at, monthHeatmap.length]);

  const handleLogout = () => {
    localStorage.removeItem("session_token");
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    const backendUrl = envUrl ? envUrl.replace(/\/api\/?$/, '') : "http://localhost:8000";
    window.location.href = `${backendUrl}/api/auth/logout`;
  };

  if (loading || !data) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#080808] text-[#f0f0f0] font-sans selection:bg-purple-500/30 overflow-x-hidden">
      <FloatingElements />
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 left-0 w-[50%] h-screen bg-[radial-gradient(circle_at_0%_0%,rgba(120,50,255,0.1),transparent_70%)]" />
        <div className="absolute bottom-0 right-0 w-[50%] h-screen bg-[radial-gradient(circle_at_100%_100%,rgba(50,150,255,0.1),transparent_70%)]" />
      </div>

      <AnimatePresence>
        {isStoryMode && (
          <div className="z-[100] relative">
            <StoryMode data={data} onClose={() => setIsStoryMode(false)} />
          </div>
        )}
      </AnimatePresence>

      <main className="relative z-10 w-full max-w-[1600px] mx-auto px-6 lg:px-12 py-12 md:py-20">
        
        {/* TOP LEVEL GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT SIDEBAR: MANAGER'S NOTES (Col span 4) */}
          <aside className="lg:col-span-4 space-y-8 lg:sticky lg:top-20">
            <header className="space-y-6">
              <div className="space-y-2">
                 <Badge className="bg-purple-600 text-white border-none px-4 py-1 text-[10px] font-black uppercase tracking-widest">
                   {data.archetype}
                 </Badge>
                 <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase text-white leading-none italic">
                   {data.user_name}
                 </h1>
              </div>
              <p className="text-white/30 font-mono text-[10px] tracking-[0.3em] uppercase">
                Performance Review · v3.0 Internal
              </p>
              
              <div className="flex items-center gap-3 pt-4">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsStoryMode(true)}
                  className="flex-1 flex items-center justify-center gap-3 bg-white text-black px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl transition-all"
                >
                  <Play size={12} fill="currentColor" /> Play Wrapped
                </motion.button>
                <button 
                  onClick={handleLogout}
                  className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors text-white/40 hover:text-white"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </header>

            <Separator className="bg-white/5" />

            <section className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3 opacity-40">
                  <Zap size={14} className="text-purple-400" />
                  <h3 className="text-[10px] font-mono uppercase tracking-widest">Weekly Review</h3>
                </div>
                <Card className="bg-white/5 border-white/5 rounded-[32px] p-8 shadow-inner">
                  <p className="text-xl text-white font-light leading-relaxed italic">
                    &ldquo;{data.weekly_review}&rdquo;
                  </p>
                </Card>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 opacity-40">
                  <MessageSquare size={14} className="text-red-400" />
                  <h3 className="text-[10px] font-mono uppercase tracking-widest">Craft Roast</h3>
                </div>
                <Card className="bg-[#0c0c0c] border border-red-500/10 rounded-[32px] p-8 relative">
                  <p className="text-xl text-white/90 font-light leading-relaxed italic">
                    {data.craft_review || data.display_json}
                  </p>
                </Card>
              </div>
            </section>
            
            <p className="text-[9px] font-mono text-white/10 uppercase text-center pt-8 tracking-[0.2em]">
              Synced: {new Date(data.updated_at).toLocaleString()}
            </p>
          </aside>

          {/* RIGHT CONTENT AREA: TECHNICAL DATA (Col span 8) */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* 1. METERICS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Commits", value: data.stats.total_commits, color: "text-purple-400" },
                { label: "PRs", value: data.stats.total_prs, color: "text-blue-400" },
                { label: "Issues", value: data.stats.total_issues, color: "text-emerald-400" },
                { label: "Stars", value: data.stats.total_stars, color: "text-amber-400" },
              ].map((stat, i) => (
                <Card key={i} className="bg-white/5 border-white/5 rounded-[24px]">
                  <CardContent className="p-6 flex flex-col items-center text-center space-y-1">
                     <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest">{stat.label}</p>
                     <h3 className={`text-4xl font-black tracking-tighter ${stat.color}`}>{stat.value.toLocaleString()}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 2. THE GRIND: MONTHLY VELOCITY BAR CHART */}
            <Card className="bg-white/5 border-white/5 rounded-[40px] overflow-hidden">
               <CardHeader className="px-10 pt-10 flex flex-row items-center justify-between border-b border-white/5 pb-8">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-black uppercase tracking-tight text-white">Monthly Velocity</CardTitle>
                    <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Last 28 Days of Activity</p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-white/40 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                     <BarChart3 size={12} className="text-purple-400" />
                     <span>Activity Volume</span>
                  </div>
               </CardHeader>
               <CardContent className="p-10">
                  <div className="flex items-end justify-between gap-1 h-48 w-full group/chart">
                    {monthHeatmap.map((count, i) => (
                      <div key={i} className="flex-1 flex flex-col justify-end h-full group relative">
                        <motion.div 
                          initial={{ height: 0 }}
                          whileInView={{ height: `${(count / maxMonthContributions) * 100}%` }}
                          transition={{ delay: i * 0.01, type: "spring", stiffness: 100, damping: 15 }}
                          className="w-full bg-purple-500 rounded-t-[4px] min-h-[2px]"
                          style={{ 
                            opacity: count === 0 ? 0.05 : 0.2 + (count / maxMonthContributions) * 0.8,
                            filter: count > 0 ? "drop-shadow(0 0 8px rgba(168,85,247,0.2))" : "none"
                          }}
                        />
                        {/* Tooltip on hover */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black px-2 py-1 rounded text-[8px] font-black opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap">
                          {count} commits
                        </div>
                        {/* Weekday Label */}
                        <div className="mt-2 text-center">
                          <span className="text-[7px] font-mono text-white/10 uppercase font-black group-hover:text-purple-400 transition-colors">
                            {monthLabels[i]}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-6 px-1 border-t border-white/5 pt-4">
                    <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">28 Days Ago</span>
                    <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">Today</span>
                  </div>
               </CardContent>
            </Card>

            {/* 3. THE CRAFT: CHURN & LANGUAGES */}
            <div className="grid md:grid-cols-2 gap-8">
               <Card className="bg-white/5 border-white/5 rounded-[40px] p-10 space-y-8">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black uppercase tracking-tight text-white">Code Churn</h3>
                    <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Additions vs Deletions</p>
                  </div>
                  <div className="space-y-6">
                    <div className="flex justify-between items-end">
                       <div className="space-y-1">
                         <p className="text-4xl font-black text-emerald-400">+{(data.stats.code_churn?.additions ?? 0).toLocaleString()}</p>
                         <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Added</p>
                       </div>
                       <div className="space-y-1 text-right">
                         <p className="text-4xl font-black text-red-500">-{(data.stats.code_churn?.deletions ?? 0).toLocaleString()}</p>
                         <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Deleted</p>
                       </div>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex">
                       <div 
                         className="h-full bg-emerald-500/50" 
                         style={{ width: `${((data.stats.code_churn?.additions || 0) / ((data.stats.code_churn?.additions || 0) + (data.stats.code_churn?.deletions || 0) || 1)) * 100}%` }} 
                       />
                       <div className="h-full bg-red-500/50 flex-1" />
                    </div>
                  </div>
               </Card>

               <Card className="bg-white/5 border-white/5 rounded-[40px] p-10 space-y-8">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black uppercase tracking-tight text-white">Primary Stack</h3>
                    <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Top Languages Used</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {data.stats.top_languages.map(lang => (
                      <Badge key={lang} variant="outline" className="px-4 py-2 border-white/10 text-white font-bold text-xs uppercase rounded-xl hover:bg-white/5 transition-colors">
                        {lang}
                      </Badge>
                    ))}
                  </div>
               </Card>
            </div>

            {/* 4. THE IMPACT: REPOS */}
            <div className="space-y-6">
               <div className="flex items-center gap-4 opacity-40 px-4">
                  <Github size={16} />
                  <h3 className="text-[10px] font-mono uppercase tracking-[0.3em]">Project Portfolio</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(data.stats.ranked_repos || []).map((repo, i) => (
                    <Card key={repo.name} className="bg-white/5 border-white/5 rounded-[36px] overflow-hidden hover:bg-white/[0.08] transition-all p-8 space-y-6">
                        <div className="flex items-center justify-between">
                           <h4 className="text-2xl font-black tracking-tight text-white truncate pr-4">{repo.name}</h4>
                           <Badge className="bg-white/5 text-white/40 border-none font-mono text-[9px] uppercase">{repo.count} Commits</Badge>
                        </div>
                        <p className="text-md text-white/60 leading-relaxed font-light line-clamp-3">
                          {repo.summary}
                        </p>
                    </Card>
                  ))}
               </div>
            </div>

          </div>
        </div>

        {/* FOOTER */}
        <footer className="py-24 flex flex-col items-center gap-8 border-t border-white/5 w-full mt-20">
           <div className="flex items-center gap-4 text-white/10 font-mono text-[9px] tracking-[0.5em] uppercase">
             <span>Insights Hub</span>
             <Separator orientation="vertical" className="h-3 bg-white/10" />
             <span>Manager Terminal</span>
           </div>
        </footer>
      </main>
    </div>
  );
}
