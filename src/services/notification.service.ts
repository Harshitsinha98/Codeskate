/**
 * Notification service — PLACEHOLDER (no business logic).
 * Method signatures only; implementations arrive in Phase 4/7.
 */

const notImplemented = <T>(name: string): Promise<T> =>
  Promise.reject(new Error(`notificationService.${name} not implemented`));

export const notificationService = {
  list: () => notImplemented<never[]>("list"),
  markRead: () => notImplemented<void>("markRead"),
  markAllRead: () => notImplemented<void>("markAllRead"),
  getPreferences: () => notImplemented<null>("getPreferences"),
};
