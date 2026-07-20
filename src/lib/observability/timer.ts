/**
 * Performance Timer — a tiny helper for measuring how long an operation takes
 * and emitting it through the structured logger + the OpenTelemetry seam. Used
 * by the health checks and available to any business module that wants to time a
 * slow path without hand-rolling `Date.now()` math.
 *
 * `startTimer(name)` returns a handle; call `.stop(context?)` to get the elapsed
 * milliseconds (also logged at debug + forwarded to the OTel hook). Uses
 * `performance.now()` (monotonic, available in Node + edge) so it is immune to
 * wall-clock adjustments.
 *
 * Server-only in practice (logger is server-only), but has no Node-only imports.
 */

import { logger, type LogContext } from "@/lib/observability/logger";
import { OTEL_HOOK } from "@/lib/observability/sinks";

export interface TimerHandle {
  /** Stop the timer, returning elapsed milliseconds (rounded to 0.1ms). */
  stop(context?: LogContext): number;
}

/** Start a named timer. */
export function startTimer(name: string): TimerHandle {
  const startedAt = performance.now();
  return {
    stop(context?: LogContext): number {
      const durationMs = Math.round((performance.now() - startedAt) * 10) / 10;
      logger.debug(`timing:${name}`, { name, durationMs, ...(context ?? {}) });
      OTEL_HOOK.recordSpan(name, durationMs, context);
      return durationMs;
    },
  };
}

/** Time an async operation, returning its result and logging the duration. */
export async function timed<T>(
  name: string,
  fn: () => Promise<T>,
  context?: LogContext
): Promise<T> {
  const timer = startTimer(name);
  try {
    return await fn();
  } finally {
    timer.stop(context);
  }
}
