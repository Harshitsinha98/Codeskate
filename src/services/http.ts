/**
 * HTTP client — PLACEHOLDER (no implementation).
 * A typed fetch wrapper around the NestJS API is added in a later phase.
 * Contract mirrors docs/BACKEND.md §3.1 (envelope, versioning, auth header).
 */

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface HttpRequest {
  method: HttpMethod;
  path: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
}

const notImplemented = <T>(name: string): Promise<T> =>
  Promise.reject(new Error(`http.${name} not implemented`));

export const http = {
  request: <T>(_req: HttpRequest): Promise<T> => notImplemented<T>("request"),
};
