/**
 * Server Action error handling.
 *
 * Server Actions return values to client components rather than HTTP responses,
 * so they use a discriminated `ActionResult` envelope instead of `NextResponse`.
 * `withAction` wraps an action, catches any throw, logs unexpected errors with a
 * request id, and returns a safe, typed failure the UI can render — never a
 * stack trace.
 */

import { toAppError } from "@/lib/errors/app-error";
import { logger } from "@/lib/observability/logger";
import { newRequestId } from "@/lib/observability/request-context";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; details?: unknown; requestId?: string } };

export const actionOk = <T>(data: T): ActionResult<T> => ({ ok: true, data });

/**
 * Wrap a server action body. Any thrown value is normalized: expected AppErrors
 * surface their safe message; unexpected errors are logged with a request id and
 * reported generically.
 */
export async function withAction<T>(
  name: string,
  fn: () => Promise<T>
): Promise<ActionResult<T>> {
  try {
    return actionOk(await fn());
  } catch (error) {
    const appError = toAppError(error);
    const requestId = newRequestId();
    if (appError.statusCode >= 500) {
      logger.error(`action: ${name} failed`, { requestId, code: appError.code, error: appError });
    } else {
      logger.warn(`action: ${name} rejected`, { requestId, code: appError.code });
    }
    const message = appError.expose
      ? appError.message
      : "Something went wrong. Please try again.";
    return {
      ok: false,
      error: {
        code: appError.code,
        message,
        ...(appError.expose && appError.details !== undefined ? { details: appError.details } : {}),
        requestId,
      },
    };
  }
}
