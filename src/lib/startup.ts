/**
 * Startup validation — a single idempotent entry point run once when the server
 * process boots (via `instrumentation.ts`). Validates the environment and emits
 * a structured startup log. Kept separate from `instrumentation.ts` so it can be
 * imported directly by tooling/tests without the Next.js runtime gate.
 *
 * Server-only.
 */

import { assertEnv } from "@/lib/env";
import { logger } from "@/lib/observability/logger";

let ran = false;

/** Run startup checks exactly once per process. */
export function runStartupChecks(): void {
  if (ran) return;
  ran = true;

  const startedAt = process.env.npm_package_version ?? "unknown";
  logger.info("startup: initializing", { version: startedAt });

  // Throws with an actionable, aggregated message on misconfiguration so the
  // process fails fast rather than serving broken requests.
  assertEnv();
}
