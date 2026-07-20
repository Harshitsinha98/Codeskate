import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "neutral" | "brand" | "success" | "warning" | "danger";

const tones: Record<BadgeTone, string> = {
  neutral: "border-line bg-subtle text-ink-soft",
  brand: "border-royal/20 bg-royal/5 text-royal",
  success: "border-success/20 bg-success/10 text-success",
  warning: "border-warning/20 bg-warning/10 text-warning",
  danger: "border-danger/20 bg-danger/10 text-danger",
};

const dotColors: Record<BadgeTone, string> = {
  neutral: "bg-royal",
  brand: "bg-royal",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

/** Small pill label with an optional live-dot indicator and tone. */
export function Badge({
  children,
  className,
  dot = false,
  tone = "neutral",
}: {
  children: ReactNode;
  className?: string;
  dot?: boolean;
  tone?: BadgeTone;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold",
        tones[tone],
        className
      )}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          <span
            className={cn(
              "relative inline-flex h-1.5 w-1.5 rounded-full",
              dotColors[tone]
            )}
          />
        </span>
      )}
      {children}
    </span>
  );
}
