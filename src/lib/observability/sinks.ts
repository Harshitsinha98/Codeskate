/**
 * Observability sinks — the future-integration seams for error reporting and
 * distributed tracing. Both are NO-OPS today (structured logs already go to
 * stdout/stderr), present so wiring Sentry and OpenTelemetry later is a single
 * change here with no business-module impact — the same "declared abstraction,
 * disabled implementation" pattern used for the unimplemented notification
 * channels and AI providers.
 *
 * Server-only.
 */

/** Error-reporting seam. Swap the body for `Sentry.captureException` later. */
export const SENTRY_HOOK = {
  /** True once a DSN is configured. Kept for callers that want to branch. */
  isEnabled(): boolean {
    return Boolean((process.env.SENTRY_DSN ?? "").trim());
  },
  /** Report an error to the future Sentry sink. No-op until wired. */
  captureError(_message: string, _context?: Record<string, unknown>): void {
    /* Future: Sentry.captureException(...) — intentionally a no-op today. */
  },
};

/** Tracing seam. Swap the body for an OpenTelemetry span later. */
export const OTEL_HOOK = {
  isEnabled(): boolean {
    return Boolean((process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? "").trim());
  },
  /**
   * Record a finished span/measurement. No-op until an OTel exporter is wired;
   * the performance timer (`@/lib/observability/timer`) calls this on stop.
   */
  recordSpan(_name: string, _durationMs: number, _context?: Record<string, unknown>): void {
    /* Future: OpenTelemetry span export — intentionally a no-op today. */
  },
};
