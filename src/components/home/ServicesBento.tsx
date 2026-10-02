"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Check } from "lucide-react";
import type { ReactNode } from "react";
import { services } from "@/lib/services";
import { Spotlight } from "@/components/ui/Spotlight";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

/** Layout per slug — order + bento span on lg (4-col grid). */
const LAYOUT: Record<string, { order: number; span: string; visual: () => ReactNode }> = {
  "ai-automation": { order: 0, span: "md:col-span-2 lg:row-span-2", visual: () => <AgentTerminal /> },
  "web-development": { order: 1, span: "md:col-span-2", visual: () => <BuildLog /> },
  "ui-ux-design": { order: 2, span: "", visual: () => <DesignTokens /> },
  "mobile-apps": { order: 3, span: "lg:row-span-2", visual: () => <PhoneFrame /> },
  branding: { order: 4, span: "", visual: () => <BrandMark /> },
  "digital-marketing": { order: 5, span: "", visual: () => <GrowthBars /> },
  "paid-advertising": { order: 6, span: "md:col-span-2 lg:col-span-1", visual: () => <Funnel /> },
  "maintenance-growth": { order: 7, span: "md:col-span-2 lg:col-span-3", visual: () => <Uptime /> },
};

/** Services as a bento grid — every tile carries a tiny product visual. */
export function ServicesBento() {
  const tiles = [...services]
    .filter((s) => LAYOUT[s.slug])
    .sort((a, b) => LAYOUT[a.slug].order - LAYOUT[b.slug].order);

  return (
    <section id="services" className="section-night py-24 md:py-32">
      <div className="container-x relative">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <span className="eyebrow">01 / Capabilities</span>
            <h2 className="text-shine mt-4 max-w-2xl text-display-lg font-semibold">
              One senior team. Every layer of your product.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-white/50">
            Strategy, design, engineering and growth under one roof — so nothing
            gets lost between agencies.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-3 md:grid-cols-2 lg:auto-rows-[minmax(15rem,auto)] lg:grid-cols-4">
          {tiles.map((s, i) => {
            const cfg = LAYOUT[s.slug];
            return (
              <motion.div
                key={s.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: (i % 4) * 0.06, ease }}
                className={cn("h-full", cfg.span)}
              >
                <Spotlight className="card-night h-full rounded-3xl">
                  <Link href={`/services/${s.slug}`} className="group flex h-full flex-col p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="font-mono text-[0.68rem] text-white/30">{s.index}</span>
                        <h3 className="mt-1 text-[1.05rem] font-medium tracking-tight text-white">{s.title}</h3>
                        <p className="mt-1.5 max-w-xs text-[0.82rem] leading-relaxed text-white/45">{s.tagline}</p>
                      </div>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-white/25 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-royal-400" />
                    </div>
                    <div className="mt-6 flex flex-1 items-end">{cfg.visual()}</div>
                  </Link>
                </Spotlight>
              </motion.div>
            );
          })}

          {/* Closing tile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
            className="md:col-span-2 lg:col-span-1"
          >
            <Link
              href="/contact"
              className="group relative flex h-full min-h-[12rem] flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-royal-400 via-royal to-royal-700 p-6 text-white shadow-glow-lg"
            >
              <span className="font-mono text-[0.68rem] uppercase tracking-widest text-white/70">Not sure?</span>
              <span>
                <span className="block text-lg font-medium leading-snug">
                  Tell us the problem. We&apos;ll map the right build.
                </span>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium">
                  Book a free scoping call
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ visuals */

const AGENT_STEPS = [
  { t: "trigger", c: "new_lead.created -> id: L-2041" },
  { t: "agent", c: "classify intent … ‘website + CRM’ (0.94)" },
  { t: "tool", c: "crm.assign(owner: 'sales-2')" },
  { t: "tool", c: "whatsapp.send(template: 'intro_v3')" },
  { t: "agent", c: "schedule follow-up in 24h" },
  { t: "done", c: "workflow complete · 1.8s" },
];

function AgentTerminal() {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-white/[0.07] bg-black/40 font-mono text-[0.7rem]">
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-3 py-2 text-white/35">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        agent://lead-router
        <span className="ml-auto">run #4,182</span>
      </div>
      <div className="space-y-1.5 p-3.5">
        {AGENT_STEPS.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -6 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.3 + i * 0.28 }}
            className="flex gap-2"
          >
            <span
              className={cn(
                "w-14 shrink-0",
                s.t === "done" ? "text-emerald-300" : s.t === "tool" ? "text-royal-400" : "text-white/35"
              )}
            >
              {s.t}
            </span>
            <span className="truncate text-white/70">{s.c}</span>
          </motion.div>
        ))}
        <span className="inline-block h-3.5 w-1.5 animate-blink bg-royal-400 align-middle" />
      </div>
    </div>
  );
}

