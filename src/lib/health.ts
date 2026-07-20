/**
 * Health-check probes for platform dependencies.
 *
 * These back the `/api/health`, `/api/ready`, and `/api/version` routes. Each
 * probe reuses the EXISTING abstraction for its dependency (prisma, AI config,
 * payment registry, storage) rather than reaching into internals, and reports a
 * uniform `{ status, detail? }`. Optional/env-gated features report `disabled`
 * (not `down`) when unconfigured, so an intentionally-off feature never fails a
 * readiness check.
 *
 * Server-only.
 */

import { prisma } from "@/lib/prisma";
import { getAiConfig } from "@/lib/ai";
import { getPaymentProvider, DEFAULT_PAYMENT_PROVIDER } from "@/lib/payments/registry";
import { getStorage } from "@/lib/storage";
import { validateEnv } from "@/lib/env";

export type CheckStatus = "up" | "down" | "disabled";

export interface CheckResult {
  status: CheckStatus;
  detail?: string;
}

/** DB connectivity — a trivial round-trip. Required for readiness. */
export async function checkDatabase(): Promise<CheckResult> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: "up" };
  } catch (error) {
    return { status: "down", detail: error instanceof Error ? error.message : "query failed" };
  }
}

/** AI provider — configured (key present) or gracefully disabled. Never required. */
export function checkAi(): CheckResult {
  const config = getAiConfig();
  return config.enabled
    ? { status: "up", detail: `${config.provider}:${config.model}` }
    : { status: "disabled", detail: "no provider API key configured" };
}

/** Payment provider — configured or disabled. Never required for readiness. */
export function checkPayments(): CheckResult {
  try {
    const adapter = getPaymentProvider(DEFAULT_PAYMENT_PROVIDER);
    return adapter.isConfigured()
      ? { status: "up", detail: DEFAULT_PAYMENT_PROVIDER }
      : { status: "disabled", detail: `${DEFAULT_PAYMENT_PROVIDER} not configured` };
  } catch (error) {
    return { status: "down", detail: error instanceof Error ? error.message : "no adapter" };
  }
}

/** Storage — verify the active provider is resolvable. Required for readiness. */
export function checkStorage(): CheckResult {
  try {
    getStorage();
    return { status: "up", detail: "local" };
  } catch (error) {
    return { status: "down", detail: error instanceof Error ? error.message : "unavailable" };
  }
}

/** Environment configuration validity. Required for readiness. */
export function checkEnv(): CheckResult {
  const { ok, errors } = validateEnv();
  return ok ? { status: "up" } : { status: "down", detail: errors.join("; ") };
}

/** Aggregate readiness: every REQUIRED probe must be `up` (disabled is fine). */
export async function readiness(): Promise<{
  ready: boolean;
  checks: Record<string, CheckResult>;
}> {
  const [database, env, storage, ai, payments] = await Promise.all([
    checkDatabase(),
    Promise.resolve(checkEnv()),
    Promise.resolve(checkStorage()),
    Promise.resolve(checkAi()),
    Promise.resolve(checkPayments()),
  ]);
  const checks = { database, env, storage, ai, payments };
  // Required dependencies gate readiness; optional ones may be `disabled`.
  const ready = [database, env, storage].every((c) => c.status === "up");
  return { ready, checks };
}
