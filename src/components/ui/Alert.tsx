import type { ReactNode } from "react";
import { Info, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertTone = "info" | "success" | "warning" | "danger";

const config: Record<
  AlertTone,
  { wrap: string; icon: ReactNode; title: string }
> = {
  info: {
    wrap: "border-royal/20 bg-royal/5",
    icon: <Info className="h-5 w-5 text-royal" />,
    title: "text-royal",
  },
  success: {
    wrap: "border-success/20 bg-success/10",
    icon: <CheckCircle2 className="h-5 w-5 text-success" />,
    title: "text-success",
  },
  warning: {
    wrap: "border-warning/20 bg-warning/10",
    icon: <AlertTriangle className="h-5 w-5 text-warning" />,
    title: "text-warning",
  },
  danger: {
    wrap: "border-danger/20 bg-danger/10",
    icon: <XCircle className="h-5 w-5 text-danger" />,
    title: "text-danger",
  },
};

/** DESIGN SYSTEM 2.0 — inline alert / callout. */
export function Alert({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: AlertTone;
  title?: string;
  children?: ReactNode;
  className?: string;
}) {
  const c = config[tone];
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl border p-4",
        c.wrap,
        className
      )}
      role="alert"
    >
      <span className="mt-0.5 shrink-0">{c.icon}</span>
      <div className="flex flex-col gap-1">
        {title && (
          <span className={cn("text-sm font-semibold", c.title)}>{title}</span>
        )}
        {children && (
          <div className="text-sm leading-relaxed text-ink-soft">{children}</div>
        )}
      </div>
    </div>
  );
}
