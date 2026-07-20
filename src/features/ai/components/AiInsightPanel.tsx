import { AlertTriangle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/features/client-dashboard/components/StatusBadge";
import {
  riskSeverityPresentation,
  riskCategoryLabel,
} from "@/features/ai/lib/presentation";
import type { AiInsight } from "@/types/ai";

/**
 * Renders one `AiInsight` returned by the AI service: its parsed sections,
 * detected risks and advisory recommendations, plus a provenance footer making
 * clear the content is AI-generated and advisory (never the source of truth).
 *
 * Pure presentational — no data fetching. Reuses the dashboard's soft-pill
 * `StatusBadge` for severities.
 */
export function AiInsightPanel({
  insight,
  className,
}: {
  insight: AiInsight;
  className?: string;
}) {
  const hasStructured = insight.sections.length > 0 || insight.risks.length > 0;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Risks (risk-detection feature) */}
      {insight.risks.length > 0 && (
        <ul className="space-y-3">
          {insight.risks.map((risk, i) => (
            <li
              key={i}
              className="rounded-3xl border border-line bg-surface p-4 shadow-soft"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm font-medium text-ink">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  {riskCategoryLabel(risk.category)}
                </span>
                <StatusBadge presentation={riskSeverityPresentation(risk.severity)} />
              </div>
              {risk.title && (
                <p className="mt-2 text-sm font-medium text-ink">{risk.title}</p>
              )}
              {risk.detail && (
                <p className="mt-1 text-sm text-ink-muted">{risk.detail}</p>
              )}
              {risk.recommendation && (
                <p className="mt-2 text-xs text-royal-700">
                  Recommendation: {risk.recommendation}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Parsed sections */}
      {insight.sections.length > 0 && (
        <div className="space-y-5">
          {insight.sections.map((section, i) => (
            <section key={i}>
              <h3 className="text-xs font-medium uppercase tracking-wide text-ink-faint">
                {section.heading}
              </h3>
              <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      )}

      {/* Fallback: raw text when the model ignored the format contract */}
      {!hasStructured && (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
          {insight.text}
        </p>
      )}

      {/* Provenance — AI is an assistant, not the source of truth */}
      <footer className="flex items-center gap-2 border-t border-line pt-3 text-xs text-ink-faint">
        <Sparkles className="h-3.5 w-3.5" />
        <span>
          AI-generated {insight.meta.live ? "" : "(placeholder — no provider configured) "}
          via {insight.meta.provider} · {insight.meta.model}
          {insight.meta.cached ? " · cached" : ""}. Advisory only — verify against
          the platform.
        </span>
      </footer>
    </div>
  );
}
