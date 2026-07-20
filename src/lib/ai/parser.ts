/**
 * Response Parser — turns raw model prose into the structured `AiInsight`
 * shape the UI renders. The prompt builder instructs the model to emit `##`
 * headings matching the template's declared sections; this parser splits on
 * those headings, extracts bullet-style recommendations, and (for risk
 * detection) parses the `- [SEVERITY] Category: title — detail` risk lines.
 *
 * The parser is FORGIVING: if the model ignores the format, the whole text is
 * still returned as `text` so nothing is ever lost. AI output is advisory, so a
 * best-effort parse is the right contract.
 *
 * Pure functions — no I/O, easily unit-tested.
 */

import {
  AI_RISK_CATEGORY,
  AI_RISK_SEVERITY,
  type AiFeatureValue,
  type AiRiskCategoryValue,
  type AiRiskSeverityValue,
} from "@/constants/ai";
import type {
  AiInsight,
  AiInsightSection,
  AiRecommendation,
  AiRisk,
  AiCompletion,
} from "@/types/ai";

/** Split model text into sections keyed by `## Heading` lines. */
function splitSections(text: string): AiInsightSection[] {
  const lines = text.split(/\r?\n/);
  const sections: AiInsightSection[] = [];
  let current: AiInsightSection | null = null;

  for (const line of lines) {
    const heading = line.match(/^\s*#{1,6}\s+(.*\S)\s*$/);
    if (heading) {
      if (current) sections.push(current);
      current = { heading: heading[1].trim(), body: "" };
    } else if (current) {
      current.body += (current.body ? "\n" : "") + line;
    }
  }
  if (current) sections.push(current);
  return sections.map((s) => ({ heading: s.heading, body: s.body.trim() }));
}

/** Extract bullet lines from a "Recommendations" section, if present. */
function extractRecommendations(sections: AiInsightSection[]): AiRecommendation[] {
  const rec = sections.find((s) => /recommendation/i.test(s.heading));
  if (!rec) return [];
  return rec.body
    .split(/\r?\n/)
    .map((l) => l.replace(/^\s*[-*•\d.]+\s*/, "").trim())
    .filter(Boolean)
    .map((text) => ({ text }));
}

/** Map a free-text category label onto a known risk category. */
function toRiskCategory(label: string): AiRiskCategoryValue {
  const l = label.toLowerCase();
  if (l.includes("schedule")) return AI_RISK_CATEGORY.SCHEDULE;
  if (l.includes("missing") || l.includes("deliverable"))
    return AI_RISK_CATEGORY.MISSING_DELIVERABLE;
  if (l.includes("activity")) return AI_RISK_CATEGORY.NO_ACTIVITY;
  if (l.includes("milestone")) return AI_RISK_CATEGORY.DELAYED_MILESTONE;
  if (l.includes("block")) return AI_RISK_CATEGORY.BLOCKED_TASK;
  return AI_RISK_CATEGORY.SCHEDULE;
}

function toSeverity(label: string): AiRiskSeverityValue {
  const l = label.toLowerCase();
  if (l.includes("high")) return AI_RISK_SEVERITY.HIGH;
  if (l.includes("low")) return AI_RISK_SEVERITY.LOW;
  return AI_RISK_SEVERITY.MEDIUM;
}

/**
 * Parse risk lines of the form:
 *   - [HIGH] Schedule: title — detail. Recommendation: do X
 * Falls back to a single medium risk carrying the raw line if it doesn't match.
 */
function extractRisks(sections: AiInsightSection[]): AiRisk[] {
  const riskSection = sections.find((s) => /^risks?$/i.test(s.heading.trim()));
  if (!riskSection) return [];
  const risks: AiRisk[] = [];
  for (const raw of riskSection.body.split(/\r?\n/)) {
    const line = raw.replace(/^\s*[-*•]\s*/, "").trim();
    if (!line || /^(none|no risks?)\b/i.test(line)) continue;

    const m = line.match(
      /^\[?(high|medium|med|low)\]?\s*([^:—-]+?)\s*[:：]\s*(.+)$/i
    );
    if (!m) {
      risks.push({
        category: toRiskCategory(line),
        severity: AI_RISK_SEVERITY.MEDIUM,
        title: line.slice(0, 80),
        detail: line,
        recommendation: "",
      });
      continue;
    }
    const rest = m[3];
    const recMatch = rest.match(/recommendation\s*[:：]\s*(.+)$/i);
    const recommendation = recMatch ? recMatch[1].trim() : "";
    const beforeRec = recMatch ? rest.slice(0, recMatch.index).trim() : rest.trim();
    const [title, ...detailParts] = beforeRec.split(/\s*[—-]\s*/);
    risks.push({
      category: toRiskCategory(m[2]),
      severity: toSeverity(m[1]),
      title: (title ?? beforeRec).trim().replace(/\.$/, ""),
      detail: (detailParts.join(" - ") || beforeRec).trim(),
      recommendation,
    });
  }
  return risks;
}

/**
 * Build the final `AiInsight` from a completion. `feature`, `title` and the
 * `cached` flag are supplied by the service; everything else is parsed here.
 */
export function parseInsight(params: {
  feature: AiFeatureValue;
  title: string;
  completion: AiCompletion;
  cached: boolean;
  generatedAt: string;
}): AiInsight {
  const { completion } = params;
  const sections = splitSections(completion.text);
  return {
    feature: params.feature,
    title: params.title,
    text: completion.text,
    sections,
    recommendations: extractRecommendations(sections),
    risks: extractRisks(sections),
    meta: {
      provider: completion.provider,
      model: completion.model,
      live: completion.live,
      cached: params.cached,
      generatedAt: params.generatedAt,
    },
  };
}
