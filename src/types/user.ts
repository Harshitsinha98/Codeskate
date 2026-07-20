/**
 * User & identity types. Placeholder foundation — interfaces only.
 * Aligned with docs/DATABASE.md (users, memberships) and constants/roles.
 */

import type { BaseEntity, ID, ISODateString } from "@/types/common";
import type { Role } from "@/constants/roles";

export type UserStatus = "active" | "invited" | "suspended" | "deactivated";

/** A person (global identity; may belong to multiple organizations). */
export interface User {
  id: ID;
  email: string;
  name: string;
  avatarUrl: string | null;
  status: UserStatus;
  emailVerifiedAt: ISODateString | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/** A user's membership + role within a specific organization (tenant). */
export interface Membership extends BaseEntity {
  userId: ID;
  roles: Role[];
  type: "employee" | "client" | "contractor" | "owner";
  status: UserStatus;
}

/** The authenticated session shape (frontend view). */
export interface SessionUser {
  id: ID;
  email: string;
  name: string;
  organizationId: ID | null;
  roles: Role[];
}
