"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion";

export type TimelineStep = {
  phase?: string;
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
};

/**
 * DESIGN SYSTEM 2.0 — Timeline.
 * Vertical connector rail with numbered/iconed nodes and staggered reveal.
 */
export function Timeline({
  steps,
  className,
}: {
  steps: TimelineStep[];
  className?: string;
}) {
  return (
    <ol className={cn("relative flex flex-col gap-8", className)}>
      {/* rail */}
      <span
        className="absolute left-[1.35rem] top-2 bottom-2 w-px bg-line"
        aria-hidden
      />
      {steps.map((step, i) => (
        <motion.li
          key={step.title}
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: i * 0.08, ease: EASE }}
          className="relative flex gap-5"
        >
          <span className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-sm font-bold text-royal shadow-soft">
            {step.icon ?? step.phase ?? String(i + 1).padStart(2, "0")}
          </span>
          <div className="pt-1.5">
            {step.phase && !step.icon && (
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-faint">
                {step.phase}
              </span>
            )}
            <h3 className="text-base font-bold tracking-tight text-ink">
              {step.title}
            </h3>
            {step.description && (
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                {step.description}
              </p>
            )}
          </div>
        </motion.li>
      ))}
    </ol>
  );
}
