/**
 * AI Provider abstraction — the ONE seam the AI service uses to reach a model.
 *
 * Deliberately provider-agnostic, mirroring the notification-channel and
 * realtime/storage provider patterns: the AI service talks only to the
 * `AiProvider` interface, never to a concrete SDK, so switching providers is a
 * CONFIG change (`AI_PROVIDER=...`) with ZERO business-module impact.
 *
 * Implemented today: OpenAI + Anthropic (via each vendor's REST API using the
 * built-in `fetch` — no SDK dependency added). Declared-but-disabled: Google
 * Gemini, OpenRouter and a future local LLM — present so the factory enumerates
 * every provider and a concrete one drops in later with no call-site change.
 *
 * Graceful degradation: when no API key is configured the factory returns a
 * `DisabledProvider` whose `complete()` yields a clearly-labelled stub instead
 * of throwing — the same "absent key = feature disabled, never crash" contract
 * the auth/payment layers use.
 *
 * Server-only. API keys must never reach the client.
 */

import { AI_PROVIDER, type AiProviderValue } from "@/constants/ai";
import type { AiCompletion, AiCompletionRequest } from "@/types/ai";
import { getAiConfig, providerApiKey } from "@/lib/ai/config";

/** The replaceable AI contract. A future vendor implements this one method. */
export interface AiProvider {
  readonly provider: AiProviderValue;
  /** Whether this provider has a usable key/endpoint configured. */
  isEnabled(): boolean;
  /** Produce a completion for the given request. Must resolve, not reject, on
   *  provider errors — it returns a labelled stub so a feature never crashes. */
  complete(request: AiCompletionRequest): Promise<AiCompletion>;
}

/** Shared: build a graceful, clearly-labelled stub completion. */
function stubCompletion(
  provider: AiProviderValue,
  model: string,
  reason: string
): AiCompletion {
  return {
    text:
      `AI is currently unavailable (${reason}). ` +
      "This is a placeholder — no live model was called. " +
      "Configure a provider API key to enable AI insights.",
    provider,
    model,
    live: false,
  };
}

/* ── OpenAI (Chat Completions REST) ────────────────────────────────────────── */

class OpenAiProvider implements AiProvider {
  readonly provider = AI_PROVIDER.OPENAI;
  isEnabled(): boolean {
    return providerApiKey(this.provider).length > 0;
  }

  async complete(request: AiCompletionRequest): Promise<AiCompletion> {
    const key = providerApiKey(this.provider);
    if (!key) return stubCompletion(this.provider, request.model, "no API key");
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: request.model,
          temperature: request.temperature,
          max_tokens: request.maxTokens,
          messages: [
            { role: "system", content: request.system },
            ...request.messages,
          ],
        }),
      });
      if (!res.ok) {
        return stubCompletion(this.provider, request.model, `HTTP ${res.status}`);
      }
      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const text = data.choices?.[0]?.message?.content?.trim() ?? "";
      if (!text) return stubCompletion(this.provider, request.model, "empty response");
      return { text, provider: this.provider, model: request.model, live: true };
    } catch (err) {
      return stubCompletion(
        this.provider,
        request.model,
        err instanceof Error ? err.message : "request failed"
      );
    }
  }
}

/* ── Anthropic (Messages REST) ─────────────────────────────────────────────── */

class AnthropicProvider implements AiProvider {
  readonly provider = AI_PROVIDER.ANTHROPIC;
  isEnabled(): boolean {
    return providerApiKey(this.provider).length > 0;
  }

  async complete(request: AiCompletionRequest): Promise<AiCompletion> {
    const key = providerApiKey(this.provider);
    if (!key) return stubCompletion(this.provider, request.model, "no API key");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: request.model,
          max_tokens: request.maxTokens,
          temperature: request.temperature,
          system: request.system,
          // Anthropic accepts only user/assistant roles in `messages`.
          messages: request.messages.map((m) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: m.content,
          })),
        }),
      });
      if (!res.ok) {
        return stubCompletion(this.provider, request.model, `HTTP ${res.status}`);
      }
      const data = (await res.json()) as { content?: { text?: string }[] };
      const text = (data.content ?? [])
        .map((block) => block.text ?? "")
        .join("")
        .trim();
      if (!text) return stubCompletion(this.provider, request.model, "empty response");
      return { text, provider: this.provider, model: request.model, live: true };
    } catch (err) {
      return stubCompletion(
        this.provider,
        request.model,
        err instanceof Error ? err.message : "request failed"
      );
    }
  }
}

/* ── Declared-but-disabled providers ───────────────────────────────────────── */

/**
 * A provider present in the registry but with no concrete transport yet
 * (Google Gemini, OpenRouter, local LLM). `isEnabled()` is false so the factory
 * never selects it, and `complete()` returns a labelled stub. Swapping in a real
 * implementation is a single change here — no call site changes.
 */
class UnimplementedAiProvider implements AiProvider {
  constructor(readonly provider: AiProviderValue) {}
  isEnabled(): boolean {
    return false;
  }
  async complete(request: AiCompletionRequest): Promise<AiCompletion> {
    return stubCompletion(this.provider, request.model, "provider not implemented");
  }
}

/* ── Factory ───────────────────────────────────────────────────────────────── */

/** Construct the concrete provider for a given key (registry seam). */
function build(provider: AiProviderValue): AiProvider {
  switch (provider) {
    case AI_PROVIDER.OPENAI:
      return new OpenAiProvider();
    case AI_PROVIDER.ANTHROPIC:
      return new AnthropicProvider();
    default:
      // Gemini / OpenRouter / local — declared but not yet implemented.
      return new UnimplementedAiProvider(provider);
  }
}

/**
 * Resolve the AI provider selected in config. Currently OpenAI or Anthropic;
 * selecting another provider is a config change and returns its (disabled)
 * placeholder until its transport is implemented here. Requires NO changes at
 * any call site — the AI service always talks to the `AiProvider` interface.
 */
export function getAiProvider(): AiProvider {
  return build(getAiConfig().provider);
}
