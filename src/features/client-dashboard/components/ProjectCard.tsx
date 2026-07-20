import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ClientProjectCard } from "@/lib/client-dashboard";
import { StatusBadge } from "@/features/client-dashboard/components/StatusBadge";
import { ProgressBar } from "@/features/client-dashboard/components/ProgressBar";
import {
  projectStatusPresentation,
  formatDate,
} from "@/features/client-dashboard/lib/presentation";

/** A single project summary card, linking to its detail page. */
export function ProjectCard({ project }: { project: ClientProjectCard }) {
  return (
    <Link
      href={`/client/projects/${project.id}`}
      className="group flex flex-col rounded-4xl border border-line bg-surface p-6 shadow-soft transition-all duration-500 ease-premium hover:-translate-y-1.5 hover:shadow-lift"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-xs text-ink-faint">{project.code}</p>
          <h3 className="mt-1 truncate text-lg font-medium text-ink">{project.name}</h3>
        </div>
        <ArrowUpRight className="h-5 w-5 shrink-0 text-ink-faint transition-transform duration-500 ease-premium group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <StatusBadge presentation={projectStatusPresentation(project.status)} />
        <span className="text-xs text-ink-muted">{project.serviceTitle}</span>
        {project.packageName && (
          <>
            <span className="text-ink-faint">·</span>
            <span className="text-xs text-ink-muted">{project.packageName}</span>
          </>
        )}
      </div>

      <div className="mt-5">
        <div className="mb-1.5 flex items-center justify-between text-xs text-ink-muted">
          <span>Progress</span>
          <span className="tabular-nums">{project.progressPct}%</span>
        </div>
        <ProgressBar value={project.progressPct} />
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-line pt-4 text-sm">
        <div>
          <dt className="text-xs text-ink-faint">Current phase</dt>
          <dd className="mt-0.5 truncate text-ink-soft">{project.currentPhaseName ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-faint">Created</dt>
          <dd className="mt-0.5 text-ink-soft">{formatDate(project.createdAt)}</dd>
        </div>
      </dl>
    </Link>
  );
}
