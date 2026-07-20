"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { plans as sitewidePlans, type Plan } from "@/lib/pricing";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/**
 * Clean B2B pricing cards. Featured plan gets a primary border + badge.
 * Defaults to the sitewide engagement tiers; pass `plans` to render a
 * different set (e.g. a service's Basic/Standard/Premium packages).
 */
export function PricingCards({ plans = sitewidePlans }: { plans?: Plan[] } = {}) {
  const cols =
    plans.length >= 4
      ? "lg:grid-cols-4"
      : plans.length === 2
      ? "lg:grid-cols-2"
      : "lg:grid-cols-3";

  return (
    <div className={cn("grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2", cols)}>
      {plans.map((plan, i) => (
        <motion.div
          key={plan.name}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.4, delay: i * 0.06 }}
          className={cn(
            "relative flex flex-col rounded-3xl border bg-surface p-7 transition-all duration-300 ease-premium hover:-translate-y-1",
            plan.featured
              ? "border-royal shadow-lift ring-1 ring-royal"
              : "border-line shadow-soft hover:shadow-lift"
          )}
        >
          {plan.featured && (
            <span className="absolute -top-3.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-royal px-3.5 py-1.5 text-xs font-semibold text-white shadow-soft">
              <Sparkles className="h-3 w-3" />
              Most popular
            </span>
          )}

          <h3 className="text-lg font-bold tracking-tight text-ink">
            {plan.name}
          </h3>
          <p className="mt-2 min-h-[2.5rem] text-sm leading-relaxed text-ink-muted">
            {plan.tagline}
          </p>

          <div className="mt-5 flex items-baseline gap-1.5">
            <span
              className={cn(
                "text-3xl font-bold tracking-tight",
                plan.featured ? "text-royal" : "text-ink"
              )}
            >
              {plan.price}
            </span>
            <span className="text-sm text-ink-faint">{plan.cadence}</span>
          </div>

          <div className="my-6 h-px w-full bg-line" />

          <ul className="flex flex-1 flex-col gap-3">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
                  <Check className="h-3 w-3" />
                </span>
                <span className="text-ink-soft">{feature}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <Button
              href={plan.ctaHref}
              external={/^https?:\/\//.test(plan.ctaHref)}
              variant={plan.featured ? "primary" : "secondary"}
              size="lg"
              className="w-full"
            >
              {plan.cta}
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
