import type { Metadata } from "next";
import {
  Timer,
  ShieldCheck,
  BellRing,
  Gauge,
  Users,
  ArrowUpRight,
  Check,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { CTA } from "@/components/sections/CTA";
import { waLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "BreakIQ — Break & workforce management, built in-house",
  description:
    "BreakIQ is an internal tool we built to solve break and workforce management for our own office — real-time tracking, policy enforcement and threshold alerts.",
  alternates: { canonical: "/products/breakiq" },
};

const DEMO_URL = "https://breakiq.in";

const enquire = waLink(
  "Hi CodeSkate, I saw BreakIQ and I'd like to know if you can build something similar for my team."
);

const FEATURES = [
  {
    icon: Timer,
    title: "Real-time break tracking",
    body: "See who's on a break and for how long, live — no spreadsheets, no manual sign-in sheets.",
  },
  {
    icon: ShieldCheck,
    title: "Policy enforcement",
    body: "Set break rules once and let the system enforce them consistently across the whole team.",
  },
  {
    icon: BellRing,
    title: "Threshold alerts",
    body: "Get notified when a break runs long or limits are crossed, so issues are handled in the moment.",
  },
  {
    icon: Users,
    title: "Workforce overview",
    body: "A single dashboard showing team availability at a glance — useful for shift-based work.",
  },
  {
    icon: Gauge,
    title: "Built for speed",
    body: "A lightweight real-time interface that stays clear and responsive on any device.",
  },
];

const OUTCOMES = [
  "Solved a real problem in our own office",
  "Live and in daily use",
  "Real-time, not end-of-day reports",
  "Built to be simple for staff",
];

export default function BreakIqPage() {
  return (
    <>
      <PageHeader
        eyebrow="Product · BreakIQ"
        title="A break & workforce tool we built for ourselves."
        description="BreakIQ started as an internal project to fix break and workforce management in our own office. It's live at breakiq.in and runs every day — a small example of how we turn a real operational problem into working software."
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Button href={enquire} variant="primary" size="lg" external>
            Want something like this?
          </Button>
          <Button href={DEMO_URL} variant="secondary" size="lg" external>
            Visit BreakIQ
          </Button>
        </div>
      </PageHeader>

      {/* Outcomes strip */}
      <section className="border-y border-line bg-surface/50 py-10">
        <div className="container-x">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {OUTCOMES.map((o, i) => (
              <Reveal key={o} delay={i * 0.06}>
                <div className="flex items-center gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-success/10 text-success">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-sm text-ink-soft">{o}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-28">
        <div className="container-x">
          <SectionHeading
            eyebrow="What it does"
            title="Everything we needed to manage breaks — in one screen."
            align="center"
            className="mb-14"
          />
          <Stagger className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <StaggerItem key={f.title}>
                <div className="flex h-full flex-col rounded-3xl border border-line bg-surface p-6 shadow-soft">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-royal/10 text-royal">
                    <f.icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 font-display text-lg tracking-tight text-ink">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {f.body}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Live preview */}
      <section className="border-t border-line bg-base py-20 md:py-28">
        <div className="container-x">
          <SectionHeading
            eyebrow="See it live"
            title="BreakIQ, running in production."
            description="This is the real BreakIQ we use in our office. Open it in a new tab to take a look."
            align="center"
            className="mb-12"
          />
          <Reveal>
            <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-lift">
              <div className="flex items-center gap-2 border-b border-line bg-subtle px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-danger/60" />
                <span className="h-3 w-3 rounded-full bg-royal/60" />
                <span className="h-3 w-3 rounded-full bg-success/60" />
                <span className="ml-3 truncate text-xs text-ink-faint">
                  {DEMO_URL.replace(/^https?:\/\//, "")}
                </span>
                <a
                  href={DEMO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-royal transition-colors hover:text-royal-600"
                >
                  Open live
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
              <a
                href={DEMO_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open BreakIQ live"
                className="block"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://s.wordpress.com/mshots/v1/${encodeURIComponent(
                    DEMO_URL
                  )}?w=1400&h=875`}
                  alt="BreakIQ live product preview"
                  loading="lazy"
                  className="w-full object-cover object-top"
                />
              </a>
            </div>
          </Reveal>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href={enquire} variant="primary" size="lg" external>
              Build something like this
            </Button>
            <a
              href={DEMO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-semibold text-royal transition-colors hover:text-royal-600"
            >
              Visit breakiq.in
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <CTA />
    </>
  );
}
