/**
 * GET /api/ready — readiness probe.
 *
 * Answers "should this instance receive traffic?" by verifying every REQUIRED
 * dependency (database, environment, storage) is up. Optional/env-gated features
 * (AI, payments) are reported but do NOT gate readiness. Returns 200 when ready,
 * 503 otherwise, with a per-dependency breakdown.
 */

import { NextResponse } from "next/server";
import { readiness } from "@/lib/health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { ready, checks } = await readiness();
  return NextResponse.json(
    { status: ready ? "ready" : "not-ready", checks },
    { status: ready ? 200 : 503, headers: { "Cache-Control": "no-store" } }
  );
}
