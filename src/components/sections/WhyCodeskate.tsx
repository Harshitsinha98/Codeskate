"use client";

import { motion } from "framer-motion";
import {
  Users,
  Layers,
  Eye,
  Zap,
  LifeBuoy,
  Cpu,
  ArrowRight,
} from "lucide-react";
import { whyBlocks } from "@/lib/home";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EASE } from "@/lib/motion";

const icons = [Users, Layers, Eye, Zap, LifeBuoy, Cpu];

/** PHASE 3 — "Why CodeSkate": six reasons with a business-value payoff line. */
export function WhyCodeskate() {
  return (
    <section className="relative overflow-hidden border-b border-line warm-wash">
      <div className="container-x relative py-20 md:py-28">
        <SectionHeading
          eyebrow="Why CodeSkate"
          title="Why teams choose us over an agency."
          description="A partner that ships, not just a vendor — senior engineering, full transparency and support that lasts."
          align="center"
        />

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {whyBlocks.map((item, i) => {
            const Icon = icons[i % icons.length];
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: (i % 3) * 0.05, ease: EASE }}
                whileHover={{ y: -6 }}
                className="group flex h-full flex-col rounded-3xl border border-line bg-surface p-7 shadow-soft transition-colors duration-300 hover:border-royal/25 hover:shadow-lift"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-royal/10 text-royal transition-all duration-300 group-hover:rotate-3 group-hover:bg-royal group-hover:text-white">
                  <Icon className="h-[22px] w-[22px]" />
                </span>
                <h3 className="mt-6 text-lg font-semibold tracking-tight text-ink">
                  {item.title}
                </h3>
                <p className="mt-2.5 flex-1 text-sm leading-relaxed text-ink-muted">
                  {item.detail}
                </p>
                <p className="mt-5 inline-flex items-start gap-2 border-t border-line pt-4 text-sm font-medium text-ink">
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-royal" />
                  {item.value}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
