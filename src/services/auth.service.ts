/**
 * Auth service — PLACEHOLDER (no business logic).
 * Method signatures only; implementations arrive in Phase 2 (Better Auth + API).
 */

const notImplemented = <T>(name: string): Promise<T> =>
  Promise.reject(new Error(`authService.${name} not implemented`));

export const authService = {
  login: () => notImplemented<void>("login"),
  logout: () => notImplemented<void>("logout"),
  register: () => notImplemented<void>("register"),
  getSession: () => notImplemented<null>("getSession"),
  refresh: () => notImplemented<void>("refresh"),
};
