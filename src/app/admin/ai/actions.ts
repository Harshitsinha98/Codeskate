"use server";

/**
 * AI Operations actions — the authorized read surface for the admin AI page.
 *
 * Every action: (1) re-checks admin authorization server-side via `requireAdmin`
 * (never trusts the client), and (2) delegates to the read-only AI service
 * (`@/lib/ai`). The AI layer NEVER mutates business data, so these actions
 * revalidate NOTHING — there is nothing to invalidate. They simply return the
 * generated `AiInsight` to the client component that requested it.
 *
 * This is a thin, authorized wrapper over `aiService`; no business logic and no
 * prompt construction lives here (prompts are built centrally in `@/lib/ai`).
 */

import { headers } from "next/headers";
import { requireAdmin } from "@/lib/admin-auth";
import { aiService } from "@/lib/ai";
import { enforceRateLimit } from "@/lib/rate-limit";
import { AI_DIGEST_ROLE, type AiDigestRoleValue } from "@/constants/ai";
import type { AiInsight } from "@/types/ai";

/**
 * Authorize + throttle an AI action. AI calls are the most expensive surface
 * (external provider, per-token cost), so every action passes through the `ai`
 * rate-limit policy keyed by the admin's id.
 */
async function guard(): Promise<{ id: string }> {
  const admin = await requireAdmin();
  await enforceRateLimit("ai", await headers(), admin.id);
  return admin;
}

export async function generateProjectSummaryAction(
  projectId: string
): Promise<AiInsight> {
  await guard();
  return aiService.generateProjectSummary(projectId);
}

export async function generateClientUpdateAction(
  projectId: string
): Promise<AiInsight> {
  await guard();
  return aiService.generateClientUpdate(projectId);
}

export async function generateExecutiveSummaryAction(): Promise<AiInsight> {
  await guard();
  return aiService.generateExecutiveSummary();
}

export async function detectRisksAction(projectId: string): Promise<AiInsight> {
  await guard();
  return aiService.detectRisks(projectId);
}

export async function generateWeeklyReportAction(
  projectId: string
): Promise<AiInsight> {
  await guard();
  return aiService.generateWeeklyReport(projectId);
}

export async function generateDailyDigestAction(
  role: AiDigestRoleValue = AI_DIGEST_ROLE.ADMIN,
  userId?: string
): Promise<AiInsight> {
  const admin = await guard();
  // Admin digest is agency-wide; employee/client digests are scoped to a user.
  const scopeUser = role === AI_DIGEST_ROLE.ADMIN ? undefined : userId ?? admin.id;
  return aiService.generateDailyDigest(role, scopeUser);
}
