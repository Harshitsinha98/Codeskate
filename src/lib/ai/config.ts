/**
 * AI configuration — the ONE place the AI layer resolves its runtime settings.
 *
 * Follows the same env-gating pattern the rest of the platform uses (auth's
 * `authFlags`, Razorpay, Resend): every AI setting is configurable via env, and
 * an ABSENT API key means the feature is disabled gracefully — never a crash.
 * Provider / model / temperature / maxTokens / systemPrompt are ALL configurable
 * so switching providers is a config change with no business-module impact.
 *
 * Server-only — reads process.env (API keys must never reach the client).
 */

import {
  AI_DEFAULTS,
  AI_PROVIDER,
  type AiProviderValue,
} from "@/constants/ai";
import type { AiConfig } from "@/types/ai";

/** Normalise an env string into a known provider, falling back to the default. */
function resolveProvider(raw: string | undefined): AiProviderValue {
  const value = (raw ?? "").trim().toLowerCase();
  const known = Object.values(AI_PROVIDER) as string[];
  return known.includes(value) ? (value as AiProviderValue) : AI_DEFAULTS.PROVIDER;
}

/** The API-key env var name for each provider. */
const PROVIDER_KEY_ENV: Record<AiProviderValue, string> = {
  [AI_PROVIDER.OPENAI]: "OPENAI_API_KEY",
  [AI_PROVIDER.ANTHROPIC]: "ANTHROPIC_API_KEY",
  [AI_PROVIDER.GOOGLE]: "GOOGLE_AI_API_KEY",
  [AI_PROVIDER.OPENROUTER]: "OPENROUTER_API_KEY",
  [AI_PROVIDER.LOCAL]: "AI_LOCAL_BASE_URL",
};

/** Read the API key (or local base URL) for a provider. */
export function providerApiKey(provider: AiProviderValue): string {
  return (process.env[PROVIDER_KEY_ENV[provider]] ?? "").trim();
}

function parseNumber(raw: string | undefined, fallback: number): number {
  const n = Number(raw);
  return raw != null && raw !== "" && Number.isFinite(n) ? n : fallback;
}

/**
 * Resolve the active AI configuration from env, applying defaults. `enabled`
 * reflects whether the selected provider has a usable key — the AI service uses
 * it to short-circuit to a graceful stub instead of calling a provider.
 */
export function getAiConfig(): AiConfig {
  const provider = resolveProvider(process.env.AI_PROVIDER);
  const model = (process.env.AI_MODEL ?? "").trim() || AI_DEFAULTS.MODEL[provider];
  const temperature = Math.max(
    0,
    Math.min(2, parseNumber(process.env.AI_TEMPERATURE, AI_DEFAULTS.TEMPERATURE))
  );
  const maxTokens = Math.max(
    1,
    Math.round(parseNumber(process.env.AI_MAX_TOKENS, AI_DEFAULTS.MAX_TOKENS))
  );
  const systemPrompt =
    (process.env.AI_SYSTEM_PROMPT ?? "").trim() || AI_DEFAULTS.SYSTEM_PROMPT;

  return {
    provider,
    model,
    temperature,
    maxTokens,
    systemPrompt,
    enabled: providerApiKey(provider).length > 0,
  };
}
