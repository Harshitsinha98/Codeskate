import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A calm empty-state panel: icon, title, one line of copy, optional action. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-4xl border border-dashed border-line bg-surface/60 px-6 py-16 text-center",
        className
      )}
    >
      {icon && <div className="mb-4 text-ink-faint">{icon}</div>}
      <p className="text-base font-medium text-ink">{title}</p>
      {description && <p className="mt-1.5 max-w-sm text-sm text-ink-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
