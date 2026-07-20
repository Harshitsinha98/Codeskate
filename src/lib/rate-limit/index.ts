/**
 * Rate-limit policies + factory + request helpers.
 *
 * Policies are named buckets with a limit/window, covering the sensitive
 * surfaces called out for hardening: auth, checkout, payments, AI, uploads, and
 * public APIs. `getRateLimiter()` is a `globalThis`-cached singleton mirroring
 * the other provider factories; it selects the backend by config (currently only
 * in-memory — Redis is a future drop-in behind the same interface).
 */

import type { RateLimiter, RateLimitResult } from "@/lib/rate-limit/limiter";
import { InMemoryRateLimiter } from "@/lib/rate-limit/memory";
import { rateLimited } from "@/lib/errors/app-error";

/** Named policies. Windows are in milliseconds. */
export const RATE_POLICIES = {
  auth: { limit: 10, windowMs: 60_000 },
  checkout: { limit: 20, windowMs: 60_000 },
  payment: { limit: 15, windowMs: 60_000 },
  ai: { limit: 12, windowMs: 60_000 },
  upload: { limit: 30, windowMs: 60_000 },
  download: { limit: 60, windowMs: 60_000 },
  public: { limit: 100, windowMs: 60_000 },
} as const;

export type RatePolicy = keyof typeof RATE_POLICIES;

const GLOBAL_KEY = "__codeskate_rate_limiter__";

/** Cached singleton, resilient to dev hot-reload (mirrors other factories). */
export function getRateLimiter(): RateLimiter {
  const g = globalThis as typeof globalThis & { [GLOBAL_KEY]?: RateLimiter };
  if (!g[GLOBAL_KEY]) {
    // Backend selection point: when a shared store is configured (e.g.
    // REDIS_URL), construct a Redis-backed limiter here instead. Call sites and
    // the `RateLimiter` interface remain unchanged.
    g[GLOBAL_KEY] = new InMemoryRateLimiter();
  }
  return g[GLOBAL_KEY];
}

/**
 * Best-effort client identifier for rate-limit keys: prefer an authenticated
 * subject id, else the forwarded client IP, else a shared fallback.
 */
export function clientKeyFromHeaders(headers: Headers, subjectId?: string | null): string {
  if (subjectId) return `u:${subjectId}`;
  const fwd = headers.get("x-forwarded-for");
  const ip = fwd ? fwd.split(",")[0]!.trim() : headers.get("x-real-ip")?.trim();
  return ip ? `ip:${ip}` : "anon";
}

/**
 * Apply a named policy for an inbound request. Returns the result so callers can
 * set rate-limit headers; throws a `RATE_LIMITED` AppError when the limit is
 * exceeded (caught by `withApi` into a 429 with the safe message).
 */
export async function enforceRateLimit(
  policy: RatePolicy,
  headers: Headers,
  subjectId?: string | null
): Promise<RateLimitResult> {
  const { limit, windowMs } = RATE_POLICIES[policy];
  const key = `${policy}:${clientKeyFromHeaders(headers, subjectId)}`;
  const result = await getRateLimiter().consume(key, limit, windowMs);
  if (!result.ok) {
    throw rateLimited(`Too many requests. Try again in ${result.retryAfterSeconds}s.`);
  }
  return result;
}

/** Standard rate-limit headers for a response. */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "RateLimit-Limit": String(result.limit),
    "RateLimit-Remaining": String(result.remaining),
    "RateLimit-Reset": String(Math.ceil((result.resetAt - Date.now()) / 1000)),
  };
}
