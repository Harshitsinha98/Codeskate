import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
};

/** Consistent inner-page hero — dark "night" surface, grid + orange glow, mono eyebrow. */
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
        "section-night border-b border-white/[0.06] pb-16 pt-16 md:pb-24 md:pt-24",
        className
      )}
    >
      <div className="night-grid pointer-events-none absolute inset-0" aria-hidden />
      <div className="night-glow pointer-events-none absolute inset-0" aria-hidden />
      <div className="container-x relative">
        <div className="max-w-4xl">
          <Reveal>
            <span className="pill-night">
              <span className="h-1.5 w-1.5 rounded-full bg-royal shadow-[0_0_8px_rgba(255,106,26,0.9)]" />
              {eyebrow}
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="text-shine mt-6 text-display-xl font-semibold">{title}</h1>
          </Reveal>
          {description && (
            <Reveal delay={0.15}>
              <div className="mt-6 max-w-2xl text-lg leading-relaxed text-white/60 [&_p]:text-white/60">
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
