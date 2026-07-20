/**
 * Lead service — server-only sales-pipeline business logic.
 *
 * The write surface for CRM leads: create, update fields, assign a sales person,
 * and move a lead through the pipeline. A STAGE CHANGE is the important seam —
 * per the sprint it must automatically (1) record the change, (2) publish a
 * realtime event (`@/lib/crm-realtime`, the existing realtime layer), and
 * (3) generate a notification through the ONE Notification Service
 * (`@/lib/notifications`). No module writes notifications or realtime directly;
 * they funnel through here so the CRM has a single mutation seam (mirroring how
 * project mutations funnel through the Timeline Service).
 *
 * Reuses the existing architecture (Prisma singleton, constants-as-source-of-
 * truth, the notification + realtime layers). Same shape as `@/lib/order-service`.
 */

import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { notify, notifyMany } from "@/lib/notifications/service";
import { getAgencyAdminIds } from "@/lib/notifications/recipients";
import { emitCrmRealtime } from "@/lib/crm-realtime";
import { NOTIFICATION_TYPE, NOTIFICATION_AUDIENCE } from "@/constants/notification";
import {
  LEAD_STAGE,
  LEAD_PRIORITY,
  LEAD_SOURCE,
  type LeadStageValue,
  type LeadPriorityValue,
  type LeadSourceValue,
} from "@/constants/crm";
import type { Lead } from "@/types/crm";

type Db = PrismaClient | Prisma.TransactionClient;

export class LeadError extends Error {
  constructor(message: string, readonly statusCode: number) {
    super(message);
    this.name = "LeadError";
  }
}

/* ── Row → domain mapping ──────────────────────────────────────────────────── */

