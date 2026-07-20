import { FileText, Link2, Download, Eye, ExternalLink, PackageOpen } from "lucide-react";
import { StatusBadge } from "@/features/client-dashboard/components/StatusBadge";
import { EmptyState } from "@/features/client-dashboard/components/EmptyState";
import { formatDateTime } from "@/features/client-dashboard/lib/presentation";
import {
  deliverableStatusPresentation,
  formatFileSize,
} from "@/features/admin-dashboard/lib/presentation";
import { DELIVERABLE_KIND } from "@/constants/project";
import type { Deliverable, DeliverableVersion } from "@/types/project";
import {
  DeliverableStatusControl,
  AddVersionControl,
} from "@/features/deliverables/components/DeliverableControls";

function downloadHref(version: DeliverableVersion, inline = false): string {
  return `/api/deliverables/versions/${version.id}/download${inline ? "?inline=1" : ""}`;
}

/** Actions for one version: preview/download (file) or open (link). */
function VersionActions({ version }: { version: DeliverableVersion }) {
  if (version.externalUrl) {
    return (
      <a
        href={version.externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs font-medium text-royal-700 hover:text-royal"
      >
        <ExternalLink className="h-3.5 w-3.5" />
        Open
      </a>
    );
  }
  return (
    <span className="inline-flex items-center gap-3">
      <a
        href={downloadHref(version, true)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs font-medium text-ink-muted hover:text-ink"
      >
        <Eye className="h-3.5 w-3.5" />
        Preview
      </a>
      <a
        href={downloadHref(version)}
        className="inline-flex items-center gap-1 text-xs font-medium text-royal-700 hover:text-royal"
      >
        <Download className="h-3.5 w-3.5" />
        Download
      </a>
    </span>
  );
}

function DeliverableCard({
  deliverable,
  admin,
}: {
  deliverable: Deliverable;
  admin: boolean;
}) {
  const current = deliverable.versions.find((v) => v.version === deliverable.currentVersion);
  const history = deliverable.versions.filter((v) => v.version !== deliverable.currentVersion);
  const isLink = deliverable.kind === DELIVERABLE_KIND.LINK;

  return (
    <div className="rounded-4xl border border-line bg-surface p-6 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 text-ink-faint">
            {isLink ? <Link2 className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-base font-medium text-ink">{deliverable.title}</h3>
            {deliverable.description && (
              <p className="mt-0.5 text-sm text-ink-muted">{deliverable.description}</p>
            )}
            <p className="mt-1 text-xs text-ink-faint">
              v{deliverable.currentVersion} · {formatDateTime(deliverable.createdAt)}
              {!deliverable.clientVisible && " · Internal"}
            </p>
          </div>
        </div>
        <StatusBadge presentation={deliverableStatusPresentation(deliverable.status)} />
      </div>

      {/* Current version */}
      {current && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-base/60 px-4 py-3">
          <div className="min-w-0 text-sm text-ink-soft">
            {current.fileName ?? current.externalUrl ?? "—"}
            {current.sizeBytes != null && (
              <span className="ml-2 text-xs text-ink-faint">{formatFileSize(current.sizeBytes)}</span>
            )}
          </div>
          <VersionActions version={current} />
        </div>
      )}

      {/* Version history */}
      {history.length > 0 && (
        <details className="mt-3 group">
          <summary className="cursor-pointer text-xs font-medium text-ink-muted hover:text-ink">
            Version history ({history.length})
          </summary>
          <ul className="mt-2 space-y-2 border-l border-line pl-4">
            {history.map((v) => (
              <li key={v.id} className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <span className="min-w-0 text-ink-muted">
                  <span className="font-mono text-xs text-ink-faint">v{v.version}</span>{" "}
                  {v.fileName ?? v.externalUrl ?? "—"}
                  {v.note && <span className="ml-2 text-xs text-ink-faint">— {v.note}</span>}
                </span>
                <span className="flex items-center gap-3 text-xs text-ink-faint">
                  {formatDateTime(v.createdAt)}
                  <VersionActions version={v} />
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}

      {/* Admin controls */}
      {admin && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <DeliverableStatusControl
            projectId={deliverable.projectId}
            deliverableId={deliverable.id}
            current={deliverable.status}
          />
          <AddVersionControl deliverableId={deliverable.id} kind={deliverable.kind} />
        </div>
      )}
    </div>
  );
}

/**
 * Deliverable list — shared by the admin (with review + version controls) and
 * client (read-only) surfaces. `admin` toggles the write controls; the read
 * surface (download / preview / history) is identical for both.
 */
export function DeliverableList({
  deliverables,
  admin = false,
  emptyDescription,
}: {
  deliverables: Deliverable[];
  admin?: boolean;
  emptyDescription?: string;
}) {
  if (deliverables.length === 0) {
    return (
      <EmptyState
        icon={<PackageOpen className="h-8 w-8" />}
        title="No deliverables yet"
        description={emptyDescription ?? "Files and links shared for this project will appear here."}
      />
    );
  }

  return (
    <div className="space-y-4">
      {deliverables.map((d) => (
        <DeliverableCard key={d.id} deliverable={d} admin={admin} />
      ))}
    </div>
  );
}
