/**
 * Typed application errors + a stable public error shape.
 *
 * The codebase already returns `{ error: { code, message, details? } }` from API
 * routes and `{ data }` on success (see `order-service`/checkout routes). This
 * module formalizes that contract so every route/action reports errors the same
 * way, without leaking stack traces or internal messages to clients.
 *
 * `AppError` is the base for expected, client-safe failures. Anything else is an
 * unexpected error: it is logged with full context server-side and surfaced to
 * the client as a generic 500 with a correlation id.
 */

/** Machine-readable error codes → default HTTP status. */
export const ERROR_STATUS: Record<string, number> = {
  BAD_REQUEST: 400,
  VALIDATION: 422,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  UNAVAILABLE: 503,
  INTERNAL: 500,
};

export type ErrorCode = keyof typeof ERROR_STATUS;

/** The wire shape returned to clients. Never contains stack traces. */
export interface PublicError {
  error: {
    code: string;
    message: string;
    details?: unknown;
    requestId?: string;
  };
}

/**
 * An expected, client-safe error. Its `message` is considered safe to show to
 * end users. Unexpected `Error`s are NOT AppErrors and are never shown verbatim.
 */
export class AppError extends Error {
  readonly code: ErrorCode;
  readonly statusCode: number;
  readonly details?: unknown;
  /** When false, the message is replaced by a generic one before sending. */
  readonly expose: boolean;

  constructor(
    code: ErrorCode,
    message: string,
    options: { statusCode?: number; details?: unknown; expose?: boolean; cause?: unknown } = {}
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = options.statusCode ?? ERROR_STATUS[code] ?? 500;
    this.details = options.details;
    this.expose = options.expose ?? true;
    if (options.cause !== undefined) this.cause = options.cause;
  }
}

// Convenience constructors for the common cases.
export const badRequest = (message = "Invalid request.", details?: unknown) =>
  new AppError("BAD_REQUEST", message, { details });
export const validation = (message = "Some fields are invalid.", details?: unknown) =>
  new AppError("VALIDATION", message, { details });
export const unauthorized = (message = "Authentication required.") =>
  new AppError("UNAUTHORIZED", message);
export const forbidden = (message = "You do not have access to this resource.") =>
  new AppError("FORBIDDEN", message);
export const notFound = (message = "Not found.") => new AppError("NOT_FOUND", message);
export const conflict = (message = "The request conflicts with the current state.") =>
  new AppError("CONFLICT", message);
export const rateLimited = (message = "Too many requests. Please try again shortly.") =>
  new AppError("RATE_LIMITED", message);
export const unavailable = (message = "This feature is temporarily unavailable.") =>
  new AppError("UNAVAILABLE", message);

/** True for objects shaped like `{ statusCode: number; message: string }`. */
function hasStatusCode(e: unknown): e is { statusCode: number; message: string; details?: unknown } {
  return (
    typeof e === "object" &&
    e !== null &&
    typeof (e as { statusCode?: unknown }).statusCode === "number" &&
    typeof (e as { message?: unknown }).message === "string"
  );
}

/**
 * Normalize any thrown value into an AppError. Recognizes AppError directly and
 * status-carrying domain errors (e.g. `OrderError`) by structural shape, so
 * existing services don't need to change. Everything else becomes a generic,
 * non-exposed INTERNAL error preserving the original as `cause`.
 */
export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  if (hasStatusCode(error)) {
    const status = error.statusCode;
    const code =
      (Object.keys(ERROR_STATUS) as ErrorCode[]).find((c) => ERROR_STATUS[c] === status) ??
      "INTERNAL";
    return new AppError(code, error.message, {
      statusCode: status,
      details: error.details,
      expose: status < 500,
      cause: error,
    });
  }

  return new AppError("INTERNAL", "An unexpected error occurred.", {
    expose: false,
    cause: error,
  });
}

/** Build the client-safe wire payload, hiding non-exposed messages. */
export function toPublicError(error: AppError, requestId?: string): PublicError {
  const message = error.expose ? error.message : genericMessageFor(error.statusCode);
  return {
    error: {
      code: error.code,
      message,
      ...(error.expose && error.details !== undefined ? { details: error.details } : {}),
      ...(requestId ? { requestId } : {}),
    },
  };
}

function genericMessageFor(status: number): string {
  if (status >= 500) return "An unexpected error occurred. Please try again.";
  if (status === 404) return "Not found.";
  if (status === 403) return "You do not have access to this resource.";
  if (status === 401) return "Authentication required.";
  return "The request could not be completed.";
}
