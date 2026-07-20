/**
 * Role registry — resolves a RoleKey to its RoleDefinition.
 *
 * System roles come from the static default matrix (`@/constants/role-permissions`).
 * Unknown role keys (future tenant-defined custom roles) resolve via an optional
 * `customRoles` list passed in by the caller; if a key matches neither, it
 * resolves to a SAFE-DENY definition (no permissions) rather than throwing —
 * an unrecognized role should never accidentally grant access.
 */

import { ROLES, type Role } from "@/constants/roles";
import {
  ROLE_PERMISSIONS,
  ROLE_ORGANIZATION_PERMISSIONS,
} from "@/constants/role-permissions";
import type { RoleDefinition, RoleKey } from "@/types/rbac";

const SYSTEM_ROLE_SET = new Set<string>(Object.values(ROLES));

function isSystemRole(key: RoleKey): key is Role {
  return SYSTEM_ROLE_SET.has(key);
}

/** Build the RoleDefinition for a known system role. */
function systemRoleDefinition(role: Role): RoleDefinition {
  return {
    key: role,
    label: role,
    isSystem: true,
    permissions: ROLE_PERMISSIONS[role],
    organizationPermissions: ROLE_ORGANIZATION_PERMISSIONS[role],
  };
}

/** Safe-deny definition used when a role key is unrecognized. */
function unknownRoleDefinition(key: RoleKey): RoleDefinition {
  return {
    key,
    label: String(key),
    isSystem: false,
    permissions: [],
    organizationPermissions: [],
  };
}

/**
 * Resolve a list of role keys to their definitions, given an optional list of
 * custom (tenant-defined) role definitions to check for non-system keys.
 */
export function resolveRoleDefinitions(
  roleKeys: RoleKey[],
  customRoles: RoleDefinition[] = []
): RoleDefinition[] {
  const customByKey = new Map(customRoles.map((r) => [r.key, r]));

  return roleKeys.map((key) => {
    if (isSystemRole(key)) return systemRoleDefinition(key);
    const custom = customByKey.get(key);
    return custom ?? unknownRoleDefinition(key);
  });
}
