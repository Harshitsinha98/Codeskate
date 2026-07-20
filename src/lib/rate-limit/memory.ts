/**
 * In-memory fixed-window rate limiter. Correct for a single server instance
 * (dev, small deployments). For multi-instance production, swap in a shared
 * store (Redis) behind the same `RateLimiter` interface — see `getRateLimiter`.
 */

import type { RateLimiter, RateLimitResult } from "@/lib/rate-limit/limiter";

interface Window {
  count: number;
  resetAt: number;
}

export class InMemoryRateLimiter implements RateLimiter {
  private readonly windows = new Map<string, Window>();
  private lastSweep = 0;

  async consume(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
    const now = Date.now();
    this.maybeSweep(now);

    let win = this.windows.get(key);
    if (!win || win.resetAt <= now) {
      win = { count: 0, resetAt: now + windowMs };
      this.windows.set(key, win);
    }

    win.count += 1;
    const remaining = Math.max(0, limit - win.count);
    const ok = win.count <= limit;
    return {
      ok,
      limit,
      remaining,
      resetAt: win.resetAt,
      retryAfterSeconds: ok ? 0 : Math.max(1, Math.ceil((win.resetAt - now) / 1000)),
    };
  }

  /** Periodically drop expired windows so the map doesn't grow unbounded. */
  private maybeSweep(now: number): void {
    if (now - this.lastSweep < 60_000) return;
    this.lastSweep = now;
    for (const [key, win] of this.windows) {
      if (win.resetAt <= now) this.windows.delete(key);
    }
  }
}
