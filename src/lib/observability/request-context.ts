/**
 * Request / Correlation ID utilities.
 *
 * A request id uniquely identifies one inbound request; a correlation id ties
 * together work that spans several requests/services (propagated via an inbound
 * header). Both are attached to log lines through `logger.child({ requestId })`
 * so a production log search can reconstruct a full request timeline.
 *
 * Edge-safe: uses the Web Crypto `randomUUID` available in both the Node and
 * edge runtimes. No Node-only imports, so this can be used from the proxy too.
 */

/** Standard header names used to read/propagate ids. */
export const REQUEST_ID_HEADER = "x-request-id";
export const CORRELATION_ID_HEADER = "x-correlation-id";

/** Generate a fresh id. */
export function newRequestId(): string {
  // `crypto` is a global in both Node 18+ and the edge runtime.
  return crypto.randomUUID();
}

/**
 * Resolve the request id for an inbound request: honour an upstream
 * `x-request-id` if present (so a proxy/load-balancer id is preserved), else
 * mint a new one.
 */
export function resolveRequestId(headers: Headers): string {
  return headers.get(REQUEST_ID_HEADER)?.trim() || newRequestId();
}

/** Resolve the correlation id: honour an upstream header, else fall back to the request id. */
export function resolveCorrelationId(headers: Headers, requestId: string): string {
  return headers.get(CORRELATION_ID_HEADER)?.trim() || requestId;
}

/** The id pair carried alongside a request. */
export interface RequestIds {
  requestId: string;
  correlationId: string;
}

/** Resolve both ids from inbound headers in one call. */
export function resolveRequestIds(headers: Headers): RequestIds {
  const requestId = resolveRequestId(headers);
  return { requestId, correlationId: resolveCorrelationId(headers, requestId) };
}
