"use server";

/**
 * Notification Center server actions — the authorized write surface for the
 * in-app notification UI (bell dropdown + preferences).
 *
 * Every action resolves the current user server-side and scopes the mutation to
 * THEIR notifications (the service helpers all take `userId` and filter by it), so
 * a user can never read or mutate someone else's notifications. Thin wrappers over
 * `@/lib/notifications` — no business logic here.
 */

import { getServerSession } from "@/lib/rbac/session";
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  archiveNotification,
  deleteNotification,
  type NotificationPage,
} from "@/lib/notifications";
import {
  getNotificationPreferences,
  setNotificationPreference,
} from "@/lib/notifications/preferences";
import type { NotificationChannelValue } from "@/constants/notification";

async function requireUserId(): Promise<string> {
  const session = await getServerSession();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

/** Fetch a page of the current user's notifications (for the dropdown / center). */
export async function fetchNotificationsAction(
  cursor?: string | null,
  includeArchived = false
): Promise<NotificationPage> {
  const userId = await requireUserId();
  return listNotifications(userId, { cursor, includeArchived, limit: 15 });
}

export async function markNotificationReadAction(notificationId: string): Promise<void> {
  const userId = await requireUserId();
  await markNotificationRead(userId, notificationId);
}

export async function markAllNotificationsReadAction(): Promise<void> {
  const userId = await requireUserId();
  await markAllNotificationsRead(userId);
}

export async function archiveNotificationAction(notificationId: string): Promise<void> {
  const userId = await requireUserId();
  await archiveNotification(userId, notificationId);
}

export async function deleteNotificationAction(notificationId: string): Promise<void> {
  const userId = await requireUserId();
  await deleteNotification(userId, notificationId);
}

/** Read the current user's channel preferences (in-app live; others disabled). */
export async function fetchNotificationPreferencesAction() {
  const userId = await requireUserId();
  return getNotificationPreferences(userId);
}

export async function setNotificationPreferenceAction(
  channel: NotificationChannelValue,
  enabled: boolean
): Promise<void> {
  const userId = await requireUserId();
  await setNotificationPreference(userId, channel, enabled);
}
