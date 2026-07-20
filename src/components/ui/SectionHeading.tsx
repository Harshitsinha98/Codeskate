import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/Reveal";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
  titleClassName?: string;
};

/** Consistent section header: eyebrow + bold title + description. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  titleClassName,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className
      )}
    >
      {eyebrow && (
        <Reveal>
          <span className="eyebrow">{eyebrow}</span>
        </Reveal>
      )}
      <Reveal delay={0.05}>
        <h2
          className={cn(
            "text-display-lg font-bold text-ink max-w-3xl",
            align === "center" && "mx-auto",
            titleClassName
          )}
        >
          {title}
        </h2>
      </Reveal>
      {description && (
        <Reveal delay={0.1}>
          <div
            className={cn(
              "max-w-2xl text-base leading-relaxed text-ink-muted md:text-lg",
              align === "center" && "mx-auto"
            )}
          >
            {description}
          </div>
        </Reveal>
      )}
    </div>
  );
}
