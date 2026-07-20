"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { industries } from "@/lib/content";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

/** Interactive industries list — hover to reveal detail. */
export function Industries() {
  const [active, setActive] = useState(0);

  return (
    <section className="py-24 md:py-32">
      <div className="container-x">
        <SectionHeading
          eyebrow="Industries"
          title="Depth across the sectors that move fast."
          description="We bring pattern recognition from dozens of engagements — so you skip the mistakes and get to what works."
        />

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr]">
          <Reveal>
            <ul className="divide-y divide-line border-y border-line">
              {industries.map((ind, i) => (
                <li
                  key={ind.name}
                  onMouseEnter={() => setActive(i)}
                  className="group relative cursor-default"
                >
                  <div className="flex items-baseline justify-between py-5 transition-all duration-500 group-hover:px-3">
                    <div className="flex items-baseline gap-4">
                      <span className="font-display text-xs tabular-nums text-ink-faint">
                        0{i + 1}
                      </span>
                      <span
                        className={cn(
                          "font-display text-2xl tracking-tight transition-colors duration-300 md:text-3xl",
                          active === i ? "text-ink" : "text-ink-faint"
                        )}
                      >
                        {ind.name}
                      </span>
                    </div>
                    <span className="max-w-xs text-right text-sm text-ink-muted opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:block">
                      {ind.detail}
                    </span>
                  </div>
                  {active === i && (
                    <motion.div
                      layoutId="ind-bar"
                      className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-royal via-violet to-cyan"
                    />
                  )}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="sticky top-28 overflow-hidden rounded-4xl border border-line bg-surface p-8 shadow-soft">
              <div className="mesh-hero noise absolute inset-0 opacity-60" />
              <div className="relative">
                <span className="font-display text-6xl tracking-tight text-ink">
                  0{active + 1}
                </span>
                <h3 className="mt-4 font-display text-3xl tracking-tight text-ink">
                  {industries[active].name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                  {industries[active].detail}
                </p>
                <div className="mt-8 flex gap-2">
                  <span className="rounded-full bg-ink/5 px-3 py-1.5 text-xs text-ink-soft">
                    Strategy
                  </span>
                  <span className="rounded-full bg-ink/5 px-3 py-1.5 text-xs text-ink-soft">
                    Design
                  </span>
                  <span className="rounded-full bg-ink/5 px-3 py-1.5 text-xs text-ink-soft">
                    Build
                  </span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
