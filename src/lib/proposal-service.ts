/**
 * Proposal service — server-only quotation + acceptance business logic.
 *
 * A proposal is a QUOTATION built from the EXISTING service catalog + packages
 * (`@/config/catalog`) and priced by the shared `@/lib/pricing-engine` — the
 * exact same calculation the checkout uses, so there is NO duplicated pricing.
 * The proposal persists the resulting minor amounts + a rendered line snapshot.
 *
 * Acceptance is the hand-off seam the sprint requires: when a proposal is
 * accepted we DO NOT build a second checkout — we mark the deal won, generate a
 * checkout link into the EXISTING checkout page (prefilled service/package),
 * and hand off to the existing Order Engine, which continues unchanged
 * (order → payment → project). Status changes emit realtime + a notification
 * through the shared layers.
 *
 * Server-only. Same shape/conventions as `@/lib/order-service`.
 */

import { randomBytes } from "node:crypto";
import { Prisma } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { calculateOrder, validateCoupon } from "@/lib/pricing-engine";
import { getService, getPackage } from "@/config/catalog";
import { findCoupon } from "@/config/coupons";
import { notify, notifyMany } from "@/lib/notifications/service";
import { getAgencyAdminIds } from "@/lib/notifications/recipients";
import { emitCrmRealtime } from "@/lib/crm-realtime";
import { changeLeadStage } from "@/lib/lead-service";
import { NOTIFICATION_TYPE, NOTIFICATION_AUDIENCE } from "@/constants/notification";
import {
  PROPOSAL_STATUS,
  PROPOSAL_NUMBER_PREFIX,
  PROPOSAL_NUMBER_RANDOM_LENGTH,
  LEAD_STAGE,
  type ProposalStatusValue,
} from "@/constants/crm";
import type { Coupon } from "@/types/coupon";
import type { Proposal, ProposalLineItem } from "@/types/crm";

type Db = PrismaClient | Prisma.TransactionClient;

export class ProposalError extends Error {
  constructor(message: string, readonly statusCode: number) {
    super(message);
    this.name = "ProposalError";
  }
}

/* ── Proposal number ───────────────────────────────────────────────────────── */

const NUMBER_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function generateProposalNumber(): string {
  const bytes = randomBytes(PROPOSAL_NUMBER_RANDOM_LENGTH);
  let out = "";
  for (let i = 0; i < PROPOSAL_NUMBER_RANDOM_LENGTH; i++) {
    out += NUMBER_ALPHABET[bytes[i] % NUMBER_ALPHABET.length];
  }
  return `${PROPOSAL_NUMBER_PREFIX}-${out}`;
}

/* ── Row → domain mapping ──────────────────────────────────────────────────── */

