"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion";

export type AccordionItem = { q: ReactNode; a: ReactNode };

/**
 * DESIGN SYSTEM 2.0 — Accordion.
 * Card-per-item; open card gets an orange border + lift and a rotating plus.
 * `allowMultiple` lets several panels stay open at once.
 */
export function Accordion({
  items,
  defaultOpen = 0,
  allowMultiple = false,
  className,
}: {
  items: AccordionItem[];
  defaultOpen?: number | null;
  allowMultiple?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState<number[]>(
    defaultOpen == null ? [] : [defaultOpen]
  );

  const toggle = (i: number) => {
    setOpen((prev) => {
      const isOpen = prev.includes(i);
      if (allowMultiple) {
        return isOpen ? prev.filter((x) => x !== i) : [...prev, i];
      }
      return isOpen ? [] : [i];
    });
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {items.map((item, i) => {
        const isOpen = open.includes(i);
        return (
          <div
            key={i}
            className={cn(
              "rounded-2xl border bg-surface transition-all duration-300",
              isOpen
                ? "border-royal/30 shadow-lift"
                : "border-line shadow-soft hover:border-royal/20"
            )}
          >
            <button
              type="button"
              onClick={() => toggle(i)}
              className="flex w-full items-center justify-between gap-4 p-5 text-left"
            >
              <span className="text-sm font-semibold text-ink">{item.q}</span>
              <Plus
                className={cn(
                  "h-4 w-4 shrink-0 text-royal transition-transform duration-300",
                  isOpen && "rotate-45"
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 text-sm leading-relaxed text-ink-soft">
                    {item.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
