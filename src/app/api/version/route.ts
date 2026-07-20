/**
 * GET /api/version — build/version metadata.
 *
 * Exposes the deployed version, git commit, and runtime environment so a
 * deploy can be verified and logs correlated to a build. Values come from
 * environment variables injected at build/deploy time (all optional; unknown
 * when absent). Unauthenticated and cheap.
 */

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      name: "codeskate",
      version: process.env.npm_package_version ?? "0.0.0",
      commit: process.env.GIT_COMMIT_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? "unknown",
      environment: process.env.NODE_ENV ?? "development",
      node: process.version,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
