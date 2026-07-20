/**
 * Organization service — PLACEHOLDER (no business logic).
 * Method signatures only; implementations arrive alongside auth + backend.
 * Handles the tenant surface: list-for-user, switch, settings, members, branding.
 */

const notImplemented = <T>(name: string): Promise<T> =>
  Promise.reject(new Error(`organizationService.${name} not implemented`));

export const organizationService = {
  listForCurrentUser: () => notImplemented<never[]>("listForCurrentUser"),
  getCurrent: () => notImplemented<null>("getCurrent"),
  getById: () => notImplemented<null>("getById"),
  switchOrganization: () => notImplemented<void>("switchOrganization"),
  getSettings: () => notImplemented<null>("getSettings"),
  updateSettings: () => notImplemented<void>("updateSettings"),
  getMembers: () => notImplemented<never[]>("getMembers"),
  getBranding: () => notImplemented<null>("getBranding"),
  updateBranding: () => notImplemented<void>("updateBranding"),
  getFeatures: () => notImplemented<null>("getFeatures"),
  /** Tenant-defined custom roles (RBAC). See @/types/rbac RoleDefinition/CustomRoleResolver. */
  getCustomRoles: () => notImplemented<never[]>("getCustomRoles"),
};
