/**
 * Auth proxy (Next.js 16's "proxy" file convention, formerly "middleware") —
 * protects the authenticated app surfaces ONLY.
 *
 * Uses an optimistic cookie check (edge-safe, no DB/Prisma here): if no session
 * cookie is present on a protected route, redirect to /login with a ?redirect
 * back. Full session validation happens server-side in the app.
 *
 * This is coarse, edge-safe AUTHENTICATION only (is there a session?). Fine-
 * grained AUTHORIZATION (role/permission checks) lives in `@/lib/rbac`, which
 * runs in Server Components/Route Handlers where Prisma/Better Auth's full
 * session + organization context is available — the edge runtime here cannot
 * reach the database.
 *
 * IMPORTANT: the matcher lists ONLY protected prefixes. Marketing routes, auth
 * pages, /api, and static assets are never matched — the marketing website is
 * completely untouched by this proxy.
 */

import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/client/:path*",
    "/admin/:path*",
    "/employee/:path*",
    "/finance/:path*",
    "/support/:path*",
    "/settings/:path*",
  ],
};
