"use client";

import { motion } from "framer-motion";
import { Check, Minus } from "lucide-react";
import { comparison } from "@/lib/pricing";
import { cn } from "@/lib/utils";

const defaultColumns = ["Starter", "Growth", "Business", "Enterprise"];
const defaultRows = comparison.map((row) => ({
  feature: row.feature,
  values: [
    row.starter,
    row.growth,
    row.business,
    row.enterprise,
  ] as (boolean | string)[],
}));

export type ComparisonRow = { feature: string; values: (boolean | string)[] };

function Cell({ value }: { value: boolean | string }) {
  if (value === true)
    return (
      <span className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-royal/10 text-royal">
        <Check className="h-3.5 w-3.5" />
      </span>
    );
  if (value === false)
    return (
      <span className="mx-auto flex h-6 w-6 items-center justify-center text-ink-faint">
        <Minus className="h-3.5 w-3.5" />
      </span>
    );
  return (
    <span className="mx-auto block text-center text-xs font-medium text-ink-soft">
      {value}
    </span>
  );
}

/**
 * Animated feature comparison table.
 * Defaults to the sitewide Launch/Scale/Enterprise comparison; pass
 * `columns`/`rows`/`highlightIndex` to compare a different set (e.g. a
 * service's Basic/Standard/Premium packages).
 */
export function ComparisonTable({
  columns = defaultColumns,
  rows = defaultRows,
  highlightIndex = 0,
}: {
  columns?: string[];
  rows?: ComparisonRow[];
  highlightIndex?: number;
} = {}) {
  const gridTemplateColumns = `1.6fr repeat(${columns.length}, 1fr)`;

  return (
    <div className="overflow-hidden rounded-4xl border border-line bg-surface shadow-soft">
      {/* Header */}
      <div
        className="grid border-b border-line bg-subtle"
        style={{ gridTemplateColumns }}
      >
        <div className="p-5 text-xs font-semibold uppercase tracking-[0.12em] text-ink-faint">
          Features
        </div>
        {columns.map((c, i) => (
          <div
            key={c}
            className={cn(
              "p-5 text-center text-sm font-bold tracking-tight",
              i === highlightIndex ? "bg-royal text-white" : "text-ink"
            )}
          >
            {c}
          </div>
        ))}
      </div>

      {/* Rows */}
      {rows.map((row, i) => (
        <motion.div
          key={row.feature}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.03 }}
          className="grid border-b border-line last:border-0"
          style={{ gridTemplateColumns }}
        >
          <div className="flex items-center p-5 text-sm text-ink-soft">
            {row.feature}
          </div>
          {row.values.map((value, colIndex) => (
            <div
              key={colIndex}
              className={cn(
                "flex items-center justify-center p-5",
                colIndex === highlightIndex && "bg-ink/[0.03]"
              )}
            >
              <Cell value={value} />
            </div>
          ))}
        </motion.div>
      ))}
    </div>
  );
}
