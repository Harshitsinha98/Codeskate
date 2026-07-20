"use client";

import { motion } from "framer-motion";
import { Rocket, RefreshCw, LineChart, Layers } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { GrowthChart } from "@/components/sections/GrowthChart";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * "Built to grow" — pairs an animated growth-trajectory chart with a short
 * narrative of how a product compounds after launch. Growth is shown as a
 * journey (launch → iterate → grow → scale), not a fabricated metric.
 */
const STEPS = [
  {
    icon: Rocket,
    title: "Launch lean",
    detail: "Ship a focused first version fast — real users, real feedback, early.",
  },
  {
    icon: RefreshCw,
    title: "Iterate weekly",
    detail: "Tight sprints turn feedback into improvements you can see every week.",
  },
  {
    icon: LineChart,
    title: "Compound gains",
    detail: "Small, steady wins stack up — performance, conversion and retention.",
  },
  {
    icon: Layers,
    title: "Scale calmly",
    detail: "Architecture built to grow, so more users never means a rewrite.",
  },
];

export function GrowthSection() {
  return (
    <section className="relative overflow-hidden border-b border-line bg-base py-20 md:py-28">
      <span className="accent-glow pointer-events-none absolute inset-0" aria-hidden />
      <div className="container-x relative">
        <SectionHeading
          eyebrow="Built to grow"
          title="We build for the curve, not just the launch."
          description="Great products don't peak on day one — they compound. We design and engineer yours to keep climbing long after go-live."
          align="center"
          className="mb-14"
        />

        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* left: journey steps */}
          <div className="space-y-4">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, x: -18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.1, ease: EASE }}
                className="group flex items-start gap-4 rounded-2xl border border-line bg-surface p-5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-royal/25 hover:shadow-lift"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-royal/10 text-royal transition-colors duration-300 group-hover:bg-royal group-hover:text-white">
                  <s.icon className="h-5 w-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="rounded-full bg-subtle px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-ink-faint">
                      0{i + 1}
                    </span>
                    <h3 className="text-base font-semibold tracking-tight text-ink">
                      {s.title}
                    </h3>
                  </div>
                  <p className="mt-1.5 text-sm text-ink-muted">{s.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* right: animated chart */}
          <Reveal delay={0.1}>
            <GrowthChart />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
