/**
 * AI response cache — FOUNDATION ONLY (in-memory).
 *
 * Requirement: "Prepare support for AI response caching. Do NOT implement Redis
 * yet." So this defines the replaceable `AiCache` interface (the seam a Redis /
 * KV backend will implement later) and ships a single-process in-memory default
 * with TTL eviction — exactly mirroring how the realtime layer ships an
 * in-process provider behind a swappable interface.
 *
 * Swapping in Redis later is a one-line change in `getAiCache()`; no AI-service
 * call site changes because they only ever talk to the `AiCache` interface.
 *
 * Server-only.
 */

import { AI_CACHE_TTL_MS } from "@/constants/ai";
import type { AiInsight } from "@/types/ai";

/** The replaceable cache contract. A future Redis backend implements these. */
export interface AiCache {
  get(key: string): AiInsight | undefined;
  set(key: string, value: AiInsight, ttlMs?: number): void;
  /** Remove one key (e.g. after fresh business data invalidates an insight). */
  invalidate(key: string): void;
  clear(): void;
}

interface Entry {
  value: AiInsight;
  expiresAt: number;
}

/**
 * In-memory cache. Deterministic (no wall-clock in the key) — expiry uses
 * `Date.now()` only at read/write time, which is fine for a runtime cache.
 */
class InMemoryAiCache implements AiCache {
  private readonly store = new Map<string, Entry>();

  get(key: string): AiInsight | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: AiInsight, ttlMs: number = AI_CACHE_TTL_MS): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  invalidate(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

// Cache across hot-reloads / route invocations in the same process, like the
// Prisma and realtime singletons.
const globalForAiCache = globalThis as unknown as {
  aiCache: AiCache | undefined;
};

/**
 * Resolve the active AI cache. In-memory today; swapping in Redis later is a
 * one-line change here with no call-site impact.
 */
export function getAiCache(): AiCache {
  if (!globalForAiCache.aiCache) {
    globalForAiCache.aiCache = new InMemoryAiCache();
  }
  return globalForAiCache.aiCache;
}

/**
 * Build a stable cache key from a feature and its scope inputs. Order-stable and
 * free of any secret material (inputs are ids/roles only).
 */
export function aiCacheKey(feature: string, ...parts: (string | undefined)[]): string {
  return [feature, ...parts.map((p) => p ?? "-")].join(":");
}
