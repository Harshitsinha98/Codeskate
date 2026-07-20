"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { ServiceAddon } from "@/types/catalog";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

/** Step 4 — optional add-ons, multi-select, instant pricing update. */
export function StepAddons({
  addons,
  selectedIds,
  onToggle,
}: {
  addons: ServiceAddon[];
  selectedIds: string[];
  onToggle: (addonId: string) => void;
}) {
  if (addons.length === 0) {
    return (
      <p className="rounded-2xl border border-line bg-surface p-8 text-center text-sm text-ink-muted">
        No add-ons are available for this service yet — you can skip this step.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {addons.map((addon, i) => {
        const selected = selectedIds.includes(addon.id);
        return (
          <motion.button
            key={addon.id}
            type="button"
            onClick={() => onToggle(addon.id)}
            aria-pressed={selected}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className={cn(
              "flex h-full flex-col rounded-2xl border p-6 text-left transition-all duration-300",
              selected
                ? "border-royal bg-royal/5 shadow-soft"
                : "border-line bg-surface hover:border-ink/20"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-lg tracking-tight text-ink">{addon.name}</h3>
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                  selected ? "border-transparent bg-royal text-white" : "border-line text-transparent"
                )}
              >
                <Check className="h-3.5 w-3.5" />
              </span>
            </div>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">
              {addon.description}
            </p>
            <p className="mt-4 text-sm font-medium text-ink">
              {addon.priceFrom ? formatMoney(addon.priceFrom) : addon.priceLabel}
            </p>
          </motion.button>
        );
      })}
    </div>
  );
}