type ProposalRow = {
  id: string;
  number: string;
  leadId: string;
  title: string;
  serviceSlug: string;
  packageId: string;
  addonIds: string[];
  lineItems: Prisma.JsonValue;
  couponCode: string | null;
  currency: string;
  subtotalMinor: number;
  discountMinor: number;
  taxMinor: number;
  totalMinor: number;
  notes: string | null;
  status: string;
  expiresAt: Date | null;
  sentAt: Date | null;
  viewedAt: Date | null;
  decidedAt: Date | null;
  orderId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export function toProposal(row: ProposalRow): Proposal {
  return {
    id: row.id,
    number: row.number,
    leadId: row.leadId,
    title: row.title,
    serviceSlug: row.serviceSlug,
    packageId: row.packageId,
    addonIds: row.addonIds,
    lineItems: (row.lineItems as unknown as ProposalLineItem[]) ?? [],
    couponCode: row.couponCode,
    currency: row.currency,
    subtotalMinor: row.subtotalMinor,
    discountMinor: row.discountMinor,
    taxMinor: row.taxMinor,
    totalMinor: row.totalMinor,
    notes: row.notes,
    status: row.status as ProposalStatusValue,
    expiresAt: row.expiresAt?.toISOString() ?? null,
    sentAt: row.sentAt?.toISOString() ?? null,
    viewedAt: row.viewedAt?.toISOString() ?? null,
    decidedAt: row.decidedAt?.toISOString() ?? null,
    orderId: row.orderId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/* ── Quotation (reuses the checkout pricing engine) ────────────────────────── */

export interface QuoteInput {
  serviceSlug: string;
  packageId: string;
  addonIds?: string[];
  couponCode?: string | null;
}

/**
 * Price a quotation from the catalog using the SAME pricing engine as checkout.
 * Returns the breakdown + a rendered line snapshot — no second pricing model.
 */
export function quoteProposal(input: QuoteInput) {
  const service = getService(input.serviceSlug);
  if (!service) throw new ProposalError("Unknown service.", 400);

  const pkg = getPackage(input.serviceSlug, input.packageId);
  if (!pkg) throw new ProposalError("Unknown package for this service.", 400);

  const addonIds = input.addonIds ?? [];
  const addons = service.addons.filter((a) => addonIds.includes(a.id));

  const uncouponed = calculateOrder({ pkg, addons });
  let coupon: Coupon | null = null;
  if (input.couponCode?.trim()) {
    const result = validateCoupon(input.couponCode, uncouponed.subtotal);
    if (!result.valid) throw new ProposalError(result.message, 400);
    coupon = findCoupon(input.couponCode) ?? null;
  }

  const breakdown = calculateOrder({ pkg, addons, coupon });

  const lineItems: ProposalLineItem[] = [
    { kind: "package", refId: pkg.id, label: pkg.name, amountMinor: breakdown.basePrice.amountMinor },
    ...breakdown.addonLines.map((line, i) => ({
      kind: "addon" as const,
      refId: addons[i]?.id ?? "",
      label: line.label,
      amountMinor: line.amount.amountMinor,
    })),
  ];

  return { service, pkg, addons, coupon, breakdown, lineItems };
}

/* ── Create ────────────────────────────────────────────────────────────────── */

export interface CreateProposalInput {
  leadId: string;
  title?: string;
  serviceSlug: string;
  packageId: string;
  addonIds?: string[];
  couponCode?: string | null;
  notes?: string | null;
  expiresAt?: Date | null;
}

/** Create a DRAFT proposal (quotation) for a lead from the catalog. */
export async function createProposal(
  input: CreateProposalInput,
  actorId: string | null,
  db: Db = prisma
): Promise<Proposal> {
  const lead = await db.lead.findUnique({ where: { id: input.leadId } });
  if (!lead) throw new ProposalError("Lead not found.", 404);

  const { pkg, coupon, breakdown, lineItems } = quoteProposal(input);

  // Unique proposal number with a small retry against the unique constraint.
  let created: ProposalRow | null = null;
  for (let attempt = 0; attempt < 5 && !created; attempt++) {
    try {
      created = await db.proposal.create({
        data: {
          number: generateProposalNumber(),
          leadId: input.leadId,
          title: input.title?.trim() || `${pkg.name} — ${lead.name}`,
          serviceSlug: input.serviceSlug,
          packageId: input.packageId,
          addonIds: input.addonIds ?? [],
          lineItems: lineItems as unknown as Prisma.InputJsonValue,
          couponCode: coupon?.code ?? null,
          currency: breakdown.grandTotal.currency,
          subtotalMinor: breakdown.subtotal.amountMinor,
          discountMinor: breakdown.discount.amountMinor,
          taxMinor: breakdown.tax.amountMinor,
          totalMinor: breakdown.grandTotal.amountMinor,
          notes: input.notes?.trim() || null,
          status: PROPOSAL_STATUS.DRAFT,
          expiresAt: input.expiresAt ?? null,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002" &&
        attempt < 4
      ) {
        continue;
      }
      throw error;
    }
  }
  if (!created) throw new ProposalError("Could not generate a unique proposal number.", 500);

  const proposal = toProposal(created);
  emitCrmRealtime(`proposal-created-${proposal.id}`, `Proposal ${proposal.number} drafted`, actorId);
  return proposal;
}

/* ── Status transitions ────────────────────────────────────────────────────── */

/**
 * Move a proposal to a new status. `sent`/`viewed` also advance the lead stage;
 * `accepted` runs the checkout hand-off (see `acceptProposal`, which callers use
 * instead for the full flow). Timestamps are stamped as the status moves.
 */
export async function setProposalStatus(
  proposalId: string,
  status: ProposalStatusValue,
  actorId: string | null,
  db: Db = prisma
): Promise<Proposal> {
  const existing = await db.proposal.findUnique({ where: { id: proposalId } });
  if (!existing) throw new ProposalError("Proposal not found.", 404);

  const data: Prisma.ProposalUpdateInput = { status };
  if (status === PROPOSAL_STATUS.SENT && !existing.sentAt) data.sentAt = new Date();
  if (status === PROPOSAL_STATUS.VIEWED && !existing.viewedAt) data.viewedAt = new Date();
  if (
    status === PROPOSAL_STATUS.ACCEPTED ||
    status === PROPOSAL_STATUS.REJECTED ||
    status === PROPOSAL_STATUS.EXPIRED
  ) {
    data.decidedAt = new Date();
  }

  const row = await db.proposal.update({ where: { id: proposalId }, data });
  const proposal = toProposal(row);

  emitCrmRealtime(
    `proposal-status-${proposal.id}-${Date.now()}`,
    `Proposal ${proposal.number}: ${status}`,
    actorId
  );

  // Keep the lead pipeline in step with proposal progress.
  try {
    if (status === PROPOSAL_STATUS.SENT) {
      await changeLeadStage(existing.leadId, LEAD_STAGE.PROPOSAL_SENT, actorId, db);
    }
  } catch {
    /* pipeline sync is best-effort */
  }

  return proposal;
}

/**
 * Accept a proposal → hand off to the EXISTING checkout/order engine.
 *
 * Marks the proposal accepted, moves the lead to WON, notifies the sales team,
 * and returns a checkout URL into the EXISTING `/checkout` page (prefilled with
 * the quoted service + package). The customer completes payment there and the
 * existing Order Engine continues unchanged — no duplicate checkout is built.
 */
export async function acceptProposal(
  proposalId: string,
  actorId: string | null,
  db: Db = prisma
): Promise<{ proposal: Proposal; checkoutUrl: string }> {
  const existing = await db.proposal.findUnique({ where: { id: proposalId } });
  if (!existing) throw new ProposalError("Proposal not found.", 404);
  if (existing.status === PROPOSAL_STATUS.EXPIRED) {
    throw new ProposalError("This proposal has expired.", 409);
  }

  const row = await db.proposal.update({
    where: { id: proposalId },
    data: { status: PROPOSAL_STATUS.ACCEPTED, decidedAt: new Date() },
  });
  const proposal = toProposal(row);

  // Advance the deal to WON in the pipeline (also emits its own notification).
  try {
    await changeLeadStage(existing.leadId, LEAD_STAGE.WON, actorId, db);
  } catch {
    /* pipeline sync is best-effort */
  }

  emitCrmRealtime(`proposal-accepted-${proposal.id}`, `Proposal ${proposal.number} accepted`, actorId);

  // Notify admins the deal was won and is heading to checkout. Best-effort.
  try {
    const adminIds = await getAgencyAdminIds(db);
    if (adminIds.length) {
      await notifyMany(
        adminIds,
        {
          type: NOTIFICATION_TYPE.PROPOSAL_ACCEPTED,
          audience: NOTIFICATION_AUDIENCE.ADMIN,
          title: `Proposal ${proposal.number} accepted`,
          body: "Deal won — awaiting checkout.",
          data: { proposalId: proposal.id, leadId: proposal.leadId, href: `/admin/crm/leads/${proposal.leadId}` },
        },
        db
      );
    }
  } catch {
    /* non-critical */
  }

  // Hand off to the EXISTING checkout page (prefilled). The wizard collects
  // billing/requirements and calls the existing Order Engine — no new flow.
  const params = new URLSearchParams({
    service: proposal.serviceSlug,
    package: proposal.packageId,
  });
  if (proposal.couponCode) params.set("coupon", proposal.couponCode);
  const checkoutUrl = `/checkout?${params.toString()}`;

  return { proposal, checkoutUrl };
}

/* ── Reads ─────────────────────────────────────────────────────────────────── */

/** List proposals for a lead (newest first). */
export async function listProposalsForLead(leadId: string, db: Db = prisma): Promise<Proposal[]> {
  const rows = await db.proposal.findMany({ where: { leadId }, orderBy: { createdAt: "desc" } });
  return rows.map(toProposal);
}

/** List all proposals (newest first) — the CRM proposals overview. */
export async function listProposals(db: Db = prisma): Promise<Proposal[]> {
  const rows = await db.proposal.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map(toProposal);
}

/** Fetch one proposal by id, or null. */
export async function getProposal(proposalId: string, db: Db = prisma): Promise<Proposal | null> {
  const row = await db.proposal.findUnique({ where: { id: proposalId } });
  return row ? toProposal(row) : null;
}
