"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { PriceBadge } from "./PriceBadge";
import {
  PLAN_LIST,
  planPriceLabel,
  type CentralPlan,
  type PlanId,
} from "@/lib/config/plans";

/**
 * Reusable plan selector — radio-style tier picker driven by centralized
 * plans. Reports the selected plan id via `onSelect`.
 */
export function PlanSelector({
  plans = PLAN_LIST,
  defaultPlanId,
  onSelect,
}: {
  plans?: CentralPlan[];
  defaultPlanId?: PlanId;
  onSelect?: (id: PlanId) => void;
}) {
  const [selected, setSelected] = useState<PlanId>(
    defaultPlanId ?? plans[0]?.id
  );

  const choose = (id: PlanId) => {
    setSelected(id);
    onSelect?.(id);
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {plans.map((plan) => {
        const active = plan.id === selected;
        return (
          <button
            key={plan.id}
            type="button"
            onClick={() => choose(plan.id)}
            className={cn(
              "flex flex-col items-start gap-1 rounded-2xl border p-5 text-left transition-all duration-200",
              active
                ? "border-royal bg-royal/5 shadow-lift"
                : "border-line bg-surface hover:border-royal/30"
            )}
          >
            <span className="text-sm font-bold text-ink">{plan.title}</span>
            <PriceBadge price={planPriceLabel(plan)} cadence={plan.cadence} size="sm" />
          </button>
        );
      })}
    </div>
  );
}
