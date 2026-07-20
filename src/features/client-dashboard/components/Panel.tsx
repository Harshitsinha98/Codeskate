import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A titled surface panel matching the dashboard's card recipe. */
export function Panel({
  title,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("rounded-4xl border border-line bg-surface p-6 shadow-soft", className)}>
      {(title || action) && (
        <header className="mb-5 flex items-center justify-between gap-4">
          {title && <h2 className="text-sm font-medium text-ink">{title}</h2>}
          {action}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