type LeadRow = {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  source: string;
  budgetMinor: number | null;
  currency: string;
  requirements: string | null;
  notes: string | null;
  ownerId: string | null;
  stage: string;
  priority: string;
  expectedCloseDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export function toLead(row: LeadRow): Lead {
  return {
    id: row.id,
    name: row.name,
    company: row.company,
    email: row.email,
    phone: row.phone,
    source: row.source as LeadSourceValue,
    budgetMinor: row.budgetMinor,
    currency: row.currency,
    requirements: row.requirements,
    notes: row.notes,
    ownerId: row.ownerId,
    stage: row.stage as LeadStageValue,
    priority: row.priority as LeadPriorityValue,
    expectedCloseDate: row.expectedCloseDate?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/* ── Create / update ───────────────────────────────────────────────────────── */

export interface CreateLeadInput {
  name: string;
  company?: string | null;
  email: string;
  phone?: string | null;
  source?: LeadSourceValue;
  budgetMinor?: number | null;
  currency?: string;
  requirements?: string | null;
  notes?: string | null;
  ownerId?: string | null;
  priority?: LeadPriorityValue;
  expectedCloseDate?: Date | null;
}

/** Create a lead at the top of the funnel and notify the sales team (admins). */
export async function createLead(
  input: CreateLeadInput,
  actorId: string | null,
  db: Db = prisma
): Promise<Lead> {
  const name = input.name?.trim();
  const email = input.email?.trim();
  if (!name) throw new LeadError("Lead name is required.", 422);
  if (!email) throw new LeadError("Lead email is required.", 422);

  const row = await db.lead.create({
    data: {
      name,
      company: input.company?.trim() || null,
      email: email.toLowerCase(),
      phone: input.phone?.trim() || null,
      source: input.source ?? LEAD_SOURCE.WEBSITE,
      budgetMinor: input.budgetMinor ?? null,
      currency: input.currency ?? "INR",
      requirements: input.requirements?.trim() || null,
      notes: input.notes?.trim() || null,
      ownerId: input.ownerId ?? null,
      priority: input.priority ?? LEAD_PRIORITY.MEDIUM,
      stage: LEAD_STAGE.NEW,
      expectedCloseDate: input.expectedCloseDate ?? null,
    },
  });
  const lead = toLead(row);

  emitCrmRealtime(`lead-created-${lead.id}`, `New lead: ${lead.name}`, actorId);

  // Notify agency admins + the assigned owner. Best-effort — never break the write.
  try {
    const adminIds = await getAgencyAdminIds(db);
    if (adminIds.length) {
      await notifyMany(
        adminIds,
        {
          type: NOTIFICATION_TYPE.LEAD_ASSIGNED,
          audience: NOTIFICATION_AUDIENCE.ADMIN,
          title: `New lead: ${lead.name}`,
          body: lead.company ? `${lead.name} — ${lead.company}` : lead.name,
          data: { leadId: lead.id, href: `/admin/crm/leads/${lead.id}` },
        },
        db
      );
    }
    if (lead.ownerId && !adminIds.includes(lead.ownerId)) {
      await notify(
        {
          userId: lead.ownerId,
          type: NOTIFICATION_TYPE.LEAD_ASSIGNED,
          audience: NOTIFICATION_AUDIENCE.EMPLOYEE,
          title: `Lead assigned to you: ${lead.name}`,
          body: lead.company ?? null,
          data: { leadId: lead.id, href: `/admin/crm/leads/${lead.id}` },
        },
        db
      );
    }
  } catch {
    /* notifications are non-critical */
  }

  return lead;
}

export interface UpdateLeadInput {
  name?: string;
  company?: string | null;
  email?: string;
  phone?: string | null;
  source?: LeadSourceValue;
  budgetMinor?: number | null;
  currency?: string;
  requirements?: string | null;
  notes?: string | null;
  priority?: LeadPriorityValue;
  expectedCloseDate?: Date | null;
}

/** Patch a lead's editable fields (NOT stage/owner — those have dedicated paths). */
export async function updateLead(
  leadId: string,
  input: UpdateLeadInput,
  actorId: string | null,
  db: Db = prisma
): Promise<Lead> {
  const data: Prisma.LeadUpdateInput = {};
  if (input.name !== undefined) data.name = input.name.trim();
  if (input.company !== undefined) data.company = input.company?.trim() || null;
  if (input.email !== undefined) data.email = input.email.trim().toLowerCase();
  if (input.phone !== undefined) data.phone = input.phone?.trim() || null;
  if (input.source !== undefined) data.source = input.source;
  if (input.budgetMinor !== undefined) data.budgetMinor = input.budgetMinor;
  if (input.currency !== undefined) data.currency = input.currency;
  if (input.requirements !== undefined) data.requirements = input.requirements?.trim() || null;
  if (input.notes !== undefined) data.notes = input.notes?.trim() || null;
  if (input.priority !== undefined) data.priority = input.priority;
  if (input.expectedCloseDate !== undefined) data.expectedCloseDate = input.expectedCloseDate;

  const row = await db.lead.update({ where: { id: leadId }, data });
  const lead = toLead(row);
  emitCrmRealtime(`lead-updated-${lead.id}-${Date.now()}`, `Lead updated: ${lead.name}`, actorId);
  return lead;
}

/** (Re)assign the sales person on a lead, notifying the new owner. */
export async function assignLeadOwner(
  leadId: string,
  ownerId: string | null,
  actorId: string | null,
  db: Db = prisma
): Promise<Lead> {
  const row = await db.lead.update({ where: { id: leadId }, data: { ownerId } });
  const lead = toLead(row);

  emitCrmRealtime(`lead-assigned-${lead.id}-${Date.now()}`, `Lead reassigned: ${lead.name}`, actorId);

  if (ownerId) {
    try {
      await notify(
        {
          userId: ownerId,
          type: NOTIFICATION_TYPE.LEAD_ASSIGNED,
          audience: NOTIFICATION_AUDIENCE.EMPLOYEE,
          title: `Lead assigned to you: ${lead.name}`,
          body: lead.company ?? null,
          data: { leadId: lead.id, href: `/admin/crm/leads/${lead.id}` },
        },
        db
      );
    } catch {
      /* non-critical */
    }
  }
  return lead;
}

/* ── Stage change (the pipeline seam) ──────────────────────────────────────── */

/**
 * Move a lead to a new pipeline stage. Automatically records the change, emits a
 * realtime event, and notifies the lead owner + admins — the three side-effects
 * the sprint requires on every stage transition. No-op (returns current) if the
 * stage is unchanged.
 */
export async function changeLeadStage(
  leadId: string,
  stage: LeadStageValue,
  actorId: string | null,
  db: Db = prisma
): Promise<Lead> {
  const existing = await db.lead.findUnique({ where: { id: leadId } });
  if (!existing) throw new LeadError("Lead not found.", 404);
  if (existing.stage === stage) return toLead(existing);

  const row = await db.lead.update({ where: { id: leadId }, data: { stage } });
  const lead = toLead(row);

  const message = `${lead.name}: stage → ${stage.replace(/_/g, " ")}`;
  emitCrmRealtime(`lead-stage-${lead.id}-${Date.now()}`, message, actorId);

  // Notify the owner + admins the deal advanced. Best-effort.
  try {
    const recipients = new Set<string>();
    if (lead.ownerId) recipients.add(lead.ownerId);
    for (const id of await getAgencyAdminIds(db)) recipients.add(id);
    if (recipients.size) {
      await notifyMany(
        Array.from(recipients),
        {
          type: NOTIFICATION_TYPE.LEAD_STAGE_CHANGED,
          audience: NOTIFICATION_AUDIENCE.EMPLOYEE,
          title: message,
          body: lead.company ?? null,
          data: { leadId: lead.id, stage, href: `/admin/crm/leads/${lead.id}` },
        },
        db
      );
    }
  } catch {
    /* non-critical */
  }

  return lead;
}

/* ── Reads ─────────────────────────────────────────────────────────────────── */

export interface LeadFilter {
  search?: string | null;
  stage?: LeadStageValue | null;
  ownerId?: string | null;
  priority?: LeadPriorityValue | null;
  source?: LeadSourceValue | null;
  /** Inclusive lower bound on createdAt. */
  createdAfter?: Date | null;
}

/** List leads (newest first) with search + filters — the CRM list/table reader. */
export async function listLeads(filter: LeadFilter = {}, db: Db = prisma): Promise<Lead[]> {
  const where: Prisma.LeadWhereInput = {};

  if (filter.stage) where.stage = filter.stage;
  if (filter.ownerId) where.ownerId = filter.ownerId;
  if (filter.priority) where.priority = filter.priority;
  if (filter.source) where.source = filter.source;
  if (filter.createdAfter) where.createdAt = { gte: filter.createdAfter };

  const term = filter.search?.trim();
  if (term) {
    where.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { company: { contains: term, mode: "insensitive" } },
      { email: { contains: term, mode: "insensitive" } },
      { phone: { contains: term, mode: "insensitive" } },
    ];
  }

  const rows = await db.lead.findMany({ where, orderBy: { createdAt: "desc" } });
  return rows.map(toLead);
}

/** Fetch a single lead by id, or null. */
export async function getLead(leadId: string, db: Db = prisma): Promise<Lead | null> {
  const row = await db.lead.findUnique({ where: { id: leadId } });
  return row ? toLead(row) : null;
}