function BuildLog() {
  const rows = [
    ["o", "/", "1.9 kB"],
    ["o", "/pricing", "2.4 kB"],
    ["λ", "/api/leads", "0 B"],
  ];
  return (
    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-[1.4fr_1fr]">
      <div className="rounded-xl border border-white/[0.07] bg-black/40 p-3.5 font-mono text-[0.68rem] leading-relaxed">
        <div className="text-white/40">$ next build</div>
        <div className="flex items-center gap-1.5 text-emerald-300"><Check className="h-3 w-3" />Compiled successfully</div>
        {rows.map(([k, r, sz]) => (
          <div key={r} className="flex text-white/55">
            <span className="w-4 text-white/30">{k}</span>
            <span className="flex-1">{r}</span>
            <span className="tabular-nums text-white/35">{sz}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          ["Perf", 99],
          ["A11y", 100],
          ["SEO", 100],
          ["Best", 100],
        ].map(([k, v]) => (
          <div key={k as string} className="flex flex-col items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.02] py-2">
            <span className="relative grid h-9 w-9 place-items-center rounded-full border-2 border-emerald-400/70 font-mono text-[0.65rem] tabular-nums text-emerald-300">
              {v}
            </span>
            <span className="mt-1 font-mono text-[0.55rem] uppercase text-white/35">{k}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DesignTokens() {
  return (
    <div className="w-full space-y-2.5">
      <div className="flex gap-1.5">
        {["bg-royal", "bg-royal-400", "bg-white", "bg-white/40", "bg-night-600"].map((c) => (
          <span key={c} className={`h-7 flex-1 rounded-md border border-white/10 ${c}`} />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-royal px-3 py-1 text-[0.65rem] font-medium text-white">Primary</span>
        <span className="rounded-full border border-white/15 px-3 py-1 text-[0.65rem] text-white/70">Ghost</span>
        <span className="ml-auto flex h-4 w-7 items-center rounded-full bg-royal p-0.5">
          <span className="ml-auto h-3 w-3 rounded-full bg-white" />
        </span>
      </div>
    </div>
  );
}

function PhoneFrame() {
  return (
    <div className="mx-auto w-40 rounded-[1.6rem] border border-white/15 bg-black/60 p-1.5 shadow-night-card">
      <div className="overflow-hidden rounded-[1.25rem] bg-night-700">
        <div className="mx-auto mt-1.5 h-1.5 w-10 rounded-full bg-white/15" />
        <div className="p-3">
          <div className="text-[0.55rem] text-white/40">Good morning</div>
          <div className="text-[0.75rem] font-medium text-white">Today&apos;s orders</div>
          <div className="mt-2 rounded-lg bg-gradient-to-br from-royal-400 to-royal-700 p-2.5">
            <div className="font-mono text-[0.5rem] text-white/70">REVENUE</div>
            <div className="font-mono text-sm tabular-nums text-white">₹48,920</div>
          </div>
          <div className="mt-2 space-y-1.5">
            {["Order #1042", "Order #1041", "Order #1040"].map((o, i) => (
              <div key={o} className="flex items-center justify-between rounded-md bg-white/[0.04] px-2 py-1.5">
                <span className="text-[0.55rem] text-white/70">{o}</span>
                <span className={`h-1.5 w-1.5 rounded-full ${i === 0 ? "bg-royal" : "bg-emerald-400"}`} />
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-around border-t border-white/[0.06] pt-2">
            {[0, 1, 2, 3].map((d) => (
              <span key={d} className={`h-1.5 w-1.5 rounded-full ${d === 0 ? "bg-royal" : "bg-white/20"}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BrandMark() {
  return (
    <div className="flex w-full items-end justify-between">
      <span className="text-5xl font-semibold leading-none tracking-[-0.06em] text-white">Aa</span>
      <div className="flex -space-x-2">
        {["bg-royal", "bg-white", "bg-night-600"].map((c) => (
          <span key={c} className={`h-8 w-8 rounded-full border-2 border-night ${c}`} />
        ))}
      </div>
    </div>
  );
}

function GrowthBars() {
  const bars = [18, 26, 24, 38, 44, 52, 64, 78];
  return (
    <div className="flex h-16 w-full items-end gap-1.5">
      {bars.map((h, i) => (
        <motion.span
          key={i}
          initial={{ height: 0 }}
          whileInView={{ height: `${h}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 + i * 0.05, ease }}
          className={`flex-1 rounded-sm ${i === bars.length - 1 ? "bg-royal" : "bg-white/15"}`}
        />
      ))}
    </div>
  );
}

function Funnel() {
  const rows = [
    ["Impressions", "w-full"],
    ["Clicks", "w-[68%]"],
    ["Leads", "w-[40%]"],
  ];
  return (
    <div className="w-full space-y-1.5">
      {rows.map(([l, w], i) => (
        <div key={l} className="flex items-center gap-2">
          <span className="w-16 font-mono text-[0.58rem] uppercase text-white/35">{l}</span>
          <span className={`h-2 rounded-full ${w} ${i === 2 ? "bg-royal" : "bg-white/15"}`} />
        </div>
      ))}
    </div>
  );
}

function Uptime() {
  // 60 days of checks; a single degraded day keeps it honest-looking.
  const days = Array.from({ length: 60 }, (_, i) => (i === 41 ? "warn" : "ok"));
  return (
    <div className="w-full">
      <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[0.65rem] text-white/45">
        {["Monitoring 24/7", "Security patches", "Daily backups", "Monthly roadmap"].map((x) => (
          <span key={x} className="inline-flex items-center gap-1.5">
            <Check className="h-3 w-3 text-emerald-400" />
            {x}
          </span>
        ))}
      </div>
      <div className="flex h-8 gap-[3px]">
        {days.map((d, i) => (
          <span
            key={i}
            className={`flex-1 rounded-[2px] ${d === "ok" ? "bg-emerald-400/70" : "bg-amber-400/80"}`}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between font-mono text-[0.58rem] text-white/30">
        <span>60 days ago</span>
        <span>99.9% uptime target</span>
        <span>Today</span>
      </div>
    </div>
  );
}
