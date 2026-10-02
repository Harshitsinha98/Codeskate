"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const STEPS = [
  {
    n: "01",
    title: "Scope",
    time: "Week 0",
    detail: "A free call to map goals, users and constraints. You get a fixed-price proposal — not an hourly estimate.",
  },
  {
    n: "02",
    title: "Design",
    time: "Week 1–2",
    detail: "Clickable prototypes on a real design system. You sign off on screens before a line of production code.",
  },
  {
    n: "03",
    title: "Build",
    time: "Week 2–6",
    detail: "Weekly sprints with a live preview link and your client portal updated every step of the way.",
  },
  {
    n: "04",
    title: "Launch & grow",
    time: "Ongoing",
    detail: "A rehearsed go-live with analytics in place, then monitoring, fixes and a roadmap of improvements.",
  },
];

/** Four-step process with a progress line that fills as you scroll. */
export function ProcessStepper() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 60%"] });
  const fill = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section className="border-t border-line bg-subtle py-24 md:py-32">
      <div className="container-x">
        <span className="eyebrow">04 / How we work</span>
        <h2 className="mt-4 max-w-2xl text-display-lg font-semibold text-ink">
          From first call to launch in weeks, not quarters.
        </h2>

        <div ref={ref} className="relative mt-16">
          {/* Track (desktop horizontal, mobile vertical) */}
          <div className="absolute left-0 right-0 top-[11px] hidden h-px bg-line md:block" aria-hidden>
            <motion.div style={{ width: fill }} className="h-full bg-royal shadow-[0_0_10px_rgba(255,106,26,0.8)]" />
          </div>
          <div className="absolute bottom-0 left-[11px] top-0 w-px bg-line md:hidden" aria-hidden>
            <motion.div style={{ height: fill }} className="w-full bg-royal" />
          </div>

          <ol className="grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-6">
            {STEPS.map((s, i) => (
              <motion.li
                key={s.n}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="relative pl-10 md:pl-0"
              >
                <span className="absolute left-0 top-0 grid h-[23px] w-[23px] place-items-center rounded-full border border-line bg-surface md:relative">
                  <span className="h-2 w-2 rounded-full bg-royal" />
                </span>
                <div className="md:mt-7">
                  <div className="flex items-baseline gap-3 font-mono text-[0.7rem] text-ink-muted">
                    <span className="text-royal">{s.n}</span>
                    <span>{s.time}</span>
                  </div>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight text-ink">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{s.detail}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
