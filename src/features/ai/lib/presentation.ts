/**
 * AI presentation helpers — label + Tailwind tone maps for AI insight surfaces.
 * Values come from `@/constants/ai` (the single source of truth); this only maps
 * them to human labels and the dashboard's soft-pill tone classes, matching the
 * approach in `@/features/client-dashboard/lib/presentation`.
 */

import {
  AI_RISK_SEVERITY,
  AI_RISK_CATEGORY,
  type AiRiskSeverityValue,
  type AiRiskCategoryValue,
} from "@/constants/ai";
import type { StatusPresentation } from "@/features/client-dashboard/lib/presentation";

const NEUTRAL = "bg-line/60 text-ink-muted";
const AMBER = "bg-amber-500/10 text-amber-700";
const GREEN = "bg-emerald-500/10 text-emerald-700";
const RED = "bg-red-500/10 text-red-600";

const SEVERITY_LABEL: Record<AiRiskSeverityValue, string> = {
  [AI_RISK_SEVERITY.LOW]: "Low",
  [AI_RISK_SEVERITY.MEDIUM]: "Medium",
  [AI_RISK_SEVERITY.HIGH]: "High",
};

const SEVERITY_TONE: Record<AiRiskSeverityValue, string> = {
  [AI_RISK_SEVERITY.LOW]: GREEN,
  [AI_RISK_SEVERITY.MEDIUM]: AMBER,
  [AI_RISK_SEVERITY.HIGH]: RED,
};

export function riskSeverityPresentation(
  severity: AiRiskSeverityValue
): StatusPresentation {
  return { label: SEVERITY_LABEL[severity] ?? severity, tone: SEVERITY_TONE[severity] ?? NEUTRAL };
}

const CATEGORY_LABEL: Record<AiRiskCategoryValue, string> = {
  [AI_RISK_CATEGORY.SCHEDULE]: "Schedule Risk",
  [AI_RISK_CATEGORY.MISSING_DELIVERABLE]: "Missing Deliverable",
  [AI_RISK_CATEGORY.NO_ACTIVITY]: "No Recent Activity",
  [AI_RISK_CATEGORY.DELAYED_MILESTONE]: "Delayed Milestone",
  [AI_RISK_CATEGORY.BLOCKED_TASK]: "Blocked Task",
};

export function riskCategoryLabel(category: AiRiskCategoryValue): string {
  return CATEGORY_LABEL[category] ?? category;
}
