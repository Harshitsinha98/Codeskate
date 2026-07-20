/**
 * CRM authorization gate — server-only.
 *
 * The Sales CRM is agency-internal: only the admin (ADMIN_EMAILS), the sales
 * manager, and authorized sales employees may read or modify it; clients never
 * reach it. Until the RBAC role backend lands, "CRM staff" reuses the SAME
 * env-allowlist seam the rest of the app uses — `isEmployeeEmail` already folds
 * in admins (see `@/lib/employee-auth`), so an agency owner and any listed
 * employee (the sales team) have access. This is the single seam to swap for
 * `hasRole(ctx, [ROLES.ADMIN, ROLES.SALES_MANAGER, ROLES.SALES])` later — no CRM
 * call site changes.
 */

import { getServerSession } from "@/lib/rbac/session";
import { isEmployeeEmail } from "@/lib/employee-auth";
import { isVerifiedIdentity } from "@/lib/privileged-identity";

export interface CrmUser {
  id: string;
  email: string;
  name: string | null;
}

/** Resolve the current CRM user, or null if unauthenticated / not authorized. */
export async function getCrmUser(): Promise<CrmUser | null> {
  const session = await getServerSession();
  const user = session?.user;
  if (!user || !isVerifiedIdentity(user) || !isEmployeeEmail(user.email))
    return null;
  return { id: user.id, email: user.email, name: user.name ?? null };
}

/** Assert the caller may use the CRM, returning them — throws otherwise. */
export async function requireCrmUser(): Promise<CrmUser> {
  const crm = await getCrmUser();
  if (!crm) throw new Error("Forbidden: CRM access required.");
  return crm;
}
