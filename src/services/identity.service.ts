/**
 * Identity service — PLACEHOLDER (no business logic).
 * Method signatures only; implementations arrive with the backend.
 *
 * Scope: the PERSON and their auth methods/profile/security — NOT the act of
 * logging in (that is the future auth service) and NOT org membership (that is
 * organizationService). Keeps identity independent of authentication + orgs.
 */

const notImplemented = <T>(name: string): Promise<T> =>
  Promise.reject(new Error(`identityService.${name} not implemented`));

export const identityService = {
  getCurrent: () => notImplemented<null>("getCurrent"),
  updateProfile: () => notImplemented<void>("updateProfile"),
  updatePreferences: () => notImplemented<void>("updatePreferences"),
  listAuthenticationMethods: () =>
    notImplemented<never[]>("listAuthenticationMethods"),
  linkProvider: () => notImplemented<void>("linkProvider"),
  unlinkProvider: () => notImplemented<void>("unlinkProvider"),
  requestEmailVerification: () =>
    notImplemented<void>("requestEmailVerification"),
  getSecuritySettings: () => notImplemented<null>("getSecuritySettings"),
};
