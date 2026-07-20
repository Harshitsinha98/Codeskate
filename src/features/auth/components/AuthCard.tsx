import type { ReactNode } from "react";

/** Presentational wrapper for auth pages (server-safe, no client hooks). */
export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="w-full max-w-md">
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
      </div>
      <div className="rounded-[2rem] border border-line bg-surface p-8 shadow-soft">
        {children}
      </div>
    </div>
  );
}
