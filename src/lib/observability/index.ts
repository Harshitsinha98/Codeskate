/**
 * Observability barrel — the single import surface for logging, request ids and
 * timing. Business modules import from here: `import { logger } from
 * "@/lib/observability"`.
 */

export {
  logger,
  getLogger,
  LOG_LEVEL,
  type Logger,
  type LogContext,
  type LogLevelValue,
} from "@/lib/observability/logger";

export {
  REQUEST_ID_HEADER,
  CORRELATION_ID_HEADER,
  newRequestId,
  resolveRequestId,
  resolveCorrelationId,
  resolveRequestIds,
  type RequestIds,
} from "@/lib/observability/request-context";

export { startTimer, timed, type TimerHandle } from "@/lib/observability/timer";
export { SENTRY_HOOK, OTEL_HOOK } from "@/lib/observability/sinks";
