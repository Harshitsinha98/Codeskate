import { Bell } from "lucide-react";
import { Panel } from "@/features/client-dashboard/components/Panel";
import { NotificationPreferences } from "@/features/notifications/components/NotificationPreferences";

export const metadata = {
  title: "Notification settings",
};

/**
 * Notification preferences page (client surface). Reuses the shared Panel and the
 * `NotificationPreferences` control — the same control can be mounted on the
 * admin/employee surfaces later with no change (actions resolve the user server-
 * side). In-app is live; other channels are provider-abstraction placeholders.
 */
export default function ClientNotificationSettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header>
        <h1 className="flex items-center gap-2 text-display-lg text-ink">
          <Bell className="h-6 w-6" />
          Notifications
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Choose how you&apos;d like to be notified. In-app notifications are always on.
        </p>
      </header>

      <Panel title="Delivery channels">
        <NotificationPreferences />
      </Panel>
    </div>
  );
}
