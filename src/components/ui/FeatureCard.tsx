"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { cardHover } from "@/lib/motion";

/**
 * DESIGN SYSTEM 2.0 — Feature card.
 * Icon tile + title + description. Icon tile fills orange on hover; whole card
 * lifts. White surface, premium border, soft shadow.
 */
export function FeatureCard({
  icon,
  title,
  description,
  className,
}: {
  icon: ReactNode;
  title: string;
  description: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      {...cardHover}
      className={cn(
        "group flex flex-col rounded-3xl border border-line bg-surface p-7 shadow-soft transition-all duration-300 ease-premium hover:border-royal/25 hover:shadow-lift",
        className
      )}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-subtle text-royal transition-colors duration-300 group-hover:border-royal group-hover:bg-royal group-hover:text-white">
        {icon}
      </span>
      <h3 className="mt-5 text-lg font-bold tracking-tight text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{description}</p>
    </motion.div>
  );
}
