/**
 * AI layer barrel — the single import surface for the AI Operations Platform.
 * The AI layer sits ON TOP of the platform and is strictly read-only: it reads
 * existing business data and produces insights, summaries and recommendations.
 *
 * Business modules import the service + types from here; the provider, prompt
 * and cache internals are reached only through the service seam.
 */

export { aiService, type AiOperationsService } from "@/lib/ai/service";
export { getAiConfig } from "@/lib/ai/config";
export { getAiProvider, type AiProvider } from "@/lib/ai/provider";
export { getAiCache, aiCacheKey, type AiCache } from "@/lib/ai/cache";
