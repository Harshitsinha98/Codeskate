"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Card wrapper with a cursor-following glow + gradient border.
 * Writes the pointer position into `--mx` / `--my`, which the `.spotlight`
 * and `.spotlight-border` utilities in globals.css read. This is the single
 * hover treatment for cards across the marketing site.
 */
export function Spotlight({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
      className={cn("spotlight spotlight-border relative", className)}
    >
      {children}
    </div>
  );
}
