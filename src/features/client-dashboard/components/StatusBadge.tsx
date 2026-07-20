import { cn } from "@/lib/utils";
import type { StatusPresentation } from "@/features/client-dashboard/lib/presentation";

/** A soft status pill using the label + tone resolved in `presentation.ts`. */
export function StatusBadge({
  presentation,
  className,
}: {
  presentation: StatusPresentation;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        presentation.tone,
        className
      )}
    >
      {presentation.label}
    </span>
  );
}
