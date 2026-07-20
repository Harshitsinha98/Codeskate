"use client";

import { useState, useTransition } from "react";
import { Loader2, Sparkles, RefreshCw } from "lucide-react";
import { AiInsightPanel } from "@/features/ai/components/AiInsightPanel";
import {
  generateProjectSummaryAction,
  generateClientUpdateAction,
  generateExecutiveSummaryAction,
  detectRisksAction,
  generateWeeklyReportAction,
  generateDailyDigestAction,
} from "@/app/admin/ai/actions";
import { AI_DIGEST_ROLE, type AiDigestRoleValue } from "@/constants/ai";
import type { AiInsight } from "@/types/ai";

/**
 * The kinds of AI insight this button can generate. Each maps to one read-only
 * server action over `aiService`. `digest:*` variants pass a role.
 */
export type AiInsightKind =
  | "project_summary"
  | "client_update"
  | "risk_detection"
  | "weekly_report"
  | "executive_summary"
  | "daily_digest";

/**
 * On-demand AI insight generator. Matches the interaction pattern of the finance
 * `RefundButton` (client component, `useTransition`, inline error), but is
 * strictly read-only: it calls an AI action, receives an `AiInsight`, and renders
 * it in place. Nothing in the business domain is mutated or revalidated.
 */
export function GenerateInsightButton({
  kind,
  projectId,
  digestRole = AI_DIGEST_ROLE.ADMIN,
  label,
}: {
  kind: AiInsightKind;
  projectId?: string;
  digestRole?: AiDigestRoleValue;
  label: string;
}) {
  const [insight, setInsight] = useState<AiInsight | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await dispatch(kind, projectId, digestRole);
        setInsight(result);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Generation failed.");
      }
    });
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={run}
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-royal/40 hover:text-royal-700 disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : insight ? (
          <RefreshCw className="h-4 w-4" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        {insight ? `Regenerate ${label}` : label}
      </button>

      {error && <p className="text-xs text-red-600">{error}</p>}
      {insight && <AiInsightPanel insight={insight} />}
    </div>
  );
}

/** Route a kind to its read-only server action. */
function dispatch(
  kind: AiInsightKind,
  projectId: string | undefined,
  digestRole: AiDigestRoleValue
): Promise<AiInsight> {
  switch (kind) {
    case "project_summary":
      return generateProjectSummaryAction(projectId ?? "");
    case "client_update":
      return generateClientUpdateAction(projectId ?? "");
    case "risk_detection":
      return detectRisksAction(projectId ?? "");
    case "weekly_report":
      return generateWeeklyReportAction(projectId ?? "");
    case "executive_summary":
      return generateExecutiveSummaryAction();
    case "daily_digest":
      return generateDailyDigestAction(digestRole);
  }
}
