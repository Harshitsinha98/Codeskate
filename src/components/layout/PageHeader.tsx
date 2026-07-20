import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
};

/** Consistent inner-page hero — white wash, soft grid, subtle glow. */
export function PageHeader({
  eyebrow,
  title,
  description,
  children,
  className,
}: PageHeaderProps) {
  return (
    <section
      className={cn(
        "mesh-hero relative overflow-hidden border-b border-line pb-16 pt-14 md:pb-20 md:pt-20",
        className
      )}
    >
      <div className="soft-grid absolute inset-0" aria-hidden />
      <div className="container-x relative">
        <div className="max-w-4xl">
          <Reveal>
            <Badge dot>{eyebrow}</Badge>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mt-6 text-display-xl font-bold text-ink">{title}</h1>
          </Reveal>
          {description && (
            <Reveal delay={0.15}>
              <div className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
                {description}
              </div>
            </Reveal>
          )}
          {children && <div className="mt-8">{children}</div>}
        </div>
      </div>
    </section>
  );
}
