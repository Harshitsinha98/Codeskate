/**
 * Admin authorization gate — server-only.
 *
 * "Admin only" needs a working source of truth TODAY. The RBAC role system
 * (`@/lib/rbac`) resolves roles through `organizationService`, which is still an
 * unbuilt placeholder returning no roles for anyone — gating on it would lock
 * every user out. So, following the same env-gating pattern the auth layer
 * already uses (`authFlags` in `@/lib/auth`), admin access is an explicit
 * allowlist: `ADMIN_EMAILS` (comma-separated).
 *
 * This is the single seam to replace once the organization/role backend lands:
 * swap `isAdminEmail` for `hasRole(ctx, [ROLES.ADMIN, ROLES.AGENCY_OWNER, ...])`
 * and nothing else in the admin surface changes.
 */

import { getServerSession } from "@/lib/rbac/session";
import { isVerifiedIdentity } from "@/lib/privileged-identity";

/** Parse ADMIN_EMAILS once: lowercased, trimmed, comma-separated. */
function adminEmails(): Set<string> {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  );
}

/** True if the given email is on the admin allowlist. */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmails().has(email.toLowerCase());
}

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
}

/**
 * Resolve the current admin, or null if the caller is unauthenticated or not on
 * the allowlist. Use in Server Components/actions where a null result should
 * redirect (layout) or throw (mutations).
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  const session = await getServerSession();
  const user = session?.user;
  if (!user || !isVerifiedIdentity(user) || !isAdminEmail(user.email))
    return null;
  return { id: user.id, email: user.email, name: user.name ?? null };
}

/** Assert the caller is an admin, returning them — throws otherwise. */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdminUser();
  if (!admin) throw new Error("Forbidden: admin access required.");
  return admin;
}
