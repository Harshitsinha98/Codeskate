/**
 * Prompt sanitization — the mandatory guard every prompt passes through before
 * a provider call. The AI layer only ever reads business data, but even that
 * read must NEVER carry secrets or internal-only information to a third-party
 * model. This module enforces that at a single seam.
 *
 * Two responsibilities:
 *   1. `redactSecrets(text)` — scrub anything that looks like an API key, token,
 *      password, or "internal/private note" out of free text before it is sent.
 *   2. `sanitizeActivities(...)` — drop INTERNAL timeline verbs (staffing/who is
 *      assigned) so client- and model-facing context never leaks internal ops.
 *
 * The context builder (`@/lib/ai/context`) already selects only non-sensitive
 * fields; this is the belt-and-braces final pass so no future caller can
 * accidentally hand a secret to a provider.
 *
 * Server-only.
 */

import { isInternalActivityVerb } from "@/constants/project";
import type { ProjectActivity } from "@/types/project";

/** Patterns that must never reach a provider. Matched case-insensitively. */
const SECRET_PATTERNS: RegExp[] = [
  // Common key formats.
  /sk-[A-Za-z0-9_-]{16,}/g, // OpenAI-style secret keys
  /sk-ant-[A-Za-z0-9_-]{16,}/g, // Anthropic keys
  /AIza[A-Za-z0-9_-]{20,}/g, // Google API keys
  /rzp_(live|test)_[A-Za-z0-9]+/g, // Razorpay key ids
  /\b[A-Za-z0-9_-]*secret[A-Za-z0-9_-]*\s*[:=]\s*\S+/gi, // foo_secret = ...
  // Bearer tokens / authorization headers.
  /bearer\s+[A-Za-z0-9._-]{16,}/gi,
  // Labelled sensitive fields (key: value) — internal notes, salary, etc.
  /\b(api[_-]?key|password|passwd|token|salary|private[_-]?note|internal[_-]?note)\b\s*[:=]\s*\S+/gi,
];

const REDACTION = "[REDACTED]";

/** Scrub secret-looking substrings out of a single string. */
export function redactSecrets(text: string): string {
  let out = text;
  for (const pattern of SECRET_PATTERNS) {
    out = out.replace(pattern, REDACTION);
  }
  return out;
}

/**
 * Filter a timeline to only the activities that are safe for AI context:
 * internal staffing verbs are removed entirely, and each surviving message is
 * run through `redactSecrets`. This is the same audience rule the client
 * timeline reader applies, reused here so AI never sees more than a client would
 * about internal operations.
 */
export function sanitizeActivities(
  activities: ProjectActivity[]
): { verb: string; message: string; createdAt: string }[] {
  return activities
    .filter((a) => !isInternalActivityVerb(a.verb))
    .map((a) => ({
      verb: a.verb,
      message: redactSecrets(a.message),
      createdAt: a.createdAt,
    }));
}

/**
 * Final safety pass over a fully-assembled prompt string. Called by the prompt
 * builder immediately before the request leaves for a provider.
 */
export function sanitizePrompt(prompt: string): string {
  return redactSecrets(prompt);
}
