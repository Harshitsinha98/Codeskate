/**
 * Sales CRM constants — values only (the single source of truth the `@/types/crm`
 * unions derive from). Consumed by the CRM services (`@/lib/lead-service`,
 * `@/lib/proposal-service`) and the admin CRM surface.
 *
 * The CRM is agency-internal: leads move through a sales pipeline that funnels a
 * won deal into the EXISTING checkout → order → project engine (no duplicate
 * checkout). Stages/statuses are plain strings (no DB enum) so a custom stage
 * needs no migration — an unknown value simply renders via `titleCase`.
 */

/** Pipeline stages, in funnel order. `won` hands off to checkout; `lost`/`archived` are terminal. */
export const LEAD_STAGE = {
  NEW: "new",
  CONTACTED: "contacted",
  QUALIFIED: "qualified",
  MEETING_SCHEDULED: "meeting_scheduled",
  PROPOSAL_SENT: "proposal_sent",
  NEGOTIATION: "negotiation",
  WON: "won",
  LOST: "lost",
  ARCHIVED: "archived",
} as const;

export type LeadStageValue = (typeof LEAD_STAGE)[keyof typeof LEAD_STAGE];

/** Ordered list of the active (non-terminal) pipeline stages for the board. */
export const LEAD_PIPELINE_STAGES: readonly LeadStageValue[] = [
  LEAD_STAGE.NEW,
  LEAD_STAGE.CONTACTED,
  LEAD_STAGE.QUALIFIED,
  LEAD_STAGE.MEETING_SCHEDULED,
  LEAD_STAGE.PROPOSAL_SENT,
  LEAD_STAGE.NEGOTIATION,
  LEAD_STAGE.WON,
] as const;

/** Stages that count a lead as closed-out of the active pipeline. */
export const LEAD_TERMINAL_STAGES: ReadonlySet<LeadStageValue> = new Set([
  LEAD_STAGE.WON,
  LEAD_STAGE.LOST,
  LEAD_STAGE.ARCHIVED,
]);

/** Where a lead came from. Free string in the DB; these are the built-in options. */
export const LEAD_SOURCE = {
  WEBSITE: "website",
  REFERRAL: "referral",
  OUTBOUND: "outbound",
  SOCIAL: "social",
  EVENT: "event",
  ADVERTISING: "advertising",
  OTHER: "other",
} as const;

export type LeadSourceValue = (typeof LEAD_SOURCE)[keyof typeof LEAD_SOURCE];

/** Lead priority. Plain string so it stays cheaply extensible. */
export const LEAD_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
} as const;

export type LeadPriorityValue = (typeof LEAD_PRIORITY)[keyof typeof LEAD_PRIORITY];

/** Proposal lifecycle. `accepted` triggers the checkout hand-off. */
export const PROPOSAL_STATUS = {
  DRAFT: "draft",
  SENT: "sent",
  VIEWED: "viewed",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  EXPIRED: "expired",
} as const;

export type ProposalStatusValue = (typeof PROPOSAL_STATUS)[keyof typeof PROPOSAL_STATUS];

/** Human-facing prefix + random length of the generated public Proposal number. */
export const PROPOSAL_NUMBER_PREFIX = "PRO";
export const PROPOSAL_NUMBER_RANDOM_LENGTH = 6;
