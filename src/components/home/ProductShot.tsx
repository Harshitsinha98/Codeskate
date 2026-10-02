"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Bell,
  LayoutGrid,
  MessageCircle,
  PhoneCall,
  Search,
  Users,
  Receipt,
  BarChart3,
} from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

const NAV = [
  { icon: LayoutGrid, label: "Lead Hub", active: true },
  { icon: PhoneCall, label: "Call Tracker" },
  { icon: MessageCircle, label: "WhatsApp" },
  { icon: Users, label: "Team" },
  { icon: Receipt, label: "Billing" },
  { icon: BarChart3, label: "Reports" },
];

const STAGES = [
  { name: "New", count: 12, bar: "w-[85%]" },
  { name: "Contacted", count: 8, bar: "w-[62%]" },
  { name: "Qualified", count: 5, bar: "w-[40%]" },
  { name: "Won", count: 3, bar: "w-[24%]" },
];

const LEADS = [
  { name: "Priya Sharma", src: "Website form", stage: "New", time: "2m" },
  { name: "Rahul Verma", src: "WhatsApp", stage: "Contacted", time: "14m" },
  { name: "Aisha Khan", src: "Referral", stage: "Qualified", time: "1h" },
  { name: "Vikram Rao", src: "Call · 3m 12s", stage: "Won", time: "3h" },
];

// Weekly lead volume — sparkline points (0–100).
const SPARK = [22, 30, 26, 40, 36, 52, 48, 61, 58, 72, 69, 84];

function sparkPath(points: number[], w: number, h: number) {
  const step = w / (points.length - 1);
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)},${(h - (p / 100) * h).toFixed(1)}`)
    .join(" ");
}

/**
 * A dark, high-fidelity mock of the real CodeSkate CRM lead hub. Rendered in
 * DOM (not an image) so it stays crisp, themeable and animated.
 */
export function ProductShot() {
  const W = 260;
  const H = 70;
  const line = sparkPath(SPARK, W, H);

  return (
    <div className="ring-gradient relative overflow-hidden rounded-2xl bg-night-800 shadow-night-card md:rounded-3xl">
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <div className="mx-auto flex h-6 w-full max-w-xs items-center justify-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.03] font-mono text-[0.62rem] text-white/40">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          crm.codeskate.com/leads
        </div>
        <span className="w-12" />
      </div>

      <div className="flex text-left">
        {/* Sidebar */}
        <aside className="hidden w-44 shrink-0 border-r border-white/[0.06] p-3 md:block">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <span className="grid h-5 w-5 place-items-center rounded-md bg-gradient-to-br from-royal-400 to-royal-700 text-[0.55rem] font-bold text-white">
              C
            </span>
            <span className="text-[0.72rem] font-semibold text-white">CodeSkate CRM</span>
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-1.5 text-[0.62rem] text-white/30">
            <Search className="h-3 w-3" />
            Search
            <span className="ml-auto rounded border border-white/10 px-1 font-sans text-[0.55rem]">⌘K</span>
          </div>
          <nav className="mt-3 space-y-0.5">
            {NAV.map(({ icon: Icon, label, active }) => (
              <div
                key={label}
                className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[0.68rem] ${
                  active ? "bg-white/[0.07] text-white" : "text-white/45"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${active ? "text-royal-400" : ""}`} />
                {label}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <div className="min-w-0 flex-1 p-4 md:p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[0.8rem] font-semibold text-white">Lead pipeline</div>
              <div className="mt-0.5 font-mono text-[0.6rem] text-white/40">28 active · this week</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 font-mono text-[0.58rem] text-emerald-300">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                LIVE
              </span>
              <span className="relative grid h-6 w-6 place-items-center rounded-full border border-white/10 text-white/50">
                <Bell className="h-3 w-3" />
                <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-royal" />
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1.25fr_1fr]">
            {/* Chart card */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
              <div className="flex items-baseline justify-between">
                <span className="text-[0.62rem] text-white/45">Leads captured</span>
                <span className="inline-flex items-center gap-0.5 font-mono text-[0.6rem] text-emerald-300">
                  <ArrowUpRight className="h-3 w-3" />
                  18.4%
                </span>
              </div>
              <div className="mt-1 font-mono text-xl font-medium tabular-nums text-white">1,284</div>
              <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 h-16 w-full" preserveAspectRatio="none" aria-hidden>
                <defs>
                  <linearGradient id="ps-fill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#FF6A1A" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#FF6A1A" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={`${line} L${W},${H} L0,${H} Z`} fill="url(#ps-fill)" />
                <motion.path
                  d={line}
                  fill="none"
                  stroke="#FF8A47"
                  strokeWidth="1.6"
                  vectorEffect="non-scaling-stroke"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.6, delay: 0.6, ease }}
                />
              </svg>
            </div>

            {/* Stage funnel */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
              <span className="text-[0.62rem] text-white/45">Pipeline stages</span>
              <div className="mt-3 space-y-2.5">
                {STAGES.map((s, i) => (
                  <div key={s.name}>
                    <div className="flex justify-between text-[0.6rem]">
                      <span className="text-white/60">{s.name}</span>
                      <span className="font-mono tabular-nums text-white/80">{s.count}</span>
                    </div>
                    <div className="mt-1 h-1 rounded-full bg-white/[0.06]">
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.8, delay: 0.7 + i * 0.1, ease }}
                        className={`h-full origin-left rounded-full bg-gradient-to-r from-royal-700 to-royal-400 ${s.bar}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Lead table */}
          <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.06]">
            <div className="grid grid-cols-[1.4fr_1fr_0.8fr_0.4fr] border-b border-white/[0.06] bg-white/[0.02] px-3.5 py-2 font-mono text-[0.55rem] uppercase tracking-wider text-white/35">
              <span>Lead</span>
              <span>Source</span>
              <span>Stage</span>
              <span className="text-right">Age</span>
            </div>
            {LEADS.map((l, i) => (
              <motion.div
                key={l.name}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.9 + i * 0.08, ease }}
                className="grid grid-cols-[1.4fr_1fr_0.8fr_0.4fr] items-center border-b border-white/[0.04] px-3.5 py-2 text-[0.65rem] last:border-0"
              >
                <span className="flex items-center gap-2 truncate text-white/85">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/[0.07] text-[0.55rem] text-white/60">
                    {l.name.charAt(0)}
                  </span>
                  {l.name}
                </span>
                <span className="truncate text-white/45">{l.src}</span>
                <span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 font-mono text-[0.55rem] ${
                      l.stage === "Won"
                        ? "bg-emerald-400/10 text-emerald-300"
                        : l.stage === "New"
                          ? "bg-royal/15 text-royal-400"
                          : "bg-white/[0.06] text-white/60"
                    }`}
                  >
                    {l.stage}
                  </span>
                </span>
                <span className="text-right font-mono tabular-nums text-white/35">{l.time}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
