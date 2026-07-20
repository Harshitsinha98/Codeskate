/**
 * CRM dashboard reader — server-only aggregation for the CRM overview.
 *
 * Read-only: rolls up lead counts by stage, the conversion-rate foundation
 * (won / (won + lost)), recent leads, upcoming meetings, and proposal status
 * counts. No mutations, no side-effects — the write paths live in
 * `@/lib/lead-service` / `@/lib/proposal-service`. Reuses the Prisma singleton
 * and the CRM constants (single source of truth).
 */

import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { toLead } from "@/lib/lead-service";
import { isEmployeeEmail } from "@/lib/employee-auth";
import {
  LEAD_STAGE,
  PROPOSAL_STATUS,
  type LeadStageValue,
  type ProposalStatusValue,
} from "@/constants/crm";
import type { CrmDashboard, LeadStage, ProposalStatus } from "@/types/crm";

type Db = PrismaClient | Prisma.TransactionClient;

/** A selectable sales person for the lead owner dropdown. */
export interface CrmSalesperson {
  id: string;
  name: string | null;
  email: string;
}

/** Users eligible to own leads — the CRM staff (employee allowlist incl. admins). */
export async function listCrmSalespeople(db: Db = prisma): Promise<CrmSalesperson[]> {
  const users = await db.user.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
  return users.filter((u) => isEmployeeEmail(u.email));
}

const ALL_STAGES = Object.values(LEAD_STAGE) as LeadStageValue[];
const ALL_PROPOSAL_STATUSES = Object.values(PROPOSAL_STATUS) as ProposalStatusValue[];

/** Build the full CRM dashboard read model in one pass of grouped queries. */
export async function getCrmDashboard(db: Db = prisma): Promise<CrmDashboard> {
  const [stageGroups, proposalGroups, recentRows, meetingRows] = await Promise.all([
    db.lead.groupBy({ by: ["stage"], _count: { _all: true } }),
    db.proposal.groupBy({ by: ["status"], _count: { _all: true } }),
    db.lead.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    db.lead.findMany({
      where: {
        stage: LEAD_STAGE.MEETING_SCHEDULED,
        expectedCloseDate: { not: null },
      },
      orderBy: { expectedCloseDate: "asc" },
      take: 8,
    }),
  ]);

  const stageCounts = Object.fromEntries(ALL_STAGES.map((s) => [s, 0])) as Record<LeadStage, number>;
  for (const g of stageGroups) {
    stageCounts[g.stage as LeadStage] = g._count._all;
  }

  const proposalStatusCounts = Object.fromEntries(
    ALL_PROPOSAL_STATUSES.map((s) => [s, 0])
  ) as Record<ProposalStatus, number>;
  for (const g of proposalGroups) {
    proposalStatusCounts[g.status as ProposalStatus] = g._count._all;
  }

  const totalLeads = ALL_STAGES.reduce((sum, s) => sum + stageCounts[s], 0);
  const wonLeads = stageCounts[LEAD_STAGE.WON];
  const lostLeads = stageCounts[LEAD_STAGE.LOST];
  const activeLeads =
    totalLeads - wonLeads - lostLeads - stageCounts[LEAD_STAGE.ARCHIVED];
  const decided = wonLeads + lostLeads;
  const conversionRatePct = decided === 0 ? 0 : Math.round((wonLeads / decided) * 100);

  return {
    stageCounts,
    totalLeads,
    activeLeads,
    wonLeads,
    lostLeads,
    conversionRatePct,
    recentLeads: recentRows.map(toLead),
    upcomingMeetings: meetingRows.map(toLead),
    proposalStatusCounts,
  };
}
