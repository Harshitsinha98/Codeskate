/**
 * Employee authorization gate — server-only.
 *
 * Mirrors `@/lib/admin-auth` exactly: until the organization/role backend
 * (`@/lib/rbac`) lands, "employee only" is an explicit env allowlist,
 * `EMPLOYEE_EMAILS` (comma-separated). Admins are implicitly employees too, so
 * an agency owner can always reach the workspace.
 *
 * This is the single seam to replace once roles land: swap `isEmployeeEmail`
 * for `hasRole(ctx, [ROLES.EMPLOYEE, ROLES.ADMIN, ...])` and nothing else in the
 * employee surface changes.
 */

import { getServerSession } from "@/lib/rbac/session";
import { isAdminEmail } from "@/lib/admin-auth";
import { isVerifiedIdentity } from "@/lib/privileged-identity";

/** Parse EMPLOYEE_EMAILS once: lowercased, trimmed, comma-separated. */
function employeeEmails(): Set<string> {
  const raw = process.env.EMPLOYEE_EMAILS ?? "";
  return new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  );
}

/** True if the email is on the employee allowlist (admins count as employees). */
export function isEmployeeEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return employeeEmails().has(email.toLowerCase()) || isAdminEmail(email);
}

export interface EmployeeUser {
  id: string;
  email: string;
  name: string | null;
}

/**
 * Resolve the current employee, or null if the caller is unauthenticated or not
 * on the allowlist. Use in Server Components/actions where a null result should
 * redirect (layout) or throw (mutations).
 */
export async function getEmployeeUser(): Promise<EmployeeUser | null> {
  const session = await getServerSession();
  const user = session?.user;
  if (!user || !isVerifiedIdentity(user) || !isEmployeeEmail(user.email))
    return null;
  return { id: user.id, email: user.email, name: user.name ?? null };
}

/** Assert the caller is an employee, returning them — throws otherwise. */
export async function requireEmployee(): Promise<EmployeeUser> {
  const employee = await getEmployeeUser();
  if (!employee) throw new Error("Forbidden: employee access required.");
  return employee;
}
