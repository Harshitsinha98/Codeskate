"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "gradient";
type Size = "md" | "lg" | "xl";

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
  "group inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 ease-premium whitespace-nowrap hover:-translate-y-0.5 disabled:opacity-60 disabled:pointer-events-none disabled:translate-y-0";

const variants: Record<Variant, string> = {
  primary:
    "bg-royal text-white hover:bg-royal-600 shadow-soft hover:shadow-lift",
  secondary:
    "bg-surface text-ink border border-line hover:border-royal/30 hover:shadow-soft",
  ghost: "text-ink-soft hover:text-ink hover:bg-subtle hover:translate-y-0",
  outline:
    "bg-transparent text-royal border border-royal/40 hover:bg-royal/5 hover:border-royal",
  // Gradient-border: orange ring via padded gradient background, white inner fill
  gradient:
    "relative bg-gradient-to-r from-royal to-royal-700 text-white shadow-soft hover:shadow-glow",
};

const sizes: Record<Size, string> = {
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
