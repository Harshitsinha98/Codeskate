import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * DESIGN SYSTEM 2.0 — Table.
 * Rounded, bordered container with a soft-wash header and hairline rows.
 * Compose with Table.Head/Body/Row/Cell, or pass `columns`/`rows` for the
 * simple data-driven form.
 */
export function Table({
  columns,
  rows,
  className,
  children,
}: {
  columns?: string[];
  rows?: ReactNode[][];
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-3xl border border-line bg-surface shadow-soft",
        className
      )}
    >
      <table className="w-full border-collapse text-sm">
        {columns && (
          <thead>
            <tr className="border-b border-line bg-subtle">
              {columns.map((c) => (
                <th
                  key={c}
                  className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.1em] text-ink-faint"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
        )}
        {rows && (
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-line transition-colors last:border-0 hover:bg-subtle/60"
              >
                {row.map((cell, j) => (
                  <td key={j} className="px-5 py-4 text-ink-soft">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        )}
        {children}
      </table>
    </div>
  );
}
