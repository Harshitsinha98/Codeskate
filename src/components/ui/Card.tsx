"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { cardHover } from "@/lib/motion";

type CardProps = {
  children: ReactNode;
  className?: string;
  /** Adds a lift-on-hover interaction (shadow + translateY). */
  hover?: boolean;
  /** Highlighted state: orange ring + border. */
  featured?: boolean;
  /** Inner padding scale. */
  padding?: "sm" | "md" | "lg";
  as?: "div" | "article" | "li";
};

const paddings = {
  sm: "p-5",
  md: "p-7",
  lg: "p-8 md:p-10",
};

/**
 * DESIGN SYSTEM 2.0 — Card.
 * White surface, hairline premium border, soft shadow, rounded-3xl.
 * Glass is intentionally NOT used. Set `hover` for the lift interaction.
 */
export function Card({
  children,
  className,
  hover = false,
  featured = false,
  padding = "md",
  as = "div",
}: CardProps) {
  const MotionTag = motion[as];

  return (
    <MotionTag
      {...(hover ? cardHover : {})}
      className={cn(
        "rounded-3xl bg-surface transition-shadow duration-300 ease-premium",
        featured
          ? "border border-royal shadow-lift ring-1 ring-royal"
          : "border border-line shadow-soft",
        hover && !featured && "hover:border-royal/25 hover:shadow-lift",
        paddings[padding],
        className
      )}
    >
      {children}
    </MotionTag>
  );
}
