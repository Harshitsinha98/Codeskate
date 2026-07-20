import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarClock, Clock, Layers } from "lucide-react";
import { getServerSession } from "@/lib/rbac/session";
import { getClientProject } from "@/lib/client-dashboard";
import { listClientDeliverables } from "@/lib/deliverable-service";
import { ProgressBar } from "@/features/client-dashboard/components/ProgressBar";
import { StatusBadge } from "@/features/client-dashboard/components/StatusBadge";
import { TimelineFeed } from "@/features/client-dashboard/components/TimelineFeed";
import { Panel } from "@/features/client-dashboard/components/Panel";
import { EmptyState } from "@/features/client-dashboard/components/EmptyState";
import { DeliverableList } from "@/features/deliverables/components/DeliverableList";
import {
  projectStatusPresentation,
  phaseStatusPresentation,
  taskStatusPresentation,
  milestoneStatusPresentation,
  formatDate,
  formatDurationDays,
} from "@/features/client-dashboard/lib/presentation";

export default async function ClientProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const session = await getServerSession();

  const project = await getClientProject(session!.user.id, projectId);
  if (!project) notFound();

  const deliverables = await listClientDeliverables(project.id);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/client"
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
      </div>

      {/* Overview header */}
      <header className="rounded-4xl border border-line bg-surface p-8 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono text-xs text-ink-faint">{project.code}</p>
            <h1 className="mt-1 text-display-lg text-ink">{project.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge presentation={projectStatusPresentation(project.status)} />
              <span className="text-sm text-ink-muted">{project.serviceTitle}</span>
              {project.packageName && (
                <>
                  <span className="text-ink-faint">·</span>
                  <span className="text-sm text-ink-muted">{project.packageName}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-ink-muted">
              Overall progress · {project.completedPhases}/{project.totalPhases} phases
            </span>
            <span className="font-medium tabular-nums text-ink">{project.progressPct}%</span>
          </div>
          <ProgressBar value={project.progressPct} />
        </div>

        <dl className="mt-8 grid gap-6 border-t border-line pt-6 sm:grid-cols-3">
          <div className="flex items-start gap-3">
            <Layers className="mt-0.5 h-4 w-4 text-ink-faint" />
            <div>
              <dt className="text-xs text-ink-faint">Current phase</dt>
              <dd className="mt-0.5 text-sm text-ink-soft">{project.currentPhaseName ?? "—"}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-4 w-4 text-ink-faint" />
            <div>
              <dt className="text-xs text-ink-faint">Estimated duration</dt>
              <dd className="mt-0.5 text-sm text-ink-soft">
                {formatDurationDays(project.estimatedDurationDays)}
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CalendarClock className="mt-0.5 h-4 w-4 text-ink-faint" />
            <div>
              <dt className="text-xs text-ink-faint">Estimated completion</dt>
              <dd className="mt-0.5 text-sm text-ink-soft">
                {formatDate(project.estimatedCompletion)}
              </dd>
            </div>
          </div>
        </dl>
      </header>

      {/* Deliverables (read-only) */}
      <section>
        <h2 className="mb-4 text-sm font-medium text-ink">Deliverables</h2>
        <DeliverableList
          deliverables={deliverables}
          emptyDescription="Files and links shared by your team will appear here."
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Phases + milestones + tasks */}
        <div className="space-y-6 lg:col-span-3">
          <h2 className="text-sm font-medium text-ink">Phases</h2>
          {project.phases.length === 0 ? (
            <EmptyState title="No phases yet" description="Delivery phases will appear here once planning begins." />
          ) : (
            <div className="space-y-4">
              {project.phases.map((phase) => (
                <div key={phase.id} className="rounded-4xl border border-line bg-surface p-6 shadow-soft">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-line/60 text-xs font-medium text-ink-muted">
                        {phase.order + 1}
                      </span>
                      <h3 className="text-base font-medium text-ink">{phase.name}</h3>
                    </div>
                    <StatusBadge presentation={phaseStatusPresentation(phase.status)} />
                  </div>

                  {phase.milestones.length > 0 && (
                    <div className="mt-5">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-faint">
                        Milestones
                      </p>
                      <ul className="space-y-2">
                        {phase.milestones.map((m) => (
                          <li key={m.id} className="flex items-center justify-between gap-3 text-sm">
                            <span className="text-ink-soft">{m.name}</span>
                            <StatusBadge presentation={milestoneStatusPresentation(m.status)} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {phase.tasks.length > 0 && (
                    <div className="mt-5">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-faint">
                        Tasks
                      </p>
                      <ul className="space-y-2">
                        {phase.tasks.map((t) => (
                          <li key={t.id} className="flex items-center justify-between gap-3 text-sm">
                            <span className="min-w-0 truncate text-ink-soft">{t.title}</span>
                            <StatusBadge presentation={taskStatusPresentation(t.status)} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="lg:col-span-2">
          <Panel title="Timeline">
            {project.timeline.length === 0 ? (
              <EmptyState
                title="No activity yet"
                description="Updates will appear here as your project progresses."
                className="border-0 bg-transparent py-10"
              />
            ) : (
              <TimelineFeed items={project.timeline} />
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
