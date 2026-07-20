/**
 * Feature: AI Operations Platform — a read-only AI layer that sits on top of the
 * platform. It reads existing business data (CRM, Projects, Timeline,
 * Deliverables, Notifications, Billing) and generates insights, summaries and
 * recommendations. It is NEVER the source of truth and never mutates business
 * data.
 *
 * Business logic lives in the AI service (`@/lib/ai`). This barrel exposes the
 * admin UI surface: the insight panel, the on-demand generator button, and the
 * presentation helpers.
 */

export { AiInsightPanel } from "@/features/ai/components/AiInsightPanel";
export {
  GenerateInsightButton,
  type AiInsightKind,
} from "@/features/ai/components/GenerateInsightButton";
export {
  riskSeverityPresentation,
  riskCategoryLabel,
} from "@/features/ai/lib/presentation";
