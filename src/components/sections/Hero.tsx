"use client";

import { motion, useMotionValue, useSpring, useMotionTemplate } from "framer-motion";
import {
  CheckCircle2,
  PhoneCall,
  ArrowUpRight,
  Bell,
  Rocket,
  Sparkles,
  MessageCircle,
  UserPlus,
} from "lucide-react";
import { useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const ease = [0.22, 1, 0.36, 1] as const;

const capabilities = ["Web & SaaS", "Mobile Apps", "AI Automation"];

/**
 * Hero.
 * Left: badge, headline, subheading, dual CTA, a live-product callout that
 * points to our own CodeSkate CRM.
 * Right: a live CodeSkate CRM lead-pipeline mock with floating widgets that
 * mirror the product's real features (call tracker, WhatsApp automation,
 * lead capture). A faint glow follows the cursor across the section.
 */
export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(28);
  const sx = useSpring(glowX, { stiffness: 60, damping: 20 });
  const sy = useSpring(glowY, { stiffness: 60, damping: 20 });
  const glowLeft = useMotionTemplate`${sx}%`;
  const glowTop = useMotionTemplate`${sy}%`;

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = sectionRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    glowX.set(((e.clientX - r.left) / r.width) * 100);
    glowY.set(((e.clientY - r.top) / r.height) * 100);
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={onMove}
      className="mesh-hero noise relative overflow-hidden border-b border-line"
    >
      <div className="soft-grid pointer-events-none absolute inset-0" aria-hidden />
      {/* cursor-following glow */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-royal/[0.07] blur-3xl"
        style={{ left: glowLeft, top: glowTop }}
      />

      <div className="container-x relative grid grid-cols-1 items-center gap-14 py-20 md:py-28 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        {/* ---------------- Left ---------------- */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-royal/25 bg-royal/5 px-4 py-1.5 text-xs font-semibold text-royal">
              <Rocket className="h-3.5 w-3.5" />
              We build products — and ship our own
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.06, ease }}
            className="mt-6 text-display-xl font-bold leading-[1.04] tracking-tight text-ink"
          >
            <span className="block">We engineer software</span>
            <span className="block">
              that helps businesses{" "}
              <span className="relative inline-block text-royal">
                scale
                <motion.span
                  aria-hidden
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.7, delay: 0.55, ease }}
                  className="absolute -bottom-1 left-0 h-[3px] w-full origin-left rounded-full bg-royal/40"
                />
              </span>
              .
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.14, ease }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft"
          >
            Websites, SaaS platforms, mobile apps and AI automation — designed
            and built by a small senior team. The same engineering that powers
            our own product,{" "}
            <span className="font-semibold text-ink">CodeSkate CRM</span>.
          </motion.p>

          {/* Capability chips */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease }}
            className="mt-6 flex flex-wrap gap-2"
          >
            {capabilities.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-medium text-ink-soft"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                {c}
              </span>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.28, ease }}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <Button href="/contact" variant="primary" size="lg" arrow>
              Start Your Project
            </Button>
            <Button href="/contact" variant="secondary" size="lg">
              Book Consultation
            </Button>
          </motion.div>

          {/* Live product callout */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10"
          >
            <Link
              href="/products/codeskate-crm"
              className="group inline-flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-royal/10 text-royal">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="text-left">
                <span className="block text-sm font-semibold text-ink">
                  Meet CodeSkate CRM
                </span>
                <span className="block text-xs text-ink-muted">
                  Our live lead-management product — see it in action
                </span>
              </span>
              <ArrowUpRight className="h-4 w-4 text-ink-muted transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </motion.div>
        </div>

        {/* ---------------- Right: CRM pipeline mock ---------------- */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease }}
          className="relative"
        >
          <CrmMock />

          {/* Floating widgets — real CRM features */}
          <FloatingWidget
            className="-left-4 -top-4 sm:-left-6"
            delay={0.9}
            float={-8}
            tone="royal"
            icon={<UserPlus className="h-4 w-4" />}
            title="New Lead Captured"
            sub="Website form · auto-assigned"
          />
          <FloatingWidget
            className="-right-3 top-1/3 sm:-right-6"
            delay={1.05}
            float={7}
            tone="success"
            icon={<PhoneCall className="h-4 w-4" />}
            title="Call Logged"
            sub="Native call tracker · 3m 12s"
          />
          <FloatingWidget
            className="-bottom-5 -left-3 sm:-left-5"
            delay={1.2}
            float={-6}
            tone="success"
            icon={<MessageCircle className="h-4 w-4" />}
            title="WhatsApp Sent"
            sub="Follow-up automation"
          />
        </motion.div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function FloatingWidget({
  className,
  delay,
  float,
  tone,
  icon,
  title,
  sub,
}: {
  className: string;
  delay: number;
  float: number;
  tone: "success" | "royal";
  icon: React.ReactNode;
  title: string;
  sub: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 180, damping: 14, mass: 0.2 });
  const sy = useSpring(my, { stiffness: 180, damping: 14, mass: 0.2 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - (r.left + r.width / 2)) * 0.3);
    my.set((e.clientY - (r.top + r.height / 2)) * 0.3);
  };
  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  const toneClass =
    tone === "success"
      ? "bg-success/10 text-success"
      : "bg-royal/10 text-royal";

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay, ease }}
      style={{ x: sx, y: sy }}
      className={`absolute z-20 hidden sm:block ${className}`}
    >
      <motion.div
        animate={{ y: [0, float, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="flex items-center gap-2.5 rounded-2xl border border-line bg-white/90 px-3.5 py-2.5 shadow-lift backdrop-blur-md"
      >
        <span className={`relative flex h-8 w-8 items-center justify-center rounded-full ${toneClass}`}>
          {icon}
        </span>
        <div className="pr-1">
          <div className="text-xs font-semibold text-ink">{title}</div>
          <div className="text-[0.65rem] text-ink-muted">{sub}</div>
        </div>
      </motion.div>
    </motion.div>
  );
}

const STAGES = [
  { name: "New", count: 12, tone: "bg-royal/15 text-royal" },
  { name: "Contacted", count: 8, tone: "bg-warning/15 text-warning" },
  { name: "Qualified", count: 5, tone: "bg-violet/15 text-violet" },
  { name: "Won", count: 3, tone: "bg-success/15 text-success" },
];

const LEADS = [
  { name: "Priya Sharma", src: "Website form", stage: "New", tone: "bg-royal/10 text-royal" },
  { name: "Rahul Verma", src: "WhatsApp", stage: "Contacted", tone: "bg-warning/10 text-warning" },
  { name: "Aisha Khan", src: "Referral", stage: "Qualified", tone: "bg-violet/10 text-violet" },
];

function CrmMock() {
  return (
    <div className="relative overflow-hidden rounded-4xl border border-line bg-surface shadow-lift">
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 border-b border-line bg-subtle px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-danger/40" />
        <span className="h-3 w-3 rounded-full bg-warning/50" />
        <span className="h-3 w-3 rounded-full bg-success/50" />
        <span className="ml-3 flex h-6 flex-1 items-center gap-1.5 rounded-md border border-line bg-surface px-3 text-[0.6rem] text-ink-faint">
          <span className="h-2 w-2 rounded-full bg-success" />
          crm.codeskate.com/leads
        </span>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="hidden w-36 shrink-0 border-r border-line bg-subtle/70 p-4 sm:block">
          <div className="flex items-center gap-2">
            <span className="grid h-5 w-5 place-items-center rounded-md bg-royal text-[0.6rem] font-bold text-white">
              ⚡
            </span>
            <span className="text-[0.65rem] font-bold text-ink">CodeSkate CRM</span>
          </div>
          <div className="mt-6 space-y-1">
            {["Lead Hub", "Call Tracker", "WhatsApp", "Employees", "Billing", "Reports"].map(
              (label, i) => (
                <div
                  key={label}
                  className={`rounded-lg px-2.5 py-1.5 text-[0.65rem] font-medium ${
                    i === 0 ? "bg-royal/10 text-royal" : "text-ink-muted"
                  }`}
                >
                  {label}
                </div>
              )
            )}
          </div>
        </div>

        {/* Main panel */}
        <div className="flex-1 p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-ink">Lead Pipeline</div>
              <div className="mt-0.5 text-[0.6rem] text-ink-muted">
                28 active leads · this week
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-[0.58rem] font-semibold text-success">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
                </span>
                Live
              </span>
              <span className="relative flex h-6 w-6 items-center justify-center rounded-full border border-line text-ink-muted">
                <Bell className="h-3 w-3" />
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-royal" />
              </span>
            </div>
          </div>

          {/* Pipeline stages */}
          <div className="mt-4 grid grid-cols-4 gap-2">
            {STAGES.map((s, i) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.7 + i * 0.08, ease }}
                className="rounded-xl border border-line p-2.5"
              >
                <div className="text-[0.55rem] font-medium text-ink-muted">
                  {s.name}
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-sm font-bold text-ink">{s.count}</span>
                  <span
                    className={`inline-flex h-4 items-center rounded-full px-1.5 text-[0.5rem] font-bold ${s.tone}`}
                  >
                    leads
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Lead list */}
          <div className="mt-3 rounded-xl border border-line p-3">
            <div className="flex items-center justify-between text-[0.6rem] font-semibold text-ink">
              <span>Recent Leads</span>
              <span className="flex items-center text-[0.55rem] font-semibold text-success">
                <ArrowUpRight className="h-2.5 w-2.5" />
                +18% this week
              </span>
            </div>
            <div className="mt-2.5 space-y-2">
              {LEADS.map((lead, i) => (
                <motion.div
                  key={lead.name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 1 + i * 0.1, ease }}
                  className="flex items-center gap-2.5"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-subtle text-[0.55rem] font-bold text-ink-muted">
                    {lead.name.charAt(0)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[0.62rem] font-semibold text-ink">
                      {lead.name}
                    </div>
                    <div className="truncate text-[0.55rem] text-ink-muted">
                      {lead.src}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[0.5rem] font-bold ${lead.tone}`}
                  >
                    {lead.stage}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
