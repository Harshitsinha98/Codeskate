/**
 * Privileged-identity guard — server-only.
 *
 * Every privileged gate (admin, employee, finance, CRM) authorizes by email
 * allowlist. An allowlist entry is a claim about an *email address*, so it is
 * only trustworthy once that address is proven to belong to the session user.
 * Better Auth only enforces verification when email sending is configured
 * (`requireEmailVerification: authFlags.emailEnabled`), which means in an
 * email-disabled deployment a user can register with an allowlisted admin
 * address and reach `emailVerified: false` — privilege escalation.
 *
 * This is the single seam that closes that hole: a privileged role is granted
 * only to a session whose email is verified. When email is disabled no identity
 * can ever be verified, so privileged access fails SAFE (denied) rather than
 * open. It never affects unprivileged/client access, which is gated elsewhere.
 */

/** The subset of a Better Auth session user this guard needs. */
interface VerifiableUser {
  emailVerified?: boolean | null;
}

/**
 * True only when the session user's email is proven (`emailVerified === true`).
 * Any other value — false, null, undefined, missing — is treated as unverified
 * so the caller denies privileged access.
 */
export function isVerifiedIdentity(
  user: VerifiableUser | null | undefined
): boolean {
  return user?.emailVerified === true;
}
