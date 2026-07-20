"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Tag, X } from "lucide-react";
import type { Coupon } from "@/types/coupon";
import { validateCoupon } from "@/lib/pricing-engine";
import type { Money } from "@/types/common";
import { cn } from "@/lib/utils";

/** Coupon code entry + client-side validation feedback. */
export function CouponInput({
  code,
  appliedCoupon,
  subtotal,
  onCodeChange,
  onApply,
  onRemove,
}: {
  code: string;
  appliedCoupon: Coupon | null;
  subtotal: Money;
  onCodeChange: (code: string) => void;
  onApply: (coupon: Coupon) => void;
  onRemove: () => void;
}) {
  const [error, setError] = useState<string | null>(null);

  const handleApply = () => {
    if (!code.trim()) return;
    const result = validateCoupon(code, subtotal);
    if (!result.valid) {
      setError(result.message);
      return;
    }
    setError(null);
    onApply(result.coupon);
  };

  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between rounded-2xl border border-royal/30 bg-royal/5 px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-medium text-ink">
          <Check className="h-4 w-4 text-royal" />
          Coupon <span className="font-display">{appliedCoupon.code}</span> applied
        </span>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove coupon"
          className="text-ink-faint transition-colors hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input
            value={code}
            onChange={(e) => {
              onCodeChange(e.target.value.toUpperCase());
              setError(null);
            }}
            placeholder="Coupon code"
            className={cn(
              "w-full rounded-2xl border border-line bg-base/50 py-3 pl-11 pr-4 text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-royal/40 focus:bg-surface focus:outline-none",
              error && "border-red-400"
            )}
          />
        </div>
        <button
          type="button"
          onClick={handleApply}
          className="shrink-0 rounded-2xl border border-line bg-surface px-5 text-sm font-medium text-ink transition-colors hover:border-ink/20"
        >
          Apply
        </button>
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1.5 text-xs text-red-600"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
