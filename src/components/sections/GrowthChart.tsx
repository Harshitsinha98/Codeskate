"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

/**
 * Growth chart — an animated, abstract upward-trend area chart. The line draws
 * itself on scroll, the area fades in, and milestone dots pop along the path.
 * Intentionally label-free of concrete metrics (no fabricated percentages) — it
 * illustrates trajectory, not a specific result. Pure decoration.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

// Rising path across a 420×240 viewBox (y grows downward, so smaller y = higher).
const LINE = "M20 200 C 80 195, 110 165, 150 155 S 220 135, 260 100 S 340 60, 400 28";
const AREA = `${LINE} L 400 220 L 20 220 Z`;

// Milestone dots along the trajectory + their journey labels.
const MILESTONES = [
  { x: 20, y: 200, label: "Launch" },
  { x: 150, y: 155, label: "Iterate" },
  { x: 260, y: 100, label: "Grow" },
  { x: 400, y: 28, label: "Scale" },
];

export function GrowthChart() {
  return (
    <div className="relative w-full">
      <div className="relative overflow-hidden rounded-4xl border border-line bg-surface p-6 shadow-lift md:p-8">
        {/* header row */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-ink">Growth trajectory</div>
            <div className="mt-0.5 text-xs text-ink-muted">
              From first launch to scale
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
            <TrendingUp className="h-3.5 w-3.5" />
            Upward
          </span>
        </div>

        {/* chart */}
        <div className="relative mt-6">
          <svg
            viewBox="0 0 420 240"
            className="w-full"
            fill="none"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="growth-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F97316" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="growth-line" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#FB923C" />
                <stop offset="100%" stopColor="#EA580C" />
              </linearGradient>
            </defs>

            {/* faint gridlines */}
            {[60, 110, 160].map((y) => (
              <line
                key={y}
                x1="20"
                x2="400"
                y1={y}
                y2={y}
                stroke="#E5E7EB"
                strokeWidth="1"
                strokeDasharray="3 6"
              />
            ))}

            {/* area fill */}
            <motion.path
              d={AREA}
              fill="url(#growth-area)"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: 0.6, ease: EASE }}
            />

            {/* trend line — draws on scroll */}
            <motion.path
              d={LINE}
              stroke="url(#growth-line)"
              strokeWidth="3.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 1.4, ease: EASE }}
            />

            {/* milestone dots */}
            {MILESTONES.map((m, i) => (
              <motion.g
                key={m.label}
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.28, ease: EASE }}
                style={{ transformOrigin: `${m.x}px ${m.y}px` }}
              >
                <circle cx={m.x} cy={m.y} r="9" fill="#F97316" opacity="0.14" />
                <circle
                  cx={m.x}
                  cy={m.y}
                  r="4.5"
                  fill="#fff"
                  stroke="#EA580C"
                  strokeWidth="2.5"
                />
              </motion.g>
            ))}
          </svg>

          {/* journey labels under the chart */}
          <div className="mt-3 flex justify-between px-1">
            {MILESTONES.map((m, i) => (
              <motion.span
                key={m.label}
                initial={{ opacity: 0, y: 6 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: 0.7 + i * 0.28, ease: EASE }}
                className="text-[0.7rem] font-medium text-ink-muted"
              >
                {m.label}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
