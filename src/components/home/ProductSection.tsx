"use client";

import { motion } from "framer-motion";
import { Check, FileText, MessageCircle, PhoneCall, UserPlus, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Spotlight } from "@/components/ui/Spotlight";
import { waLink } from "@/lib/site";

const ease = [0.22, 1, 0.36, 1] as const;

const enquire = waLink(
  "Hi CodeSkate, I'm interested in CodeSkate CRM for lead management. Can you share pricing and a demo?"
);

const FLOW = [
  { icon: UserPlus, label: "Lead captured", meta: "Website form", tone: "text-royal-400 bg-royal/15" },
  { icon: Zap, label: "Auto-assigned", meta: "Round-robin · sales-2", tone: "text-white/70 bg-white/[0.07]" },
  { icon: MessageCircle, label: "WhatsApp intro sent", meta: "Template · intro_v3", tone: "text-emerald-300 bg-emerald-400/10" },
  { icon: PhoneCall, label: "Call logged", meta: "Native tracker · 3m 12s", tone: "text-white/70 bg-white/[0.07]" },
];

const MILESTONES = [
  { label: "Discovery & scope", done: true },
  { label: "Design system + UI", done: true },
  { label: "Build · sprint 3 of 4", done: false, active: true },
  { label: "Launch & handover", done: false },
];

/**
 * "We run a product" — CodeSkate CRM + the client portal every customer gets.
 * Replaces the old CRM highlight, growth section and dashboard preview.
 */
export function ProductSection() {
  return (
    <section className="section-night py-24 md:py-32">
      <div className="night-glow pointer-events-none absolute inset-0 opacity-70" aria-hidden />
      <div className="container-x relative">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">03 / Built in-house</span>
          <h2 className="text-shine mt-4 text-display-lg font-semibold">
            We don&apos;t just build products. We run one.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/50">
            CodeSkate CRM is in production with real sales teams. The same
            engineering, the same rigour — that&apos;s what goes into your build.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-3 lg:grid-cols-[1.2fr_1fr]">
          {/* CRM automation */}
          <Spotlight className="card-night rounded-3xl">
            <div className="p-7 md:p-9">
              <span className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-royal-400">CodeSkate CRM</span>
              <h3 className="mt-3 text-xl font-medium tracking-tight text-white md:text-2xl">
                Every lead captured. Every follow-up automatic.
              </h3>
              <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/55">
                {["Native call tracker", "WhatsApp automation", "Web + Android"].map((p) => (
                  <li key={p} className="inline-flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    {p}
                  </li>
                ))}
              </ul>

              <div className="relative mt-8 rounded-2xl border border-white/[0.07] bg-black/30 p-4">
                <span className="absolute bottom-8 left-[2.15rem] top-8 w-px bg-gradient-to-b from-royal/60 via-white/10 to-transparent" aria-hidden />
                <div className="space-y-3">
                  {FLOW.map(({ icon: Icon, label, meta, tone }, i) => (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.45, delay: 0.15 + i * 0.15, ease }}
                      className="relative flex items-center gap-3"
                    >
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${tone}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="flex-1">
                        <span className="block text-sm text-white">{label}</span>
                        <span className="block font-mono text-[0.65rem] text-white/35">{meta}</span>
                      </span>
                      <span className="font-mono text-[0.6rem] tabular-nums text-white/25">
                        +{(i * 0.6).toFixed(1)}s
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button href="/products/codeskate-crm" variant="glow" arrow>
                  Explore CodeSkate CRM
                </Button>
                <Button href={enquire} variant="night" external>
                  Get a demo on WhatsApp
                </Button>
              </div>
            </div>
          </Spotlight>

          {/* Client portal */}
          <Spotlight className="card-night rounded-3xl">
            <div className="flex h-full flex-col p-7 md:p-9">
              <span className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-royal-400">Client portal</span>
              <h3 className="mt-3 text-xl font-medium tracking-tight text-white md:text-2xl">
                Watch your project get built — live.
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/50">
                Every client gets a private dashboard: milestones, files,
                invoices and a direct line to the team. No chasing for updates.
              </p>

              <div className="mt-8 flex-1 rounded-2xl border border-white/[0.07] bg-black/30 p-5">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-white">Your project</span>
                  <span className="font-mono text-xs tabular-nums text-white/60">68%</span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "68%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: 0.2, ease }}
                    className="h-full rounded-full bg-gradient-to-r from-royal-700 to-royal-400 shadow-[0_0_12px_rgba(255,106,26,0.7)]"
                  />
                </div>
                <ul className="mt-5 space-y-3">
                  {MILESTONES.map((m) => (
                    <li key={m.label} className="flex items-center gap-3 text-sm">
                      <span
                        className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
                          m.done
                            ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                            : m.active
                              ? "border-royal/60 bg-royal/15"
                              : "border-white/10"
                        }`}
                      >
                        {m.done ? (
                          <Check className="h-3 w-3" />
                        ) : m.active ? (
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-royal-400" />
                        ) : null}
                      </span>
                      <span className={m.done || m.active ? "text-white/80" : "text-white/35"}>{m.label}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                  <FileText className="h-4 w-4 text-white/40" />
                  <span className="flex-1 truncate text-xs text-white/60">homepage-v3.fig · uploaded by design</span>
                  <span className="font-mono text-[0.6rem] text-white/30">2h</span>
                </div>
              </div>
            </div>
          </Spotlight>
        </div>
      </div>
    </section>
  );
}
