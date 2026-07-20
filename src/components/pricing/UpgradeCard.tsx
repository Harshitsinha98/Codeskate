import { ArrowRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PriceBadge } from "./PriceBadge";
import {
  PLANS,
  planPriceLabel,
  type PlanId,
} from "@/lib/config/plans";

/**
 * Reusable upgrade card — nudges from a current plan to a target plan using
 * centralized plan data. Prop-driven; no hardcoded pricing.
 */
export function UpgradeCard({
  currentPlanId,
  targetPlanId,
}: {
  currentPlanId: PlanId;
  targetPlanId: PlanId;
}) {
  const current = PLANS[currentPlanId];
  const target = PLANS[targetPlanId];

  return (
    <div className="rounded-3xl border border-royal/20 bg-surface p-6 shadow-soft">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-royal/10 px-3 py-1 text-xs font-semibold text-royal">
        <TrendingUp className="h-3.5 w-3.5" />
        Upgrade available
      </span>

      <div className="mt-4 flex items-center gap-3 text-sm text-ink-muted">
        <span className="font-medium text-ink">{current.title}</span>
        <ArrowRight className="h-4 w-4 text-ink-faint" />
        <span className="font-bold text-royal">{target.title}</span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
        {target.subtitle}
      </p>

      <div className="mt-4">
        <PriceBadge price={planPriceLabel(target)} cadence={target.cadence} size="sm" />
      </div>

      <div className="mt-5">
        <Button href={target.ctaLink} variant="primary" size="md" className="w-full">
          {target.ctaText}
        </Button>
      </div>
    </div>
  );
}
