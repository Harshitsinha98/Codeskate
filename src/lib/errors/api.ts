/**
 * API route error handling — a thin wrapper that gives every route handler a
 * consistent success/error envelope, a request id, structured error logging, and
 * safe client messages (no stack traces). Opt-in: wrap a handler with
 * `withApi(...)`, or normalize a caught error with `apiError(...)`.
 *
 * Preserves the existing `{ data }` / `{ error: { code, message, details? } }`
 * convention already used across the API surface.
 */

import { NextResponse, type NextRequest } from "next/server";
import { toAppError, toPublicError } from "@/lib/errors/app-error";
import { logger } from "@/lib/observability/logger";
import {
  REQUEST_ID_HEADER,
  CORRELATION_ID_HEADER,
  resolveRequestIds,
} from "@/lib/observability/request-context";

type RouteHandler = (
  request: NextRequest,
  context: { params: Promise<Record<string, string>> }
) => Promise<Response> | Response;

/** Build a JSON error Response from any thrown value. */
export function apiError(error: unknown, requestId?: string): NextResponse {
  const appError = toAppError(error);
  if (appError.statusCode >= 500) {
    logger.error("api: unhandled error", { requestId, code: appError.code, error: appError });
  } else {
    logger.warn("api: request failed", {
      requestId,
      code: appError.code,
      status: appError.statusCode,
    });
  }
  const res = NextResponse.json(toPublicError(appError, requestId), {
    status: appError.statusCode,
  });
  if (requestId) res.headers.set(REQUEST_ID_HEADER, requestId);
  return res;
}

/**
 * Wrap a route handler: assigns a request id, catches every error, and returns a
 * safe envelope. The request id is echoed on both success and error responses so
 * clients/logs can correlate.
 */
export function withApi(handler: RouteHandler): RouteHandler {
  return async (request, context) => {
    const { requestId, correlationId } = resolveRequestIds(request.headers);
    const log = logger.child({ requestId, correlationId, path: new URL(request.url).pathname });
    try {
      const response = await handler(request, context);
      response.headers.set(REQUEST_ID_HEADER, requestId);
      response.headers.set(CORRELATION_ID_HEADER, correlationId);
      return response;
    } catch (error) {
      log.debug("api: caught in wrapper");
      const res = apiError(error, requestId);
      res.headers.set(CORRELATION_ID_HEADER, correlationId);
      return res;
    }
  };
}
