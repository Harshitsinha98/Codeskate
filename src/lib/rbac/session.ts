/**
 * Better Auth server session bridge for RBAC.
 * Server-only: reads the request's cookies via `next/headers` and asks Better
 * Auth to resolve (and, if needed, refresh) the session — the single
 * integration point between RBAC and the auth engine (`@/lib/auth`).
 */

import { headers } from "next/headers";
import { auth } from "@/lib/auth";

/**
 * Resolve the current request's Better Auth session (or null if unauthenticated).
 * Safe to call from Server Components, Route Handlers, and Server Actions.
 */
export async function getServerSession() {
  return auth.api.getSession({ headers: await headers() });
}
