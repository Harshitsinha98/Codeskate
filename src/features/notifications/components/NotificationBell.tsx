"use client";

import { useState } from "react";
import { Bell, Check, CheckCheck, Archive, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/features/client-dashboard/lib/presentation";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import type { AppNotification } from "@/lib/notifications";

/**
 * In-app Notification Center — the bell + dropdown mounted in every dashboard
 * header. Shows an unread counter, a newest-first list (pagination-ready via
 * `loadMore`), and per-item read / archive / delete. Live over SSE (no refresh):
 * the `useNotifications` hook subscribes to the per-user stream and refetches on
 * each frame.
 *
 * The SAME component serves client, employee, and admin — the server scopes both
 * the list query and the SSE stream to the current user, so each sees only their
 * own notifications with no per-surface variation.
 */
export function NotificationBell({ initialUnread = 0 }: { initialUnread?: number }) {
  const [open, setOpen] = useState(false);
  const {
    items,
    unreadCount,
    loaded,
    hasMore,
    loadMore,
    markRead,
    markAllRead,
    archive,
    remove,
  } = useNotifications(initialUnread);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-[1.1rem] items-center justify-center rounded-full bg-ink px-1 text-[0.65rem] font-semibold leading-4 text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* click-away backdrop */}
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div className="absolute right-0 z-50 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-3xl border border-line bg-surface shadow-lift">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <span className="text-sm font-medium text-ink">Notifications</span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="inline-flex items-center gap-1 text-xs text-ink-muted transition-colors hover:text-ink"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[24rem] overflow-y-auto">
              {!loaded ? (
                <div className="flex items-center justify-center py-10 text-ink-faint">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : items.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-ink-faint">
                  You&apos;re all caught up.
                </p>
              ) : (
                <ul className="divide-y divide-line">
                  {items.map((n) => (
                    <NotificationRow
                      key={n.id}
                      notification={n}
                      onRead={markRead}
                      onArchive={archive}
                      onDelete={remove}
                    />
                  ))}
                </ul>
              )}
            </div>

            {hasMore && (
              <button
                type="button"
                onClick={() => void loadMore()}
                className="w-full border-t border-line py-2.5 text-xs text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink"
              >
                Load more
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function NotificationRow({
  notification: n,
  onRead,
  onArchive,
  onDelete,
}: {
  notification: AppNotification;
  onRead: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const href = typeof n.data?.href === "string" ? n.data.href : null;

  return (
    <li className={cn("group px-4 py-3", !n.read && "bg-ink/[0.03]")}>
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-1.5 h-2 w-2 shrink-0 rounded-full",
            n.read ? "bg-transparent" : "bg-ink"
          )}
        />
        <div className="min-w-0 flex-1">
          <a
            href={href ?? undefined}
            onClick={() => !n.read && onRead(n.id)}
            className={cn("block", href && "cursor-pointer")}
          >
            <p className="truncate text-sm font-medium text-ink">{n.title}</p>
            {n.body && <p className="mt-0.5 line-clamp-2 text-xs text-ink-muted">{n.body}</p>}
            <p className="mt-1 text-[0.7rem] text-ink-faint">{formatDateTime(n.createdAt)}</p>
          </a>
        </div>
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {!n.read && (
            <button
              type="button"
              aria-label="Mark read"
              onClick={() => onRead(n.id)}
              className="inline-flex h-6 w-6 items-center justify-center rounded-full text-ink-faint hover:bg-line hover:text-ink"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            aria-label="Archive"
            onClick={() => onArchive(n.id)}
            className="inline-flex h-6 w-6 items-center justify-center rounded-full text-ink-faint hover:bg-line hover:text-ink"
          >
            <Archive className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label="Delete"
            onClick={() => onDelete(n.id)}
            className="inline-flex h-6 w-6 items-center justify-center rounded-full text-ink-faint hover:bg-line hover:text-ink"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </li>
  );
}
