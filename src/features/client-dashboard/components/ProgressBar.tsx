import { cn } from "@/lib/utils";

/**
 * Read-only progress bar. `value` is the persisted `progressPct` from the
 * Progress Engine — this component never computes progress, it only renders it.
 */
export function ProgressBar({
  value,
  className,
  showLabel = false,
}: {
  value: number;
  className?: string;
  showLabel?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className="h-2 flex-1 overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-ink transition-all duration-700 ease-premium"
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="w-10 shrink-0 text-right text-xs font-medium tabular-nums text-ink-muted">
          {pct}%
        </span>
      )}
    </div>
  );
}
