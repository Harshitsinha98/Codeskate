/**
 * CRM presentation helpers — label + tone maps and small formatters for the
 * Sales CRM surface. Mirrors `@/features/client-dashboard/lib/presentation`:
 * status VALUES come from `@/constants/crm` (the single source of truth); this
 * only maps them to human labels + Tailwind tone classes for the badges.
 */

import {
  LEAD_STAGE,
  LEAD_PRIORITY,
  PROPOSAL_STATUS,
} from "@/constants/crm";
import type { StatusPresentation } from "@/features/client-dashboard/lib/presentation";

type Tone = string;

const NEUTRAL: Tone = "bg-line/60 text-ink-muted";
const BLUE: Tone = "bg-royal/10 text-royal-700";
const AMBER: Tone = "bg-amber-500/10 text-amber-700";
const GREEN: Tone = "bg-emerald-500/10 text-emerald-700";
const RED: Tone = "bg-red-500/10 text-red-600";
const VIOLET: Tone = "bg-violet-500/10 text-violet-700";

function titleCase(value: string): string {
  return value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const STAGE_TONE: Record<string, Tone> = {
  [LEAD_STAGE.NEW]: NEUTRAL,
  [LEAD_STAGE.CONTACTED]: BLUE,
  [LEAD_STAGE.QUALIFIED]: BLUE,
  [LEAD_STAGE.MEETING_SCHEDULED]: VIOLET,
  [LEAD_STAGE.PROPOSAL_SENT]: AMBER,
  [LEAD_STAGE.NEGOTIATION]: AMBER,
  [LEAD_STAGE.WON]: GREEN,
  [LEAD_STAGE.LOST]: RED,
  [LEAD_STAGE.ARCHIVED]: NEUTRAL,
};

const PRIORITY_TONE: Record<string, Tone> = {
  [LEAD_PRIORITY.LOW]: NEUTRAL,
  [LEAD_PRIORITY.MEDIUM]: BLUE,
  [LEAD_PRIORITY.HIGH]: AMBER,
  [LEAD_PRIORITY.URGENT]: RED,
};

const PROPOSAL_TONE: Record<string, Tone> = {
  [PROPOSAL_STATUS.DRAFT]: NEUTRAL,
  [PROPOSAL_STATUS.SENT]: BLUE,
  [PROPOSAL_STATUS.VIEWED]: VIOLET,
  [PROPOSAL_STATUS.ACCEPTED]: GREEN,
  [PROPOSAL_STATUS.REJECTED]: RED,
  [PROPOSAL_STATUS.EXPIRED]: AMBER,
};

export function leadStagePresentation(stage: string): StatusPresentation {
  return { label: titleCase(stage), tone: STAGE_TONE[stage] ?? NEUTRAL };
}

export function leadPriorityPresentation(priority: string): StatusPresentation {
  return { label: titleCase(priority), tone: PRIORITY_TONE[priority] ?? NEUTRAL };
}

export function proposalStatusPresentation(status: string): StatusPresentation {
  return { label: titleCase(status), tone: PROPOSAL_TONE[status] ?? NEUTRAL };
}

export { titleCase as crmTitleCase };
