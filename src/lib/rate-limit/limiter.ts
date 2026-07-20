/**
 * Rate limiting — a provider-agnostic interface mirroring the codebase's other
 * provider abstractions (storage/realtime/AI). The default implementation is an
 * in-memory fixed-window limiter suitable for a single instance; a Redis-backed
 * limiter can be dropped in later without touching call sites (config-only
 * switch), which is why the store is expressed as an async interface.
 *
 * Server-only. Keyed by an opaque string (typically `${bucket}:${ip|userId}`).
 */

export interface RateLimitResult {
  /** Whether the request is allowed. */
  ok: boolean;
  /** Max requests permitted in the window. */
  limit: number;
  /** Requests remaining in the current window (>= 0). */
  remaining: number;
  /** Unix ms when the current window resets. */
  resetAt: number;
  /** Seconds until reset — for a `Retry-After` header when `ok` is false. */
  retryAfterSeconds: number;
}

export interface RateLimiter {
  /** Consume one unit against `key`, given a limit/window policy. */
  consume(key: string, limit: number, windowMs: number): Promise<RateLimitResult>;
}
