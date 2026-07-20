"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import type { SavingStatus } from "@/hooks/useCheckoutState";

/** Subtle autosave status, shown only while saving/just-saved. */
export function AutosaveIndicator({ status }: { status: SavingStatus }) {
  return (
    <AnimatePresence mode="wait">
      {status !== "idle" && (
        <motion.span
          key={status}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-faint"
        >
          {status === "saving" ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Check className="h-3 w-3 text-royal" />
              Progress saved
            </>
          )}
        </motion.span>
      )}
    </AnimatePresence>
  );
}
