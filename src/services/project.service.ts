/**
 * Project service — PLACEHOLDER (no business logic).
 * Method signatures only; implementations arrive in Phase 4 (Delivery Core).
 */

const notImplemented = <T>(name: string): Promise<T> =>
  Promise.reject(new Error(`projectService.${name} not implemented`));

export const projectService = {
  list: () => notImplemented<never[]>("list"),
  get: () => notImplemented<null>("get"),
  create: () => notImplemented<void>("create"),
  update: () => notImplemented<void>("update"),
  getTracking: () => notImplemented<null>("getTracking"),
};
