/**
 * Sales CRM domain types — interfaces only.
 *
 * Mirrors the lean Prisma `Lead`/`Proposal` models (see prisma/schema.prisma).
 * Like `Order`/`Project` (ADR-001) these are agency-internal with no tenant
 * context, so they extend `Timestamps` only. Stage/status/priority/source unions
 * derive from `@/constants/crm` (the single source of truth) — never re-typed.
 *
 * Money in a proposal is always SERVER-computed via the shared pricing engine
 * (`@/lib/pricing-engine`) from the catalog — the proposal stores the resulting
 * MINOR amounts + a rendered line snapshot, never a second pricing model.
 */

import type { ID, ISODateString } from "@/types/common";
import type {
  LeadStageValue,
  LeadSourceValue,
  LeadPriorityValue,
  ProposalStatusValue,
} from "@/constants/crm";

export type LeadStage = LeadStageValue;
export type LeadSource = LeadSourceValue;
export type LeadPriority = LeadPriorityValue;
export type ProposalStatus = ProposalStatusValue;

export interface Lead {
  id: ID;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  source: LeadSource;
  /** Buyer's stated budget in minor units (optional, free-form target). */
  budgetMinor: number | null;
  currency: string;
  requirements: string | null;
  notes: string | null;
  /** The assigned sales person (a User id) — null until claimed. */
  ownerId: ID | null;
  stage: LeadStage;
  priority: LeadPriority;
  expectedCloseDate: ISODateString | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/** One quotation line, snapshotted from the catalog at proposal time. */
export interface ProposalLineItem {
  /** "package" | "addon" — what this line represents. */
  kind: "package" | "addon";
  /** The catalog id (packageId / addonId) this line was priced from. */
  refId: string;
  label: string;
  amountMinor: number;
}

export interface Proposal {
  id: ID;
  /** Human-facing unique Proposal number, e.g. "PRO-7K2M9A". */
  number: string;
  leadId: ID;
  title: string;
  /** The catalog service this quotation was built from. */
  serviceSlug: string;
  packageId: string;
  addonIds: string[];
  /** Snapshot of the priced lines (for stable rendering + audit). */
  lineItems: ProposalLineItem[];
  couponCode: string | null;
  currency: string;
  subtotalMinor: number;
  discountMinor: number;
  taxMinor: number;
  totalMinor: number;
  notes: string | null;
  status: ProposalStatus;
  expiresAt: ISODateString | null;
  sentAt: ISODateString | null;
  viewedAt: ISODateString | null;
  decidedAt: ISODateString | null;
  /** The order created when the proposal is accepted (checkout hand-off). */
  orderId: ID | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/** CRM dashboard read model — pipeline overview + recent activity. */
export interface CrmDashboard {
  stageCounts: Record<LeadStage, number>;
  totalLeads: number;
  activeLeads: number;
  wonLeads: number;
  lostLeads: number;
  /** Won / (won + lost) — the conversion-rate foundation. */
  conversionRatePct: number;
  recentLeads: Lead[];
  upcomingMeetings: Lead[];
  proposalStatusCounts: Record<ProposalStatus, number>;
}
