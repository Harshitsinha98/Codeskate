import type { ProjectActivity } from "@/types/project";
import { formatDateTime } from "@/features/client-dashboard/lib/presentation";

/**
 * Read-only activity feed. Entries arrive newest-first from the Timeline
 * Service; this component only renders them.
 */
export function TimelineFeed({ items }: { items: ProjectActivity[] }) {
  return (
    <ol className="relative space-y-6 border-l border-line pl-6">
      {items.map((item) => (
        <li key={item.id} className="relative">
          <span className="absolute -left-[1.6875rem] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-surface bg-ink" />
          <p className="text-sm text-ink-soft">{item.message}</p>
          <time className="mt-1 block text-xs text-ink-faint" dateTime={item.createdAt}>
            {formatDateTime(item.createdAt)}
          </time>
        </li>
      ))}
    </ol>
  );
}
