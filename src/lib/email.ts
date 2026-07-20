/**
 * Transactional email sender — ENV-GATED via Resend's REST API (no SDK dep).
 *
 * If RESEND_API_KEY is absent, email is considered DISABLED: `isEmailEnabled()`
 * returns false and callers skip wiring email flows entirely (so nothing ever
 * tries to send and crash). Add the key + rebuild to auto-enable verification
 * and password reset. Server-only.
 */

/** True when email sending is configured. Read at module load by the auth config. */
export function isEmailEnabled(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send an email via Resend. Only called when `isEmailEnabled()` is true.
 * Throws on transport failure (Better Auth surfaces this as a normal error;
 * it does not crash the process).
 */
export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Defensive: should never be reached because callers gate on isEmailEnabled().
    throw new Error("Email is not configured (RESEND_API_KEY missing).");
  }

  const from = process.env.EMAIL_FROM ?? "AgencyOS <onboarding@resend.dev>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend send failed (${res.status}): ${detail}`);
  }
}
