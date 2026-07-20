"use client";

import { useEffect, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fetchNotificationPreferencesAction,
  setNotificationPreferenceAction,
} from "@/app/notifications/actions";
import type { NotificationPreferenceState } from "@/lib/notifications";
import type { NotificationChannelValue } from "@/constants/notification";

const CHANNEL_LABEL: Record<string, string> = {
  in_app: "In-app",
  email: "Email",
  whatsapp: "WhatsApp",
  push: "Push",
};

/**
 * Per-channel notification preference toggles. Only in-app is available today;
 * unavailable channels render disabled with a "Coming soon" hint, backed by the
 * provider abstraction (`@/lib/notifications/provider`) so they light up with no
 * UI change once a provider lands.
 */
export function NotificationPreferences() {
  const [prefs, setPrefs] = useState<NotificationPreferenceState[] | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    void fetchNotificationPreferencesAction().then(setPrefs);
  }, []);

  const toggle = (channel: NotificationChannelValue, enabled: boolean) => {
    setPrefs((prev) =>
      prev ? prev.map((p) => (p.channel === channel ? { ...p, enabled } : p)) : prev
    );
    startTransition(() => {
      void setNotificationPreferenceAction(channel, enabled).catch(() => {
        // revert on failure
        void fetchNotificationPreferencesAction().then(setPrefs);
      });
    });
  };

  if (!prefs) {
    return (
      <div className="flex items-center justify-center py-10 text-ink-faint">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  return (
    <ul className="divide-y divide-line">
      {prefs.map((p) => (
        <li key={p.channel} className="flex items-center justify-between gap-4 py-4">
          <div>
            <p className="text-sm font-medium text-ink">
              {CHANNEL_LABEL[p.channel] ?? p.channel}
            </p>
            {!p.available && <p className="text-xs text-ink-faint">Coming soon</p>}
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={p.enabled}
            disabled={!p.available}
            onClick={() => toggle(p.channel, !p.enabled)}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
              p.enabled ? "bg-ink" : "bg-line",
              !p.available && "cursor-not-allowed opacity-50"
            )}
          >
            <span
              className={cn(
                "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
                p.enabled ? "translate-x-5" : "translate-x-0.5"
              )}
            />
          </button>
        </li>
      ))}
    </ul>
  );
}
