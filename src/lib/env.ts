/**
 * Environment validation — fail fast on misconfiguration, degrade gracefully on
 * absent OPTIONAL features.
 *
 * The platform already follows an "absent key = feature disabled" convention
 * (auth email, Google, Razorpay, AI). This module keeps that contract: only a
 * small set of variables are REQUIRED for the app to boot at all; everything
 * else is optional and validated for *shape* only when present. `assertEnv()` is
 * called once at startup (via `@/lib/startup`) and throws a single, actionable
 * error listing every problem — no silent failures, no scattered `process.env`
 * access without a fallback.
 *
 * Server-only.
 */

import { logger } from "@/lib/observability/logger";

/** Variables without which the app cannot function. */
const REQUIRED = ["DATABASE_URL", "BETTER_AUTH_SECRET"] as const;

/**
 * Optional variables that must come as a COMPLETE group when any is present
 * (partial config is a misconfiguration, not a disabled feature).
 */
const REQUIRED_GROUPS: { name: string; vars: string[] }[] = [
  { name: "Google OAuth", vars: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"] },
  { name: "Razorpay", vars: ["NEXT_PUBLIC_RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"] },
];

export interface EnvValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

function isSet(name: string): boolean {
  return Boolean((process.env[name] ?? "").trim());
}

/**
 * Validate the environment. Returns structured errors/warnings rather than
 * throwing, so a health check can surface them too.
 */
export function validateEnv(): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const name of REQUIRED) {
    if (!isSet(name)) errors.push(`Missing required env var: ${name}`);
  }

  // In production, a secret must be non-trivial.
  if (process.env.NODE_ENV === "production") {
    const secret = (process.env.BETTER_AUTH_SECRET ?? "").trim();
    if (secret && secret.length < 32) {
      errors.push("BETTER_AUTH_SECRET must be at least 32 characters in production.");
    }
    if (!isSet("BETTER_AUTH_URL") && !isSet("NEXT_PUBLIC_APP_URL")) {
      warnings.push(
        "Neither BETTER_AUTH_URL nor NEXT_PUBLIC_APP_URL is set — auth callbacks fall back to the request origin."
      );
    }
  }

  for (const group of REQUIRED_GROUPS) {
    const present = group.vars.filter(isSet);
    if (present.length > 0 && present.length < group.vars.length) {
      const missing = group.vars.filter((v) => !isSet(v));
      errors.push(
        `${group.name} is partially configured — missing: ${missing.join(", ")}. ` +
          `Set all of [${group.vars.join(", ")}] or none.`
      );
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}

/**
 * Assert the environment is valid, throwing a single actionable error listing
 * every problem. Called once at startup. Warnings are logged, not fatal.
 */
export function assertEnv(): void {
  const { ok, errors, warnings } = validateEnv();
  for (const w of warnings) logger.warn(`env: ${w}`);
  if (!ok) {
    const message =
      "Invalid environment configuration:\n" + errors.map((e) => `  • ${e}`).join("\n");
    throw new Error(message);
  }
  logger.info("env: configuration validated", {
    nodeEnv: process.env.NODE_ENV ?? "development",
  });
}
