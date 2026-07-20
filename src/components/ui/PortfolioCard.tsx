"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { cardHover } from "@/lib/motion";

/**
 * DESIGN SYSTEM 2.0 — Portfolio card.
 * Media area (image or custom preview) over a white body with title, tags and
 * an arrow affordance. Lifts on hover; media zooms subtly.
 */
export function PortfolioCard({
  title,
  category,
  href,
  tags = [],
  media,
  className,
}: {
  title: string;
  category?: string;
  href?: string;
  tags?: string[];
  media?: ReactNode;
  className?: string;
}) {
  const inner = (
    <motion.div
      {...cardHover}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-soft transition-all duration-300 ease-premium hover:border-royal/25 hover:shadow-lift",
        className
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-subtle">
        <div className="absolute inset-0 transition-transform duration-500 ease-premium group-hover:scale-[1.04]">
          {media}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            {category && (
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-faint">
                {category}
              </span>
            )}
            <h3 className="mt-1 text-lg font-bold tracking-tight text-ink">
              {title}
            </h3>
          </div>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-ink-muted transition-all duration-200 group-hover:border-royal group-hover:bg-royal group-hover:text-white">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>

        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-line bg-subtle px-2.5 py-1 text-xs font-medium text-ink-muted"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );

  return href ? (
    <Link href={href} className="block h-full">
      {inner}
    </Link>
  ) : (
    inner
  );
}
