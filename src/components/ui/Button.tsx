"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant =
  | "primary"
  | "secondary"
  | "ghost"
  | "outline"
  | "gradient"
  /** Orange CTA with an inner highlight + glow — for dark surfaces. */
  | "glow"
  /** Translucent white button for dark surfaces. */
  | "night"
  /** Text-only button for dark surfaces. */
  | "night-ghost";
type Size = "sm" | "md" | "lg" | "xl";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
  /** Render as a plain anchor with target=_blank (for external/WhatsApp links). */
  external?: boolean;
  /** Accepted for backwards-compat; the clean redesign has no magnetic effect. */
  magnetic?: boolean;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
};

const base =
  "group inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-[-0.01em] transition-all duration-200 ease-premium whitespace-nowrap active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-royal text-white hover:bg-royal-600 shadow-soft hover:shadow-glow",
  secondary:
    "bg-surface text-ink border border-line hover:border-ink/20 hover:bg-subtle",
  ghost: "text-ink-soft hover:text-ink hover:bg-subtle",
  outline:
    "bg-transparent text-royal border border-royal/40 hover:bg-royal/5 hover:border-royal",
  // Gradient-border: orange ring via padded gradient background, white inner fill
  gradient:
    "relative bg-gradient-to-r from-royal to-royal-700 text-white shadow-soft hover:shadow-glow",
  glow:
    "bg-gradient-to-b from-royal-400 to-royal text-white shadow-glow-lg hover:brightness-110",
  night:
    "border border-white/10 bg-white/[0.06] text-white backdrop-blur hover:border-white/20 hover:bg-white/[0.1]",
  "night-ghost": "text-white/70 hover:text-white",
};

const sizes: Record<Size, string> = {
  sm: "px-3.5 py-1.5 text-[0.8rem]",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3.5 text-[0.95rem]",
  xl: "px-8 py-4 text-base",
};

export function Button({
  children,
  href,
  variant = "primary",
  size = "md",
  arrow = false,
  external = false,
  className,
  onClick,
  type = "button",
  disabled,
}: ButtonProps) {
  const content = (
    <>
      <span>{children}</span>
      {arrow && (
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      )}
    </>
  );

  const classes = cn(base, variants[variant], sizes[size], className);

  if (href && external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
      >
        {content}
      </a>
    );
  }

  return href ? (
    <Link href={href} className={classes}>
      {content}
    </Link>
  ) : (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {content}
    </button>
  );
}
