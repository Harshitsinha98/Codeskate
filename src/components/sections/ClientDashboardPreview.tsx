"use client";

import { motion } from "framer-motion";
import {
  LogIn,
  LayoutDashboard,
  GitBranch,
  FolderOpen,
  CreditCard,
  MessageSquare,
} from "lucide-react";
import { dashboardFlow } from "@/lib/content";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";

const icons = [
  LogIn,
  LayoutDashboard,
  GitBranch,
  FolderOpen,
  CreditCard,
  MessageSquare,
];

const ease = [0.22, 1, 0.36, 1] as const;

/** Preview of the client portal experience to build post-sale trust. */
export function ClientDashboardPreview() {
  return (
    <section className="border-b border-line bg-base">
      <div className="container-x py-20 md:py-28">
        <SectionHeading
          eyebrow="Client experience"
          title="Full visibility from kickoff to launch."
          description="Every client gets a private portal — track progress, review files, manage payments and talk to your team in one place."
        />

        <div className="mt-14 grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Flow steps */}
          <ol className="relative">
            {/* connector spine */}
            <span
              className="absolute bottom-8 left-6 top-8 w-px bg-line"
              aria-hidden
            />
            <div className="space-y-4">
              {dashboardFlow.map((step, i) => {
                const Icon = icons[i % icons.length];
                return (
                  <Reveal key={step.title} delay={i * 0.05} as="li">
                    <div className="group relative flex items-start gap-4 rounded-2xl border border-line bg-surface p-5 shadow-soft transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:border-royal/25 hover:shadow-lift">
                      <span className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-royal/10 text-royal transition-colors duration-300 group-hover:bg-royal group-hover:text-white">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="rounded-full bg-subtle px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-ink-faint">
                            Step {i + 1}
                          </span>
                          <h3 className="text-base font-semibold tracking-tight text-ink">
                            {step.title}
                          </h3>
                        </div>
                        <p className="mt-1.5 text-sm text-ink-muted">{step.detail}</p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </ol>

          {/* Portal mock */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease }}
            className="lg:sticky lg:top-24"
          >
            <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-lift">
              <div className="flex items-center justify-between border-b border-line bg-subtle px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-md bg-royal" />
                  <span className="text-sm font-semibold text-ink">Client Portal</span>
                </div>
                <span className="rounded-full bg-royal/10 px-2.5 py-1 text-[0.65rem] font-semibold text-royal">
                  In progress
                </span>
              </div>

              <div className="p-5">
                <div className="text-xs font-semibold text-ink-faint">
                  PROJECT TIMELINE
                </div>
                <div className="mt-3 space-y-3">
                  {[
                    { l: "Discovery & scope", done: true },
                    { l: "UI/UX design", done: true },
                    { l: "Development sprint 2", done: false },
                    { l: "QA & launch", done: false },
                  ].map((row, i) => (
                    <div key={row.l} className="flex items-center gap-3">
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full text-[0.6rem] ${
                          row.done
                            ? "bg-royal text-white"
                            : "border border-line bg-surface text-ink-faint"
                        }`}
                      >
                        {row.done ? "✓" : i + 1}
                      </span>
                      <span
                        className={`text-sm ${row.done ? "text-ink" : "text-ink-muted"}`}
                      >
                        {row.l}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-line p-3">
                    <div className="text-xs text-ink-muted">Next milestone</div>
                    <div className="mt-1 text-sm font-bold text-ink">Dev sprint</div>
                  </div>
                  <div className="rounded-lg border border-line p-3">
                    <div className="text-xs text-ink-muted">Status</div>
                    <div className="mt-1 text-sm font-bold text-success">On track</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
