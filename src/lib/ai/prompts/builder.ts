/**
 * Prompt Builder — the ONE place a final AI prompt is assembled. Business
 * modules never build prompts; they call the AI service, which calls this
 * builder with a feature + a sanitized data snapshot. Centralising assembly here
 * guarantees every prompt carries the same guardrails, the same format contract,
 * and one final secret-redaction pass before it leaves for a provider.
 *
 * Server-only.
 */

import type { AiCompletionRequest, AiConfig } from "@/types/ai";
import type { AiFeatureValue } from "@/constants/ai";
import { getPromptTemplate } from "@/lib/ai/prompts/templates";
import { sanitizePrompt } from "@/lib/ai/sanitize";

/**
 * Serialise a data snapshot to compact JSON for the prompt. The snapshot is
 * already sanitized by the context builder; JSON keeps it unambiguous for the
 * model. A final `sanitizePrompt` pass runs on the whole assembled user message.
 */
function renderData(data: unknown): string {
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
}

export interface BuildPromptInput {
  feature: AiFeatureValue;
  /** Sanitized business-data snapshot from `@/lib/ai/context`. */
  data: unknown;
  /** Optional extra instruction (e.g. digest role context). */
  note?: string;
  config: AiConfig;
}

/**
 * Assemble a provider-agnostic completion request for a feature. Returns the
 * request AND the template title so callers can label the resulting insight.
 */
export function buildPrompt(input: BuildPromptInput): {
  request: AiCompletionRequest;
  title: string;
  sections: string[];
} {
  const template = getPromptTemplate(input.feature);

  const formatBlock =
    `Structure your response under these exact headings, one per line, each ` +
    `heading followed by its content:\n` +
    template.sections.map((s) => `## ${s}`).join("\n");

  const userContent = [
    template.task,
    input.note ? `\nContext: ${input.note}` : "",
    `\nData:\n${renderData(input.data)}`,
    `\n${formatBlock}`,
  ].join("\n");

  // Final belt-and-braces redaction of the fully-assembled user message.
  const safeUser = sanitizePrompt(userContent);
  const system = sanitizePrompt(`${input.config.systemPrompt}\n\n${guardrailReminder()}`);

  return {
    request: {
      system,
      messages: [{ role: "user", content: safeUser }],
      model: input.config.model,
      temperature: input.config.temperature,
      maxTokens: input.config.maxTokens,
    },
    title: template.title,
    sections: template.sections,
  };
}

/** The read-only, no-secrets reminder appended to every system prompt. */
function guardrailReminder(): string {
  return (
    "You are an assistant, not the source of truth. Use only the supplied data. " +
    "Never expose secrets, API keys, internal notes, salaries or financial " +
    "details. Recommendations are advisory only."
  );
}
