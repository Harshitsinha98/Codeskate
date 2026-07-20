/**
 * AI Service — the ONE seam every AI feature is requested through. It sits ON
 * TOP of the platform and is strictly READ-ONLY: it reads existing business data
 * via the shared readers (through `@/lib/ai/context`), builds a prompt via the
 * centralized Prompt Builder, calls the configured provider, parses the response
 * and returns a structured `AiInsight`. It NEVER writes projects, orders,
 * invoices, payments, assignments, the timeline or deliverables.
 *
 * The pipeline for every feature is identical (mirrors the success flow):
 *   business data → context (sanitized) → prompt builder → provider → parser →
 *   insight, with the cache foundation consulted first and populated after.
 *
 * Server-only. This module is where realtime-triggered summaries, dashboards and
 * digests all converge onto one provider-agnostic path.
 */

import {
  AI_FEATURE,
  AI_DIGEST_ROLE,
  type AiFeatureValue,
  type AiDigestRoleValue,
} from "@/constants/ai";
import type { AiInsight } from "@/types/ai";
import { getAiConfig } from "@/lib/ai/config";
import { getAiProvider } from "@/lib/ai/provider";
import { buildPrompt } from "@/lib/ai/prompts/builder";
import { parseInsight } from "@/lib/ai/parser";
import { getAiCache, aiCacheKey } from "@/lib/ai/cache";
import {
  buildProjectContext,
  buildAgencyContext,
  buildClientContext,
  buildEmployeeContext,
} from "@/lib/ai/context";

/**
 * Run one feature end-to-end: cache lookup → context (already provided) →
 * prompt → provider → parse → cache store. `data` is the sanitized snapshot the
 * caller already built; `cacheKey` scopes the cached result.
 */
async function generate(params: {
  feature: AiFeatureValue;
  data: unknown;
  cacheKey: string;
  note?: string;
}): Promise<AiInsight> {
  const cache = getAiCache();
  const cached = cache.get(params.cacheKey);
  if (cached) {
    return { ...cached, meta: { ...cached.meta, cached: true } };
  }

  const config = getAiConfig();
  const { request, title } = buildPrompt({
    feature: params.feature,
    data: params.data,
    note: params.note,
    config,
  });

  const completion = await getAiProvider().complete(request);
  const insight = parseInsight({
    feature: params.feature,
    title,
    completion,
    cached: false,
    generatedAt: new Date().toISOString(),
  });

  // Only cache real (live) generations — stubs should retry once configured.
  if (completion.live) cache.set(params.cacheKey, insight);
  return insight;
}

/** A clear "project not found" insight (read-only, never throws to the UI). */
function notFound(feature: AiFeatureValue): AiInsight {
  const config = getAiConfig();
  return {
    feature,
    title: "Unavailable",
    text: "The requested project could not be found.",
    sections: [],
    recommendations: [],
    risks: [],
    meta: {
      provider: config.provider,
      model: config.model,
      live: false,
      cached: false,
      generatedAt: new Date().toISOString(),
    },
  };
}

export const aiService = {
  /** 1. Concise internal project summary (phase, timeline, progress, etc.). */
  async generateProjectSummary(projectId: string): Promise<AiInsight> {
    const data = await buildProjectContext(projectId);
    if (!data) return notFound(AI_FEATURE.PROJECT_SUMMARY);
    return generate({
      feature: AI_FEATURE.PROJECT_SUMMARY,
      data,
      cacheKey: aiCacheKey(AI_FEATURE.PROJECT_SUMMARY, projectId, String(data.progressPct)),
    });
  },

  /** 2. Client-friendly progress update (no internal notes/jargon). */
  async generateClientUpdate(projectId: string): Promise<AiInsight> {
    const data = await buildProjectContext(projectId);
    if (!data) return notFound(AI_FEATURE.CLIENT_UPDATE);
    // Strip internal-only fields for the client-facing generation.
    const clientData = {
      name: data.name,
      status: data.status,
      progressPct: data.progressPct,
      currentPhase: data.currentPhase,
      estimatedCompletion: data.estimatedCompletion,
      deliverables: data.deliverables.filter((d) => d.status === "approved"),
      recentActivity: data.recentActivity,
    };
    return generate({
      feature: AI_FEATURE.CLIENT_UPDATE,
      data: clientData,
      cacheKey: aiCacheKey(AI_FEATURE.CLIENT_UPDATE, projectId, String(data.progressPct)),
    });
  },

  /** 3. One-page agency-wide executive summary for management. */
  async generateExecutiveSummary(): Promise<AiInsight> {
    const data = await buildAgencyContext();
    return generate({
      feature: AI_FEATURE.EXECUTIVE_SUMMARY,
      data,
      cacheKey: aiCacheKey(
        AI_FEATURE.EXECUTIVE_SUMMARY,
        String(data.metrics.activeProjects),
        String(data.outstandingDeliverables)
      ),
    });
  },

  /** 4. Risk detection for a project — recommendations only, no actions. */
  async detectRisks(projectId: string): Promise<AiInsight> {
    const data = await buildProjectContext(projectId);
    if (!data) return notFound(AI_FEATURE.RISK_DETECTION);
    return generate({
      feature: AI_FEATURE.RISK_DETECTION,
      data,
      cacheKey: aiCacheKey(
        AI_FEATURE.RISK_DETECTION,
        projectId,
        String(data.blockedTasks.length),
        String(data.progressPct)
      ),
    });
  },

  /** 5. Weekly report for a project (completed/pending/upcoming/risks/recs). */
  async generateWeeklyReport(projectId: string): Promise<AiInsight> {
    const data = await buildProjectContext(projectId);
    if (!data) return notFound(AI_FEATURE.WEEKLY_REPORT);
    return generate({
      feature: AI_FEATURE.WEEKLY_REPORT,
      data,
      cacheKey: aiCacheKey(
        AI_FEATURE.WEEKLY_REPORT,
        projectId,
        String(data.recentActivity.length),
        String(data.progressPct)
      ),
    });
  },

  /** 6. Role-specific daily digest (admin / employee / client). */
  async generateDailyDigest(
    role: AiDigestRoleValue,
    userId?: string
  ): Promise<AiInsight> {
    let data: unknown;
    let scope: string;

    if (role === AI_DIGEST_ROLE.ADMIN) {
      data = await buildAgencyContext();
      scope = "admin";
    } else if (role === AI_DIGEST_ROLE.EMPLOYEE) {
      if (!userId) return notFound(AI_FEATURE.DAILY_DIGEST);
      data = await buildEmployeeContext(userId);
      scope = `employee:${userId}`;
    } else {
      if (!userId) return notFound(AI_FEATURE.DAILY_DIGEST);
      data = await buildClientContext(userId);
      scope = `client:${userId}`;
    }

    return generate({
      feature: AI_FEATURE.DAILY_DIGEST,
      data,
      note: `The reader's role is "${role}". Tailor tone and detail to that role.`,
      cacheKey: aiCacheKey(AI_FEATURE.DAILY_DIGEST, role, userId),
    });
  },
};

export type AiOperationsService = typeof aiService;
