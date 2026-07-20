import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * DESIGN SYSTEM 2.0 — Layout primitives.
 * Consistent container widths and responsive grids so pages never re-declare
 * max-widths or column counts.
 */

type ContainerWidth = "sm" | "md" | "lg";

const widths: Record<ContainerWidth, string> = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-[1200px]",
};

export function Container({
  width = "lg",
  className,
  children,
}: {
  width?: ContainerWidth;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full px-6 md:px-8", widths[width], className)}>
      {children}
    </div>
  );
}

type Cols = 1 | 2 | 3 | 4;

const colClasses: Record<Cols, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

const gaps = {
  sm: "gap-4",
  md: "gap-5",
  lg: "gap-8",
};

export function Grid({
  cols = 3,
  gap = "md",
  className,
  children,
}: {
  cols?: Cols;
  gap?: keyof typeof gaps;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("grid", colClasses[cols], gaps[gap], className)}>
      {children}
    </div>
  );
}
