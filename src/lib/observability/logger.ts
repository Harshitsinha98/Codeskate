/**
 * Structured Logger — the ONE logging seam every module uses. Deliberately
 * transport-agnostic, mirroring the realtime/storage/notification provider
 * pattern: callers talk only to the `Logger` interface, never to `console`
 * directly, so a future Sentry / OpenTelemetry / hosted-logging sink drops in
 * here with no call-site changes.
 *
 * Output today is structured JSON to stdout/stderr (one line per event), which
 * every production log collector (Datadog, Loki, CloudWatch, Vercel) ingests
 * natively. Each entry carries a level, message, ISO timestamp and an arbitrary
 * context bag — including a request/correlation id when the caller binds one
 * (see `@/lib/observability/request-context`).
 *
 * Server-only. Never import from client components.
 */

import { SENTRY_HOOK } from "@/lib/observability/sinks";

export const LOG_LEVEL = {
  DEBUG: "debug",
  INFO: "info",
  WARN: "warn",
  ERROR: "error",
} as const;

export type LogLevelValue = (typeof LOG_LEVEL)[keyof typeof LOG_LEVEL];

const LEVEL_WEIGHT: Record<LogLevelValue, number> = {
  [LOG_LEVEL.DEBUG]: 10,
  [LOG_LEVEL.INFO]: 20,
  [LOG_LEVEL.WARN]: 30,
  [LOG_LEVEL.ERROR]: 40,
};

/** Arbitrary structured context attached to a log line. */
export type LogContext = Record<string, unknown>;

export interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
  /** Return a child logger whose context is merged into every line (e.g. a request id). */
  child(bindings: LogContext): Logger;
}

/** The minimum level emitted. `LOG_LEVEL` env overrides; defaults by NODE_ENV. */
function threshold(): number {
  const raw = (process.env.LOG_LEVEL ?? "").trim().toLowerCase();
  if (raw && raw in LEVEL_WEIGHT) return LEVEL_WEIGHT[raw as LogLevelValue];
  return process.env.NODE_ENV === "production"
    ? LEVEL_WEIGHT[LOG_LEVEL.INFO]
    : LEVEL_WEIGHT[LOG_LEVEL.DEBUG];
}

/** Redact obviously-sensitive keys so a stray secret never reaches the sink. */
const SENSITIVE_KEY = /(secret|password|token|api[_-]?key|authorization|signature)/i;
function sanitizeContext(context: LogContext): LogContext {
  const out: LogContext = {};
  for (const [k, v] of Object.entries(context)) {
    out[k] = SENSITIVE_KEY.test(k) ? "[REDACTED]" : v;
  }
  return out;
}

class JsonLogger implements Logger {
  constructor(private readonly bindings: LogContext = {}) {}

  private emit(level: LogLevelValue, message: string, context?: LogContext): void {
    if (LEVEL_WEIGHT[level] < threshold()) return;
    const merged = sanitizeContext({ ...this.bindings, ...(context ?? {}) });
    const line = {
      level,
      message,
      time: new Date().toISOString(),
      ...merged,
    };
    // Route errors to stderr, everything else to stdout.
    const serialized = safeStringify(line);
    if (level === LOG_LEVEL.ERROR) console.error(serialized);
    else console.log(serialized);

    // Future Sentry/OTel integration: a no-op hook today, a single seam later.
    if (level === LOG_LEVEL.ERROR) SENTRY_HOOK.captureError(message, merged);
  }

  debug(message: string, context?: LogContext): void {
    this.emit(LOG_LEVEL.DEBUG, message, context);
  }
  info(message: string, context?: LogContext): void {
    this.emit(LOG_LEVEL.INFO, message, context);
  }
  warn(message: string, context?: LogContext): void {
    this.emit(LOG_LEVEL.WARN, message, context);
  }
  error(message: string, context?: LogContext): void {
    this.emit(LOG_LEVEL.ERROR, message, context);
  }
  child(bindings: LogContext): Logger {
    return new JsonLogger({ ...this.bindings, ...bindings });
  }
}

/** JSON.stringify that never throws (handles circular refs / BigInt). */
function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value, (_key, val) =>
      typeof val === "bigint" ? val.toString() : val
    );
  } catch {
    return JSON.stringify({ level: "error", message: "log serialization failed" });
  }
}

const globalForLogger = globalThis as unknown as { logger: Logger | undefined };

/** The process-wide root logger. Bind a request id via `logger.child({ requestId })`. */
export function getLogger(): Logger {
  if (!globalForLogger.logger) {
    globalForLogger.logger = new JsonLogger();
  }
  return globalForLogger.logger;
}

/** Convenience singleton for modules that don't need a bound child. */
export const logger: Logger = getLogger();
