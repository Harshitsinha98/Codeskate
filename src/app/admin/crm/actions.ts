"use server";

/**
 * CRM server actions — the authorized write surface for the Sales CRM UI.
 *
 * Each action re-checks CRM authorization server-side via `requireCrmUser`
 * (admin / sales only — never trusts the client), delegates to the EXISTING CRM
 * services (`@/lib/lead-service`, `@/lib/proposal-service`) — which log/notify/
 * emit realtime through the shared layers — and revalidates the affected CRM
 * routes so the server components re-render. No business logic lives here.
 */

import { revalidatePath } from "next/cache";
import { requireCrmUser } from "@/lib/crm-auth";
import {
  createLead,
  updateLead,
  assignLeadOwner,
  changeLeadStage,
  type CreateLeadInput,
  type UpdateLeadInput,
} from "@/lib/lead-service";
import {
  createProposal,
  setProposalStatus,
  acceptProposal,
  type CreateProposalInput,
} from "@/lib/proposal-service";
import type { LeadStageValue } from "@/constants/crm";
import type { ProposalStatusValue } from "@/constants/crm";

function revalidateCrm(leadId?: string): void {
  revalidatePath("/admin/crm");
  revalidatePath("/admin/crm/leads");
  revalidatePath("/admin/crm/proposals");
  if (leadId) revalidatePath(`/admin/crm/leads/${leadId}`);
}

/* ── Leads ─────────────────────────────────────────────────────────────────── */

export async function createLeadAction(input: CreateLeadInput): Promise<string> {
  const crm = await requireCrmUser();
  const lead = await createLead(input, crm.id);
  revalidateCrm(lead.id);
  return lead.id;
}

export async function updateLeadAction(leadId: string, input: UpdateLeadInput): Promise<void> {
  const crm = await requireCrmUser();
  await updateLead(leadId, input, crm.id);
  revalidateCrm(leadId);
}

export async function assignLeadOwnerAction(leadId: string, ownerId: string | null): Promise<void> {
  const crm = await requireCrmUser();
  await assignLeadOwner(leadId, ownerId, crm.id);
  revalidateCrm(leadId);
}

export async function changeLeadStageAction(leadId: string, stage: LeadStageValue): Promise<void> {
  const crm = await requireCrmUser();
  await changeLeadStage(leadId, stage, crm.id);
  revalidateCrm(leadId);
}

/* ── Proposals ─────────────────────────────────────────────────────────────── */

export async function createProposalAction(input: CreateProposalInput): Promise<string> {
  const crm = await requireCrmUser();
  const proposal = await createProposal(input, crm.id);
  revalidateCrm(input.leadId);
  return proposal.id;
}

export async function setProposalStatusAction(
  proposalId: string,
  leadId: string,
  status: ProposalStatusValue
): Promise<void> {
  const crm = await requireCrmUser();
  await setProposalStatus(proposalId, status, crm.id);
  revalidateCrm(leadId);
}

/** Accept a proposal → returns the EXISTING checkout URL for the hand-off. */
export async function acceptProposalAction(
  proposalId: string,
  leadId: string
): Promise<{ checkoutUrl: string }> {
  const crm = await requireCrmUser();
  const { checkoutUrl } = await acceptProposal(proposalId, crm.id);
  revalidateCrm(leadId);
  return { checkoutUrl };
}
