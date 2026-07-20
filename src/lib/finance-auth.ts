/**
 * Finance authorization gate — server-only.
 *
 * Finance & Billing is agency-internal on the write side: only the admin
 * (ADMIN_EMAILS) and the future Finance Manager may create/refund/adjust; a
 * client may only VIEW + download their OWN invoices (enforced separately in the
 * client read path by `clientId` scoping). Until the RBAC role backend lands,
 * "finance staff" reuses the SAME env-allowlist seam the rest of the app uses —
 * `isAdminEmail` today. This is the single seam to swap for
 * `hasRole(ctx, [ROLES.ADMIN, ROLES.FINANCE_MANAGER])` later — no finance call
 * site changes.
 *
 * The Finance Manager role is prepared here through the architecture: a
 * dedicated `FINANCE_MANAGER_EMAILS` allowlist folds in on top of admins, so
 * granting finance access later is a config change, not a code change.
 */

import { getServerSession } from "@/lib/rbac/session";
import { isAdminEmail } from "@/lib/admin-auth";
import { isVerifiedIdentity } from "@/lib/privileged-identity";

/** Parse FINANCE_MANAGER_EMAILS once: lowercased, trimmed, comma-separated. */
function financeManagerEmails(): Set<string> {
  const raw = process.env.FINANCE_MANAGER_EMAILS ?? "";
  return new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  );
}

/** True if the email may manage finance (admins + the future finance managers). */
export function isFinanceEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return isAdminEmail(email) || financeManagerEmails().has(email.toLowerCase());
}

export interface FinanceUser {
  id: string;
  email: string;
  name: string | null;
}

/** Resolve the current finance user, or null if unauthenticated / not authorized. */
export async function getFinanceUser(): Promise<FinanceUser | null> {
  const session = await getServerSession();
  const user = session?.user;
  if (!user || !isVerifiedIdentity(user) || !isFinanceEmail(user.email))
    return null;
  return { id: user.id, email: user.email, name: user.name ?? null };
}

/** Assert the caller may manage finance, returning them — throws otherwise. */
export async function requireFinanceUser(): Promise<FinanceUser> {
  const finance = await getFinanceUser();
  if (!finance) throw new Error("Forbidden: finance access required.");
  return finance;
}
