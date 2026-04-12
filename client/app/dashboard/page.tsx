"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, GitPullRequest, Star, Trophy,
  MessageSquare, Github, Zap, Users, Code2,
} from "lucide-react";

// shadcn components
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
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
  };
  display_json?: string;
  updated_at: string;
}

/* ─── palette ─── */
const ACCENTS = ["#6ee7b7", "#93c5fd", "#fcd34d", "#fca5a5"] as const;

const LANG_PALETTE = [
  { bg: "rgba(139,92,246,.12)", border: "rgba(139,92,246,.28)", dot: "#a78bfa" },
  { bg: "rgba(59,130,246,.12)", border: "rgba(59,130,246,.28)", dot: "#60a5fa" },
  { bg: "rgba(16,185,129,.12)", border: "rgba(16,185,129,.28)", dot: "#34d399" },
  { bg: "rgba(245,158,11,.12)", border: "rgba(245,158,11,.28)", dot: "#fcd34d" },
  { bg: "rgba(239,68,68,.12)", border: "rgba(239,68,68,.28)", dot: "#fca5a5" },
  { bg: "rgba(20,184,166,.12)", border: "rgba(20,184,166,.28)", dot: "#5eead4" },
] as const;

/* ─── shared inline styles ─── */
// Only kept for things shadcn doesn't cover: typography overrides, colours, layout.
const monoLabel: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: "0.22em",
  color: "rgba(255,255,255,.3)",
};

/* ─── animated counter ─── */
function Counter({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [n, setN] = useState(0);
  const started = useRef(false);
  const el = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = el.current;
    if (!node || started.current) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || started.current) return;
        started.current = true;
        const t0 = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - t0) / duration, 1);
          setN(Math.round((1 - Math.pow(1 - p, 4)) * value));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.2 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [value, duration]);

  return <span ref={el}>{n.toLocaleString()}</span>;
}

/* ─── loading ─── */
function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        style={{ width: 30, height: 30, borderRadius: "50%", border: "2px solid #1e1e1e", borderTopColor: "#fff" }}
      />
    </div>
  );
}

/* ─── stat card  (Card + CardContent) ─── */
function StatCard({ icon: Icon, label: lbl, value, accent, delay }: {
  icon: React.ElementType;
  label: string;
  value: number;
  accent: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5, transition: { duration: 0.18 } }}
    >
      {/* We override shadcn Card's default bg/border so it fits the dark theme */}
      <Card className="h-[164px] flex flex-col justify-between cursor-default"
        style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 22 }}
      >
        <CardContent className="flex flex-col justify-between h-full p-6">
          <div
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: `${accent}1a`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Icon size={16} color={accent} />
          </div>
          <div>
            <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 2, color: "white" }}>
              <Counter value={value} />
            </div>
            <p style={{ ...monoLabel, marginTop: 6 }}>{lbl}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ─── main dashboard ─── */
