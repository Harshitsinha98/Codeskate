"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  ClipboardList,
  PenTool,
  Code2,
  TestTube,
  Rocket,
  LifeBuoy,
} from "lucide-react";
import { processPhases } from "@/lib/home";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EASE } from "@/lib/motion";

const icons = [Search, ClipboardList, PenTool, Code2, TestTube, Rocket, LifeBuoy];

/** PHASE 3 — Interactive process: horizontal on desktop, vertical on mobile. */
export function ProcessTimeline() {
  const [active, setActive] = useState(0);

  return (
    <section className="border-b border-line bg-subtle py-20 md:py-28">
      <div className="container-x">
        <SectionHeading
          eyebrow="How we work"
          title="A clear process from idea to launch — and beyond."
          description="Seven deliberate steps. No black boxes, no surprises. You always know what's happening, what's next and what it costs."
          align="center"
        />

        {/* Desktop: horizontal timeline */}
        <div className="mt-16 hidden lg:block">
          <div className="relative">
            <div className="absolute left-0 right-0 top-6 h-px bg-line" aria-hidden />
            <div className="relative grid grid-cols-7 gap-3">
              {processPhases.map((step, i) => {
                const Icon = icons[i % icons.length];
                const isActive = active === i;
                return (
                  <motion.div
                    key={step.phase}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.4, delay: i * 0.06, ease: EASE }}
                    onMouseEnter={() => setActive(i)}
                    className="flex flex-col items-center text-center"
                  >
                    <span
                      className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border shadow-soft transition-all duration-300 ${
                        isActive
                          ? "border-royal bg-royal text-white"
                          : "border-line bg-surface text-royal"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="mt-4 text-[0.7rem] font-bold uppercase tracking-wide text-ink-faint">
                      {step.phase}
                    </span>
                    <h3 className="mt-1 text-sm font-bold tracking-tight text-ink">
                      {step.title}
                    </h3>
                    <motion.p
                      animate={{ opacity: isActive ? 1 : 0.55 }}
                      className="mt-2 text-xs leading-relaxed text-ink-muted"
                    >
                      {step.detail}
                    </motion.p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile: vertical timeline */}
        <div className="relative mx-auto mt-14 max-w-xl lg:hidden">
          <div className="absolute bottom-6 left-6 top-6 w-px bg-line" aria-hidden />
          <ol className="space-y-5">
            {processPhases.map((step, i) => {
              const Icon = icons[i % icons.length];
              return (
                <motion.li
                  key={step.phase}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: i * 0.05, ease: EASE }}
                  className="relative flex items-start gap-5"
                >
                  <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-royal shadow-soft">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="flex-1 rounded-3xl border border-line bg-surface p-5 shadow-soft">
                    <span className="text-[0.7rem] font-bold uppercase tracking-wide text-ink-faint">
                      {step.phase}
                    </span>
                    <h3 className="text-base font-bold tracking-tight text-ink">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                      {step.detail}
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
