/**
 * GET /api/health — liveness probe.
 *
 * Answers "is the process up and able to serve?" with a lightweight DB
 * round-trip. Intentionally cheap and unauthenticated so an orchestrator can
 * poll it frequently. Returns 200 when alive, 503 when the DB is unreachable.
 */

import { NextResponse } from "next/server";
import { checkDatabase } from "@/lib/health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const database = await checkDatabase();
  const ok = database.status === "up";
  return NextResponse.json(
    { status: ok ? "ok" : "degraded", checks: { database } },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } }
  );
}
