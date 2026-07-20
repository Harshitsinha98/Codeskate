"use client";

/**
 * Shared checkout field primitives — consolidates the input styling already
 * used by `ContactForm` / auth forms into one reusable module so the billing
 * and requirements steps don't each redefine the same markup.
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const fieldClasses =
  "w-full rounded-2xl border border-line bg-base/50 px-4 py-3 text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-royal/40 focus:bg-surface focus:outline-none";

export function TextField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  optional,
  error,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between text-sm font-medium text-ink-soft">
        {label}
        {optional && <span className="text-xs font-normal text-ink-faint">Optional</span>}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        className={cn(fieldClasses, error && "border-red-400 focus:border-red-400")}
      />
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </label>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  required,
  optional,
  rows = 4,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
  rows?: number;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between text-sm font-medium text-ink-soft">
        {label}
        {optional && <span className="text-xs font-normal text-ink-faint">Optional</span>}
      </span>
      <textarea
        required={required}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        className={cn(fieldClasses, "resize-none", error && "border-red-400 focus:border-red-400")}
      />
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </label>
  );
}

/** Toggle pill — reuses the exact chip style already established by ContactForm. */
export function ToggleChip({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300",
        selected
          ? "border-transparent bg-ink text-white"
          : "border-line bg-surface text-ink-soft hover:border-ink/20"
      )}
    >
      {label}
    </button>
  );
}

export function FieldGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">{children}</div>;
}
