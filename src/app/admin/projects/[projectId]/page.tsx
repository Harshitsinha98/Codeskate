import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Layers, User } from "lucide-react";
import { getAdminProject, getEmployeeOptions } from "@/lib/admin-dashboard";
import { listProjectDeliverables } from "@/lib/deliverable-service";
import { ProgressBar } from "@/features/client-dashboard/components/ProgressBar";
import { StatusBadge } from "@/features/client-dashboard/components/StatusBadge";
import { TimelineFeed } from "@/features/client-dashboard/components/TimelineFeed";
import { Panel } from "@/features/client-dashboard/components/Panel";
import { EmptyState } from "@/features/client-dashboard/components/EmptyState";
import {
  phaseStatusPresentation,
  taskStatusPresentation,
  formatDate,
  formatDurationDays,
} from "@/features/client-dashboard/lib/presentation";
import {
  ProjectStatusControl,
  PhaseStatusControl,
  MilestoneControl,
  EstimatedCompletionControl,
  AddTimelineEventControl,
} from "@/features/admin-dashboard/components/ProjectControls";
import { DeliverableList } from "@/features/deliverables/components/DeliverableList";
import { DeliverableUploadForm } from "@/features/deliverables/components/DeliverableControls";
import {
  ProjectManagerControl,
  AssignEmployeeControl,
  AssignmentList,
  TaskAssigneeControl,
} from "@/features/admin-dashboard/components/AssignmentControls";

export default async function AdminProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project = await getAdminProject(projectId);
  if (!project) notFound();

  const deliverables = await listProjectDeliverables(project.id);
  const employees = await getEmployeeOptions();
  const phaseOptions = project.phases.map((p) => ({ id: p.id, name: p.name }));

  return (
    <div className="space-y-8">
      <Link
        href="/admin/projects"
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to projects
      </Link>

      {/* Overview + status control */}
      <header className="rounded-4xl border border-line bg-surface p-8 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono text-xs text-ink-faint">{project.code}</p>
            <h1 className="mt-1 text-display-lg text-ink">{project.name}</h1>
            <p className="mt-2 text-sm text-ink-muted">
              {project.serviceTitle}
              {project.packageName ? ` · ${project.packageName}` : ""}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-xs text-ink-faint">Project status</span>
            <ProjectStatusControl projectId={project.id} current={project.status} />
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-ink-muted">Overall progress</span>
            <span className="font-medium tabular-nums text-ink">{project.progressPct}%</span>
          </div>
          <ProgressBar value={project.progressPct} />
        </div>

        <dl className="mt-8 grid gap-6 border-t border-line pt-6 sm:grid-cols-3">
          <div className="flex items-start gap-3">
            <User className="mt-0.5 h-4 w-4 text-ink-faint" />
            <div>
              <dt className="text-xs text-ink-faint">Client</dt>
              <dd className="mt-0.5 text-sm text-ink-soft">
                {project.clientId ? (
                  <Link href={`/admin/clients/${project.clientId}`} className="hover:text-ink">
                    {project.clientName ?? project.clientEmail ?? "View profile"}
                  </Link>
                ) : (
                  "Guest"
                )}
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Layers className="mt-0.5 h-4 w-4 text-ink-faint" />
            <div>
              <dt className="text-xs text-ink-faint">Project manager</dt>
              <dd className="mt-1">
                <ProjectManagerControl
                  projectId={project.id}
                  currentManagerId={project.managerId}
                  employees={employees}
                />
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-4 w-4 text-ink-faint" />
            <div>
              <dt className="text-xs text-ink-faint">Estimated duration</dt>
              <dd className="mt-0.5 text-sm text-ink-soft">
                {formatDurationDays(project.estimatedDurationDays)}
                {project.estimatedCompletion
                  ? ` · ~${formatDate(project.estimatedCompletion)}`
                  : ""}
              </dd>
            </div>
          </div>
        </dl>

        <div className="mt-6 border-t border-line pt-6">
          <p className="mb-2 text-xs text-ink-faint">Edit estimated completion (days from start)</p>
          <EstimatedCompletionControl
            projectId={project.id}
            current={project.estimatedDurationDays}
          />
        </div>
      </header>

      {/* Team (INTERNAL — never surfaced to clients) */}
      <section className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Panel title="Assign team member">
            <AssignEmployeeControl projectId={project.id} employees={employees} />
          </Panel>
        </div>
        <div className="lg:col-span-3">
          <h2 className="mb-4 text-sm font-medium text-ink">Team</h2>
          <AssignmentList projectId={project.id} assignments={project.assignments} />
        </div>
      </section>

      {/* Deliverables */}
      <section className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Panel title="Upload deliverable">
            <DeliverableUploadForm projectId={project.id} phases={phaseOptions} />
          </Panel>
        </div>
        <div className="lg:col-span-3">
          <h2 className="mb-4 text-sm font-medium text-ink">Deliverables</h2>
          <DeliverableList deliverables={deliverables} admin />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Phases with admin controls */}
        <div className="space-y-6 lg:col-span-3">
          <h2 className="text-sm font-medium text-ink">Phases</h2>
          {project.phases.length === 0 ? (
            <EmptyState title="No phases" />
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
                    <PhaseStatusControl
                      projectId={project.id}
                      phaseId={phase.id}
                      current={phase.status}
                    />
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
                            <MilestoneControl
                              projectId={project.id}
                              milestoneId={m.id}
                              current={m.status}
                            />
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
                            <span className="min-w-0 flex-1 truncate text-ink-soft">{t.title}</span>
                            <TaskAssigneeControl
                              projectId={project.id}
                              taskId={t.id}
                              currentAssigneeId={t.assigneeId}
                              employees={employees}
                            />
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

        {/* Timeline + add-event */}
        <div className="lg:col-span-2">
          <Panel title="Timeline">
            <div className="mb-6">
              <AddTimelineEventControl projectId={project.id} />
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
