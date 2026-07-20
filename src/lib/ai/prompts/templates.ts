/**
 * Prompt templates — the CENTRALIZED text for every AI feature. Business
 * modules must NEVER construct prompts directly; they request a feature and the
 * Prompt Builder (`@/lib/ai/prompts/builder`) assembles the final prompt from
 * these templates plus a sanitized data snapshot.
 *
 * Each template declares:
 *   - `title`   — the human title of the produced insight,
 *   - `task`    — the instruction block appended after the system prompt,
 *   - `format`  — the exact section headings the parser expects back, so the
 *                 response parser can split the model output deterministically.
 *
 * Keeping the format contract next to the task keeps generation and parsing in
 * sync in one place.
 */

import { AI_FEATURE, type AiFeatureValue } from "@/constants/ai";

export interface PromptTemplate {
  title: string;
  task: string;
  /** Section headings the model must use (also drive the parser). */
  sections: string[];
}

/** Shared preamble reminding the model of the read-only, no-secrets contract. */
const GUARDRAIL =
  "Use ONLY the data provided below. Do not invent facts, numbers, names or " +
  "dates. Never reveal internal notes, secrets, salaries or financial details. " +
  "Frame every recommendation as a suggestion for a human to act on. " +
  "Respond in plain text using the exact section headings requested.";

export const PROMPT_TEMPLATES: Record<AiFeatureValue, PromptTemplate> = {
  [AI_FEATURE.PROJECT_SUMMARY]: {
    title: "Project Summary",
    task:
      "Write a concise internal summary of this project's current state using " +
      "its current phase, timeline, recent deliverables, progress, assignments " +
      "and milestones. Keep it factual and skimmable.",
    sections: ["Overview", "Progress", "Milestones", "Next Steps"],
  },
  [AI_FEATURE.CLIENT_UPDATE]: {
    title: "Client Progress Update",
    task:
      "Write a professional, friendly progress update addressed to a " +
      "non-technical client. Explain what has been done and what is coming next " +
      "in plain language. Do NOT expose internal notes, task names, staffing or " +
      "any technical jargon. Keep an encouraging, reassuring tone.",
    sections: ["Summary", "Recent Progress", "What's Next"],
  },
  [AI_FEATURE.EXECUTIVE_SUMMARY]: {
    title: "Executive Summary",
    task:
      "Write a one-page management summary of agency delivery across all " +
      "projects covering project health, delivery status, upcoming milestones, " +
      "risks, pending approvals and outstanding deliverables.",
    sections: [
      "Project Health",
      "Delivery Status",
      "Upcoming Milestones",
      "Risks",
      "Pending Approvals",
      "Outstanding Deliverables",
    ],
  },
  [AI_FEATURE.RISK_DETECTION]: {
    title: "Risk Detection",
    task:
      "Analyse the project's timeline, deadlines, progress, deliverables and " +
      "assignments and detect risks: schedule risk, missing deliverables, no " +
      "recent activity, delayed milestones and blocked tasks. For EACH risk " +
      "output a line in the exact form: " +
      "'- [SEVERITY] Category: title — detail. Recommendation: ...' " +
      "where SEVERITY is LOW, MEDIUM or HIGH. If there are no risks, say so " +
      "under Risks. Generate recommendations only; take no action.",
    sections: ["Risks", "Recommendations"],
  },
  [AI_FEATURE.WEEKLY_REPORT]: {
    title: "Weekly Report",
    task:
      "Write a weekly status report for this project covering completed work, " +
      "pending work, upcoming tasks, potential risks and recommendations, based " +
      "on the recent activity and current state.",
    sections: [
      "Completed Work",
      "Pending Work",
      "Upcoming Tasks",
      "Potential Risks",
      "Recommendations",
    ],
  },
  [AI_FEATURE.DAILY_DIGEST]: {
    title: "Daily Digest",
    task:
      "Write a short daily digest tailored to the reader's role, highlighting " +
      "what changed, what needs attention today and any suggested focus. Keep " +
      "it to a few bullet points per section.",
    sections: ["Highlights", "Needs Attention", "Suggested Focus"],
  },
};

/** Look up a template by feature. */
export function getPromptTemplate(feature: AiFeatureValue): PromptTemplate {
  return PROMPT_TEMPLATES[feature];
}
