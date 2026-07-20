/**
 * AI Operations vocabulary — values only (the single source of truth the AI
 * types derive from). Consumed by the ONE AI layer (`@/lib/ai`).
 *
 * The AI layer is an ASSISTANT that sits on top of the platform. It only READS
 * existing business data and produces insights, summaries and recommendations —
 * it is never the source of truth and never mutates projects, orders, invoices,
 * payments, assignments, the timeline or deliverables.
 *
 * Providers model the same replaceable-seam pattern as the notification channels
 * and realtime/storage backends: OpenAI + Anthropic are implemented; Gemini,
 * OpenRouter and a future local LLM are declared-but-disabled so switching
 * providers is a CONFIG change with no business-module impact.
 */

/** Selectable AI providers. Only OpenAI + Anthropic are implemented today. */
export const AI_PROVIDER = {
  OPENAI: "openai",
  ANTHROPIC: "anthropic",
  GOOGLE: "google",
  OPENROUTER: "openrouter",
  LOCAL: "local",
} as const;

export type AiProviderValue = (typeof AI_PROVIDER)[keyof typeof AI_PROVIDER];

/**
 * The AI capabilities exposed by the AI service. One per generated insight kind.
 * Business modules request a feature; they never construct a prompt directly.
 */
export const AI_FEATURE = {
  PROJECT_SUMMARY: "project_summary",
  CLIENT_UPDATE: "client_update",
  EXECUTIVE_SUMMARY: "executive_summary",
  RISK_DETECTION: "risk_detection",
  WEEKLY_REPORT: "weekly_report",
  DAILY_DIGEST: "daily_digest",
} as const;

export type AiFeatureValue = (typeof AI_FEATURE)[keyof typeof AI_FEATURE];

/** Audience roles for the daily digest — each gets a role-specific view. */
export const AI_DIGEST_ROLE = {
  ADMIN: "admin",
  EMPLOYEE: "employee",
  CLIENT: "client",
} as const;

export type AiDigestRoleValue =
  (typeof AI_DIGEST_ROLE)[keyof typeof AI_DIGEST_ROLE];

/** Severity of a detected risk — drives tone/ordering in the UI. */
export const AI_RISK_SEVERITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
} as const;

export type AiRiskSeverityValue =
  (typeof AI_RISK_SEVERITY)[keyof typeof AI_RISK_SEVERITY];

/** Categories of risk the risk-detection feature looks for. */
export const AI_RISK_CATEGORY = {
  SCHEDULE: "schedule",
  MISSING_DELIVERABLE: "missing_deliverable",
  NO_ACTIVITY: "no_activity",
  DELAYED_MILESTONE: "delayed_milestone",
  BLOCKED_TASK: "blocked_task",
} as const;

export type AiRiskCategoryValue =
  (typeof AI_RISK_CATEGORY)[keyof typeof AI_RISK_CATEGORY];

/**
 * Default model generation settings, applied when the corresponding env var is
 * unset. All of provider/model/temperature/maxTokens/systemPrompt are
 * configurable (see `@/lib/ai/config`).
 */
export const AI_DEFAULTS = {
  PROVIDER: AI_PROVIDER.ANTHROPIC as AiProviderValue,
  TEMPERATURE: 0.4,
  MAX_TOKENS: 1024,
  /** Per-provider default model, used when AI_MODEL is unset. */
  MODEL: {
    [AI_PROVIDER.OPENAI]: "gpt-4o-mini",
    [AI_PROVIDER.ANTHROPIC]: "claude-3-5-haiku-latest",
    [AI_PROVIDER.GOOGLE]: "gemini-1.5-flash",
    [AI_PROVIDER.OPENROUTER]: "openai/gpt-4o-mini",
    [AI_PROVIDER.LOCAL]: "local-model",
  } as Record<AiProviderValue, string>,
  /** The house style applied to every generation unless overridden by env. */
  SYSTEM_PROMPT:
    "You are the operations assistant for a web agency's delivery platform. " +
    "You summarise and analyse existing project data to produce concise, " +
    "accurate, professional insights. You never invent facts, never expose " +
    "internal notes, secrets or financial details, and you always frame " +
    "recommendations as suggestions for a human to act on. You are an assistant, " +
    "not the source of truth.",
} as const;

/** In-memory cache foundation TTL (ms). Redis is intentionally NOT used yet. */
export const AI_CACHE_TTL_MS = 5 * 60 * 1000;
