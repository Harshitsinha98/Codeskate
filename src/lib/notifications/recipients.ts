/**
 * Notification recipient resolution — the shared helper for "who are the agency
 * admins / staff" used by the Notification Service and by non-project publishers
 * (`@/lib/order-service`). Centralizes the allowlist→user-id lookup so the audience
 * seam lives in ONE place (swaps out cleanly when the RBAC role backend lands).
 *
 * Server-only.
 */

import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin-auth";
import { isEmployeeEmail } from "@/lib/employee-auth";

type Db = PrismaClient | Prisma.TransactionClient;

/** User ids on the admin allowlist. */
export async function getAgencyAdminIds(db: Db = prisma): Promise<string[]> {
  const users = await db.user.findMany({ select: { id: true, email: true } });
  return users.filter((u) => isAdminEmail(u.email)).map((u) => u.id);
}

/** User ids on the employee allowlist (admins included, per the employee seam). */
export async function getAgencyEmployeeIds(db: Db = prisma): Promise<string[]> {
  const users = await db.user.findMany({ select: { id: true, email: true } });
  return users.filter((u) => isEmployeeEmail(u.email)).map((u) => u.id);
}
