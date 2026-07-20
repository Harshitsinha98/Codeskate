import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * DESIGN SYSTEM 2.0 — Hero shell.
 * Reusable hero backdrop (white mesh wash + faint blueprint grid + film grain)
 * and a two-column content slot. Purely structural — pages supply the copy and
 * the right-hand visual.
 */
export function HeroShell({
  children,
  right,
  className,
  contentClassName,
}: {
  children: ReactNode;
  right?: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <section
      className={cn(
        "mesh-hero noise relative overflow-hidden border-b border-line",
        className
      )}
    >
      <span className="soft-grid pointer-events-none absolute inset-0" aria-hidden />
      <div className="container-x relative py-20 md:py-28 lg:py-32">
        {right ? (
          <div
            className={cn(
              "grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-16",
              contentClassName
            )}
          >
            <div>{children}</div>
            <div>{right}</div>
          </div>
        ) : (
          <div className={cn("mx-auto max-w-3xl text-center", contentClassName)}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
