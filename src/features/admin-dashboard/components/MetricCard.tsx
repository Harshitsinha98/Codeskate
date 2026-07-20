import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A single KPI tile for the admin overview. */
export function MetricCard({
  label,
  value,
  icon,
  className,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-4xl border border-line bg-surface p-6 shadow-soft", className)}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">{label}</p>
        {icon && <span className="text-ink-faint">{icon}</span>}
      </div>
      <p className="mt-3 text-display-lg tabular-nums text-ink">{value}</p>
    </div>
  );
}
