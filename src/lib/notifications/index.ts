/**
 * Notification module barrel — the single import surface. Business modules import
 * `notify`/`notifyMany`; the Timeline Service imports `dispatchFromTimeline`; the
 * UI/actions import the read + mutation helpers. One service, one provider seam.
 */

export {
  notify,
  notifyMany,
  dispatchFromTimeline,
  listNotifications,
  unreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
  archiveNotification,
  deleteNotification,
  type AppNotification,
  type NotificationPage,
  type NotifyInput,
} from "@/lib/notifications/service";

export {
  getNotificationProviders,
  type NotificationProvider,
  type DeliverableNotification,
} from "@/lib/notifications/provider";

export {
  getAgencyAdminIds,
  getAgencyEmployeeIds,
} from "@/lib/notifications/recipients";

export {
  getNotificationPreferences,
  setNotificationPreference,
  type NotificationPreferenceState,
} from "@/lib/notifications/preferences";
