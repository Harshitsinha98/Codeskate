"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { CHECKOUT_STEP_LABELS, CHECKOUT_STEP_ORDER } from "@/constants/checkout";
import type { CheckoutStep } from "@/constants/checkout";
import { cn } from "@/lib/utils";

/** Animated horizontal stepper with a scaling progress spine (matches ProcessTimeline's language). */
export function CheckoutStepper({ currentStep }: { currentStep: CheckoutStep }) {
  const currentIndex = CHECKOUT_STEP_ORDER.indexOf(currentStep);
  const progressPct =
    currentIndex <= 0 ? 0 : (currentIndex / (CHECKOUT_STEP_ORDER.length - 1)) * 100;

  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="relative h-1 w-full overflow-hidden rounded-full bg-line">
        <motion.div
          className="h-full bg-gradient-to-r from-royal via-violet to-cyan"
          initial={false}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      {/* Step labels */}
      <div className="mt-4 grid grid-cols-5 gap-2">
        {CHECKOUT_STEP_ORDER.map((step, i) => {
          const isComplete = i < currentIndex;
          const isActive = step === currentStep;
          return (
            <div key={step} className="flex flex-col items-center gap-2 text-center">
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium transition-colors duration-300",
                  isComplete && "border-transparent bg-ink text-white",
                  isActive && !isComplete && "border-royal bg-royal/10 text-royal",
                  !isActive && !isComplete && "border-line bg-surface text-ink-faint"
                )}
              >
                {isComplete ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span
                className={cn(
                  "hidden text-xs font-medium sm:block",
                  isActive ? "text-ink" : "text-ink-faint"
                )}
              >
                {CHECKOUT_STEP_LABELS[step]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
