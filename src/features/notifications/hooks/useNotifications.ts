"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import {
  fetchNotificationsAction,
  markNotificationReadAction,
  markAllNotificationsReadAction,
  archiveNotificationAction,
  deleteNotificationAction,
} from "@/app/notifications/actions";
import type { AppNotification } from "@/lib/notifications";

/**
 * Notification center state hook — the ONE client entry point for the bell.
 *
 * Loads the first page via the server action, then subscribes to the per-user
 * SSE stream (`/api/notifications/stream`, the existing realtime layer scoped to
 * the caller) and refetches on every incoming frame so the list + unread badge
 * update with no page refresh. Read/archive/delete optimistically update local
 * state, then persist through the server actions.
 *
 * Mirrors `useRealtime`'s EventSource lifecycle (auto-reconnect, teardown on
 * unmount) — it does not reuse `RealtimeRefresher` because notifications refetch
 * their own data rather than calling `router.refresh()`.
 */
export function useNotifications(initialUnread = 0) {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(initialUnread);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [, startTransition] = useTransition();

  const refetch = useCallback(async () => {
    const page = await fetchNotificationsAction(null, false);
    setItems(page.items);
    setUnreadCount(page.unreadCount);
    setNextCursor(page.nextCursor);
    setLoaded(true);
  }, []);

  const loadMore = useCallback(async () => {
    if (!nextCursor) return;
    const page = await fetchNotificationsAction(nextCursor, false);
    setItems((prev) => [...prev, ...page.items]);
    setUnreadCount(page.unreadCount);
    setNextCursor(page.nextCursor);
  }, [nextCursor]);

  // Realtime: initial load on connect, then refetch when a personal notification
  // frame arrives. Both refetches are driven by the EventSource (an external
  // system), so state updates originate from its callbacks — not the effect body.
  useEffect(() => {
    if (typeof window === "undefined") return;

    let source: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let attempts = 0;
    let closed = false;

    const connect = () => {
      if (closed) return;
      source = new EventSource("/api/notifications/stream");
      source.addEventListener("project-activity", () => {
        void refetch();
      });
      source.onopen = () => {
        attempts = 0;
        void refetch();
      };
      source.onerror = () => {
        if (closed) return;
        if (source && source.readyState === EventSource.CLOSED) {
          source.close();
          source = null;
          attempts += 1;
          const delay = Math.min(1000 * 2 ** attempts, 30_000);
          reconnectTimer = setTimeout(connect, delay);
        }
      };
    };

    connect();
    // Fallback initial load in case the stream is slow/unavailable — deferred to a
    // microtask so it is not a synchronous setState in the effect body.
    void Promise.resolve().then(() => {
      if (!closed) void refetch();
    });

    return () => {
      closed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (source) source.close();
    };
  }, [refetch]);

  const markRead = useCallback((id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    startTransition(() => {
      void markNotificationReadAction(id);
    });
  }, []);

  const markAllRead = useCallback(() => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    startTransition(() => {
      void markAllNotificationsReadAction();
    });
  }, []);

  const archive = useCallback((id: string) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
    startTransition(() => {
      void archiveNotificationAction(id).then(() => refetch());
    });
  }, [refetch]);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
    startTransition(() => {
      void deleteNotificationAction(id).then(() => refetch());
    });
  }, [refetch]);

  return {
    items,
    unreadCount,
    loaded,
    hasMore: nextCursor != null,
    loadMore,
    markRead,
    markAllRead,
    archive,
    remove,
    refetch,
  };
}
