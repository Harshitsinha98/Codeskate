import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Layers, ListChecks } from "lucide-react";
import { getServerSession } from "@/lib/rbac/session";
import { getEmployeeProject } from "@/lib/employee-dashboard";
import { listProjectDeliverables } from "@/lib/deliverable-service";
import { ProgressBar } from "@/features/client-dashboard/components/ProgressBar";
import { StatusBadge } from "@/features/client-dashboard/components/StatusBadge";
import { TimelineFeed } from "@/features/client-dashboard/components/TimelineFeed";
import { Panel } from "@/features/client-dashboard/components/Panel";
import { EmptyState } from "@/features/client-dashboard/components/EmptyState";
import { DeliverableList } from "@/features/deliverables/components/DeliverableList";
import {
  projectStatusPresentation,
  phaseStatusPresentation,
  milestoneStatusPresentation,
} from "@/features/client-dashboard/lib/presentation";
import {
  TaskStatusControl,
  CompleteTaskControl,
  AddTimelineNoteControl,
  EmployeeDeliverableUploadForm,
} from "@/features/employee-dashboard/components/EmployeeControls";
import { PROJECT_TASK_STATUS } from "@/constants/project";

export default async function EmployeeProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const session = await getServerSession();

  const project = await getEmployeeProject(session!.user.id, projectId);
  if (!project) notFound();

  // Employees see all deliverables on their project (internal + client-visible)
  // so they can manage their own work; approval stays admin-only.
  const deliverables = await listProjectDeliverables(project.id);
  const phaseOptions = project.phases.map((p) => ({ id: p.id, name: p.name }));

  return (
    <div className="space-y-8">
      <Link
        href="/employee"
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to workspace
      </Link>

      {/* Overview */}
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
              {project.isManager && (
                <span className="rounded-full bg-royal/10 px-2 py-0.5 text-xs font-medium text-royal-700">
                  Manager
                </span>
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

        <dl className="mt-8 grid gap-6 border-t border-line pt-6 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <Layers className="mt-0.5 h-4 w-4 text-ink-faint" />
            <div>
              <dt className="text-xs text-ink-faint">Current phase</dt>
              <dd className="mt-0.5 text-sm text-ink-soft">{project.currentPhaseName ?? "—"}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ListChecks className="mt-0.5 h-4 w-4 text-ink-faint" />
            <div>
              <dt className="text-xs text-ink-faint">My open tasks</dt>
              <dd className="mt-0.5 text-sm text-ink-soft">{project.myOpenTasks}</dd>
            </div>
          </div>
        </dl>
      </header>

      {/* Deliverables — employee can upload (no approve) */}
      <section className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Panel title="Upload deliverable">
            <EmployeeDeliverableUploadForm projectId={project.id} phases={phaseOptions} />
          </Panel>
        </div>
        <div className="lg:col-span-3">
          <h2 className="mb-4 text-sm font-medium text-ink">Deliverables</h2>
          {/* Read-only list: no `admin` prop → no approve/reject or version controls. */}
          <DeliverableList deliverables={deliverables} />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Phases with task controls (the checklist) */}
        <div className="space-y-6 lg:col-span-3">
          <h2 className="text-sm font-medium text-ink">Phases &amp; checklist</h2>
          {project.phases.length === 0 ? (
            <EmptyState title="No phases yet" />
          ) : (
            <div className="space-y-4">
              {project.phases.map((phase) => (
                <div key={phase.id} className="rounded-4xl border border-line bg-surface p-6 shadow-soft">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-line/60 text-xs font-medium text-ink-muted">
                        {phase.order + 1}
                      </span>
                      <h3 className="text-base font-medium text-ink">{phase.name}</h3>
                      <StatusBadge presentation={phaseStatusPresentation(phase.status)} />
                    </div>
                  </div>

                  {phase.milestones.length > 0 && (
                    <div className="mt-5">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-faint">
                        Milestones
                      </p>
                      <ul className="space-y-2">
                        {phase.milestones.map((m) => (
                          <li key={m.id} className="flex items-center justify-between gap-3 text-sm">
                            <span className="min-w-0 truncate text-ink-soft">{m.name}</span>
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
                      <ul className="space-y-3">
                        {phase.tasks.map((t) => {
                          const done = t.status === PROJECT_TASK_STATUS.DONE;
                          return (
                            <li key={t.id} className="flex flex-wrap items-center justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm text-ink-soft">
                                  {t.title}
                                  {t.mine && (
                                    <span className="ml-2 rounded-full bg-royal/10 px-2 py-0.5 text-xs font-medium text-royal-700">
                                      Mine
                                    </span>
                                  )}
                                </p>
                                {t.description && (
                                  <p className="mt-0.5 truncate text-xs text-ink-muted">{t.description}</p>
                                )}
                              </div>
                              {/* Employees act on ANY task in their assigned project. */}
                              <div className="flex items-center gap-2">
                                <TaskStatusControl
                                  projectId={project.id}
                                  taskId={t.id}
                                  current={t.status}
                                />
                                <CompleteTaskControl
                                  projectId={project.id}
                                  taskId={t.id}
                                  done={done}
                                />
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Timeline + add-note */}
        <div className="lg:col-span-2">
          <Panel title="Timeline">
            <div className="mb-6">
              <AddTimelineNoteControl projectId={project.id} />
            </div>
            {project.timeline.length === 0 ? (
              <EmptyState title="No activity yet" className="border-0 bg-transparent py-10" />
            ) : (
              <TimelineFeed items={project.timeline} />
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
