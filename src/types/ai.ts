/**
 * AI Operations domain types — derived from the constants in `@/constants/ai`
 * (the single source of truth for the vocabulary). These describe the shapes
 * the AI layer (`@/lib/ai`) accepts and returns.
 *
 * Everything here is READ-ONLY output: insights, summaries and recommendations.
 * No AI type mirrors a mutation — the AI layer never writes business data.
 */

import type {
  AiProviderValue,
  AiFeatureValue,
  AiDigestRoleValue,
  AiRiskSeverityValue,
  AiRiskCategoryValue,
} from "@/constants/ai";

/* ── Provider I/O ─────────────────────────────────────────────────────────── */

/** A single chat message handed to a provider. */
export interface AiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/** The provider-agnostic completion request built by the AI service. */
export interface AiCompletionRequest {
  system: string;
  messages: AiMessage[];
  model: string;
  temperature: number;
  maxTokens: number;
}

/** The provider-agnostic completion result. */
export interface AiCompletion {
  text: string;
  provider: AiProviderValue;
  model: string;
  /** True when the text came from a real provider call (vs a graceful stub). */
  live: boolean;
}

/* ── Insight output ───────────────────────────────────────────────────────── */

/** One labelled section of a generated insight (parsed from the model output). */
export interface AiInsightSection {
  heading: string;
  body: string;
}

/** One recommendation — advisory only, never auto-applied. */
export interface AiRecommendation {
  text: string;
}

/** A single detected risk with a category, severity and recommendation. */
export interface AiRisk {
  category: AiRiskCategoryValue;
  severity: AiRiskSeverityValue;
  title: string;
  detail: string;
  recommendation: string;
}

/**
 * The unified envelope every AI feature returns. `sections`/`risks` are the
 * structured, parsed content; `text` is the raw model prose (fallback render).
 */
export interface AiInsight {
  feature: AiFeatureValue;
  title: string;
  /** Free-text body — always present, even when structured parsing is partial. */
  text: string;
  sections: AiInsightSection[];
  recommendations: AiRecommendation[];
  risks: AiRisk[];
  meta: {
    provider: AiProviderValue;
    model: string;
    live: boolean;
    /** True when served from the in-memory cache foundation. */
    cached: boolean;
    generatedAt: string;
  };
}

/* ── Feature request inputs ───────────────────────────────────────────────── */

/** Which role a daily digest is generated for. */
export interface AiDigestRequest {
  role: AiDigestRoleValue;
  /** The user the digest is scoped to (client/employee). Admin = agency-wide. */
  userId?: string;
}

/** Resolved, ready-to-use AI configuration (see `@/lib/ai/config`). */
export interface AiConfig {
  provider: AiProviderValue;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  /** Whether a usable API key exists for the selected provider. */
  enabled: boolean;
}
