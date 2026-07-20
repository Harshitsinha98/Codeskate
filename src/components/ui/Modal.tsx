"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion";

/**
 * DESIGN SYSTEM 2.0 — Modal.
 * White rounded-4xl panel, soft backdrop, spring-in scale. No glass.
 * Controlled via `open` / `onClose`. Closes on Escape + backdrop click.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={onClose}
            aria-hidden
          />
          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.28, ease: EASE }}
            className={cn(
              "relative z-10 w-full max-w-lg rounded-4xl border border-line bg-surface p-7 shadow-lift md:p-8",
              className
            )}
          >
            {title && (
              <h3 className="pr-8 text-lg font-bold tracking-tight text-ink">
                {title}
              </h3>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-subtle hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
            <div className={cn(title && "mt-4")}>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