export default function Dashboard() {
  const [data, setData] = useState<UserInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"stats" | "stack" | "network">("stats");

  useEffect(() => {
    api.get("/user/insights")
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen />;
  const s = data?.stats;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080808",
      color: "#fff",
      fontFamily: "'DM Sans','Inter',-apple-system,BlinkMacSystemFont,sans-serif",
    }}>
      {/* top shimmer line */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent)", zIndex: 100 }} />

      {/* SVG noise texture */}
      <svg style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }}>
        <defs>
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise" seed="2" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.8" />
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="#080808" opacity="0.015" style={{ filter: "url(#noise)" }} />
      </svg>

      {/* Gradient orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 3 }}>
        <div style={{ position: "absolute", top: "10%", left: "20%", width: 400, height: 400, background: "radial-gradient(circle, rgba(169, 85, 247, 0.44) 0%, transparent 70%)", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", bottom: "15%", right: "15%", width: 350, height: 350, background: "radial-gradient(circle, rgba(236, 72, 154, 0.49) 0%, transparent 70%)", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", top: "50%", right: "10%", width: 300, height: 300, background: "radial-gradient(circle, rgba(6, 181, 212, 0.29) 0%, transparent 70%)", filter: "blur(80px)" }} />
      </div>

      {/* dot-grid background */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.03) 1px,transparent 1px)", backgroundSize: "44px 44px", pointerEvents: "none", zIndex: 2 }} />

      {/* Floating elements */}
      <FloatingElements />

      {/* Content container */}

      <div style={{ position: "relative", zIndex: 20, maxWidth: 1080, margin: "0 auto", padding: "72px 28px 80px" }}>

        {/* ── HERO ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.55 }}>
          {/* eyebrow */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 36 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 8px #34d399", display: "inline-block" }} />
            <span style={monoLabel}>GitHub Retrospective · 2026</span>
          </div>

          {/* username + archetype */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 20, marginBottom: 52 }}>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={{ fontSize: "clamp(3.2rem,9vw,7rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.85, margin: 0 }}
            >
              {data?.user_name?.toUpperCase() ?? "—"}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 22 }}>
                <CardContent className="p-6">
                  <p style={{ ...monoLabel, marginBottom: 10 }}>Archetype</p>
                  <p style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.3, color: "#fff" }}>
                    {data?.archetype ?? "—"}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* ── AI REVIEW ── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: 36 }}
        >
          <Card style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 22, overflow: "hidden", position: "relative" }}>
            {/* decorative quote mark */}
            <div aria-hidden style={{ position: "absolute", top: -24, right: 28, fontSize: 200, fontWeight: 900, color: "rgba(255,255,255,.025)", lineHeight: 1, fontFamily: "Georgia,serif", userSelect: "none", pointerEvents: "none" }}>&quot;</div>

            <CardHeader className="pb-0 pt-8 px-10">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <MessageSquare size={13} color="rgba(255,255,255,.25)" />
                <span style={monoLabel}>Architect Review</span>
              </div>
            </CardHeader>

            <CardContent className="px-10 pb-10 pt-4">
              <p style={{ fontSize: "clamp(1rem,2vw,1.4rem)", fontWeight: 400, lineHeight: 1.65, color: "rgba(255,255,255,.82)", margin: 0, fontStyle: "italic", maxWidth: 700 }}>
                {data?.display_json ?? "Your code is so quiet the AI fell asleep. Commit something!"}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── STAT CARDS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12, marginBottom: 44 }}>
          {[
            { icon: Activity, label: "Commits", value: s?.total_commits ?? 0 },
            { icon: GitPullRequest, label: "Pull Requests", value: s?.total_prs ?? 0 },
            { icon: Star, label: "Stars Earned", value: s?.total_stars ?? 0 },
            { icon: Trophy, label: "Active Days", value: s?.active_days_per_year ?? 0 },
          ].map(({ icon, label: lbl, value }, i) => (
            <StatCard key={lbl} icon={icon} label={lbl} value={value} accent={ACCENTS[i]} delay={0.16 + i * 0.06} />
          ))}
        </div>

        {/* ── TABS (shadcn) ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.32 }}>
          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as typeof tab)}
            className="w-full"
          >
            {/* MAIN LAYOUT */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "220px 1fr",
                gap: 24,
                width: "100%",
                alignItems: "start",
              }}
            >

              {/* ───────── LEFT: VERTICAL TABS ───────── */}
              <div
                role="tablist"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  padding: 6,
                  borderRadius: 14,
                  background: "rgba(255,255,255,.04)",
                  border: "1px solid rgba(255,255,255,.08)",
                  position: "sticky",
                  top: 100,
                }}
              >
                {([
                  {
                    value: "stats",
                    icon: Activity,
                    label: "Stats",
                    count: [s?.total_commits, s?.total_prs, s?.total_issues, s?.total_stars].filter(Boolean).length
                  },
                  {
                    value: "stack",
                    icon: Code2,
                    label: "Stack",
                    count: s?.top_languages?.length ?? 0
                  },
                  {
                    value: "network",
                    icon: Users,
                    label: "Network",
                    count: null
                  },
                ] as const).map(({ value: tv, icon: Icon, label: lbl, count }) => (
                  <button
                    key={tv}
                    role="tab"
                    aria-selected={tab === tv}
                    onClick={() => setTab(tv)}
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      padding: "10px 14px",
                      borderRadius: 10,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 500,
                      color: tab === tv ? "#fff" : "rgba(255,255,255,.45)",
                      transition: "color 0.18s",
                    }}
                  >
                    {/* active background */}
                    {tab === tv && (
                      <motion.div
                        layoutId="tab-pill-vertical"
                        style={{
                          position: "absolute",
                          inset: 0,
                          borderRadius: 10,
                          background: "rgba(255,255,255,.10)",
                          border: "1px solid rgba(255,255,255,.12)",
                          zIndex: -1,
                        }}
                        transition={{ type: "spring", stiffness: 420, damping: 36 }}
                      />
                    )}

                    {/* left content */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Icon size={14} style={{ opacity: tab === tv ? 1 : 0.5 }} />
                      {lbl}
                    </div>

                    {/* count */}
                    {count != null && count > 0 && (
                      <span
                        style={{
                          fontSize: 10,
                          fontFamily: "monospace",
                          color: "rgba(255,255,255,.5)",
                          background: "rgba(255,255,255,.07)",
                          borderRadius: 6,
                          padding: "2px 6px",
                        }}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* ───────── RIGHT: CONTENT (FIXED MIN HEIGHT) ───────── */}
              <div
                style={{
                  width: "100%",
                  minHeight: 420,   // ✅ no extra empty space, no shrinking
                }}
              >

                {/* STATS */}
                <TabsContent value="stats" forceMount style={{ display: tab === "stats" ? "block" : "none" }}>
                  <AnimatePresence mode="wait">
                    {tab === "stats" && (
                      <motion.div
                        key="stats"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                      >
                        <StatsPanel stats={s} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </TabsContent>

                {/* STACK */}
                <TabsContent value="stack" forceMount style={{ display: tab === "stack" ? "block" : "none" }}>
                  <AnimatePresence mode="wait">
                    {tab === "stack" && (
                      <motion.div
                        key="stack"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <StackPanel languages={s?.top_languages ?? []} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </TabsContent>

                {/* NETWORK */}
                <TabsContent value="network" forceMount style={{ display: tab === "network" ? "block" : "none" }}>
                  <AnimatePresence mode="wait">
                    {tab === "network" && (
                      <motion.div
                        key="network"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <NetworkPanel ratio={s?.social_ratio ?? "0/0"} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </TabsContent>

              </div>
            </div>
          </Tabs>
        </motion.div>

        {/* ── FOOTER ── */}
        <Separator style={{ background: "rgba(255,255,255,.05)", marginTop: 64, marginBottom: 20 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", ...monoLabel }}>
          <span>Updated {data?.updated_at ? new Date(data.updated_at).toLocaleDateString() : "—"}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Github size={12} />
            <span>GitHub Retrospective</span>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ─── Stats Panel ─── */
function StatsPanel({ stats }: { stats: UserInsights["stats"] | undefined }) {
  const rows = [
    { label: "Commits", value: stats?.total_commits ?? 0, icon: Activity, color: "#6ee7b7" },
    { label: "Pull Requests", value: stats?.total_prs ?? 0, icon: GitPullRequest, color: "#93c5fd" },
    { label: "Issues Filed", value: stats?.total_issues ?? 0, icon: Zap, color: "#c4b5fd" },
    { label: "Stars Earned", value: stats?.total_stars ?? 0, icon: Star, color: "#fcd34d" },
    { label: "Active Days/yr", value: stats?.active_days_per_year ?? 0, icon: Trophy, color: "#fca5a5" },
  ];
  const max = Math.max(...rows.map(r => r.value), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%" }}>
      {rows.map(({ label, value, icon: Icon, color }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, x: -14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.055, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            width: "100%",
          }}
        >
          {/* ✅ FIX: flexible label column */}
          <div
            style={{
              minWidth: 120,   // 🔥 changed from width: 140
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Icon size={13} color={color} />
            <Badge
              variant="outline"
              style={{
                background: "transparent",
                border: "none",
                color: "rgba(255,255,255,.35)",
                fontFamily: "monospace",
                fontSize: 11,
                padding: "0 0",
                letterSpacing: "0.04em",
              }}
            >
              {label}
            </Badge>
          </div>

          {/* progress */}
          <div style={{ flex: 1 }}>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: value / max }}
              transition={{ delay: 0.18 + i * 0.06, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: "left", borderRadius: 99 }}
            >
              <Progress
                value={100}
                style={{ height: 4, background: "rgba(255,255,255,.05)" }}
                className="[&>div]:rounded-full"
                // @ts-expect-error: style2 is a custom prop for the progress component
                style2={{ "--progress-foreground": color } as React.CSSProperties}
              />
            </motion.div>
          </div>

          {/* value */}
          <div
            style={{
              width: 52,
              textAlign: "right",
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            <Counter value={value} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Stack Panel ─── */
function StackPanel({ languages }: { languages: string[] }) {
  if (!languages.length) return (
    <div style={{ textAlign: "center", padding: "48px 0", color: "rgba(255,255,255,.2)", fontSize: 14 }}>No language data</div>
  );

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 12 }}>
      {languages.map((lang, i) => {
        const c = LANG_PALETTE[i % LANG_PALETTE.length];
        return (
          <motion.div
            key={lang}
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.055, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.03, transition: { duration: 0.15 } }}
          >
            <Card
              style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 18, cursor: "default" }}
            >
              <CardContent className="p-5">
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: c.dot, display: "inline-block" }} />
                  <Badge
                    variant="outline"
                    style={{ background: "transparent", border: "none", color: "rgba(255,255,255,.22)", fontFamily: "monospace", fontSize: 10, padding: 0, letterSpacing: "0.1em" }}
                  >
                    #{i + 1}
                  </Badge>
                </div>
                <p style={{ fontSize: 17, fontWeight: 700, color: "#fff", margin: 0 }}>{lang}</p>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ─── Network Panel ─── */
function NetworkPanel({ ratio }: { ratio: string }) {
  const pct = Math.min((parseFloat(ratio) || 0) * 10, 100);
  const [go, setGo] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setGo(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(270px,1fr))", gap: 14 }}>

      {/* big ratio card */}
      <Card style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 22 }}>
        <CardContent className="p-10 flex flex-col justify-between" style={{ minHeight: 220 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Users size={13} color="rgba(255,255,255,.25)" />
            <span style={monoLabel}>Social Connectivity</span>
          </div>
          <div style={{ fontSize: "clamp(4rem,10vw,7rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1 }}>
            {ratio}
          </div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,.3)", lineHeight: 1.6, margin: 0 }}>
            Collaborative-to-solo commit ratio for the year.
          </p>
        </CardContent>
      </Card>

      {/* gauge card */}
      <Card style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 22 }}>
        <CardContent className="p-10 flex flex-col justify-between" style={{ minHeight: 220 }}>
          <span style={monoLabel}>Gauge</span>

          <div>
            {/* shadcn Progress with animated wrapper */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: go ? pct / 100 : 0 }}
              transition={{ delay: 0.15, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: "left" }}
            >
              <Progress
                value={100}
                style={{ height: 5, background: "rgba(255,255,255,.06)" }}
                className="[&>div]:bg-gradient-to-r [&>div]:from-blue-400 [&>div]:to-violet-400 [&>div]:rounded-full"
              />
            </motion.div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,.2)", marginTop: 10 }}>
              <span>Solo</span>
              <span>{Math.round(pct)}%</span>
              <span>Social</span>
            </div>
          </div>

          {/* mini metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {([["Followers", "—"], ["Following", "—"], ["Ratio", ratio]] as const).map(([l, v]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <p style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: 0 }}>{v}</p>
                <p style={{ ...monoLabel, marginTop: 4 }}>{l}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
