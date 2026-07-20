import Link from "next/link";
import {
  FolderKanban,
  ListTodo,
  CalendarDays,
  PackageOpen,
  CheckCircle2,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import { getServerSession } from "@/lib/rbac/session";
import { getEmployeeOverview } from "@/lib/employee-dashboard";
import { MetricCard } from "@/features/admin-dashboard/components/MetricCard";
import { ProgressBar } from "@/features/client-dashboard/components/ProgressBar";
import { StatusBadge } from "@/features/client-dashboard/components/StatusBadge";
import { TimelineFeed } from "@/features/client-dashboard/components/TimelineFeed";
import { Panel } from "@/features/client-dashboard/components/Panel";
import { EmptyState } from "@/features/client-dashboard/components/EmptyState";
import {
  projectStatusPresentation,
  taskStatusPresentation,
  formatDate,
} from "@/features/client-dashboard/lib/presentation";
import { deliverableStatusPresentation } from "@/features/admin-dashboard/lib/presentation";
import type { EmployeeTaskRow } from "@/lib/employee-dashboard";

/** A compact task row linking back to its project. */
function TaskRow({ task }: { task: EmployeeTaskRow }) {
  return (
    <li className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <Link
          href={`/employee/projects/${task.projectId}`}
          className="truncate text-sm font-medium text-ink transition-colors hover:text-royal-700"
        >
          {task.title}
        </Link>
        <p className="mt-0.5 truncate text-xs text-ink-muted">
          {task.projectCode}
          {task.phaseName ? ` · ${task.phaseName}` : ""}
        </p>
      </div>
      <StatusBadge presentation={taskStatusPresentation(task.status)} />
    </li>
  );
}

export default async function EmployeeDashboardPage() {
  const session = await getServerSession();
  const user = session!.user;

  const {
    assignedProjects,
    assignedTasks,
    todaysWork,
    pendingDeliverables,
    completedTasks,
    recentActivity,
  } = await getEmployeeOverview(user.id);

  const firstName = (user.name ?? "").split(" ")[0] || "there";

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-display-lg text-ink">Hi {firstName}</h1>
        <p className="mt-2 text-ink-muted">
          Your assigned projects, tasks, and deliverables — updating live.
        </p>
      </header>

      {/* Metrics */}
      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Assigned projects" value={assignedProjects.length} icon={<FolderKanban className="h-4 w-4" />} />
        <MetricCard label="Open tasks" value={assignedTasks.length} icon={<ListTodo className="h-4 w-4" />} />
        <MetricCard label="Today's work" value={todaysWork.length} icon={<CalendarDays className="h-4 w-4" />} />
        <MetricCard label="Pending deliverables" value={pendingDeliverables.length} icon={<PackageOpen className="h-4 w-4" />} />
      </section>

      {/* Assigned projects */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-ink">Assigned projects</h2>
          {assignedProjects.length > 0 && (
            <span className="text-xs text-ink-faint">{assignedProjects.length} total</span>
          )}
        </div>

        {assignedProjects.length === 0 ? (
          <EmptyState
            icon={<FolderKanban className="h-8 w-8" />}
            title="No assignments yet"
            description="Projects you manage or have tasks on will appear here."
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {assignedProjects.map((project) => (
              <Link
                key={project.id}
                href={`/employee/projects/${project.id}`}
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
                  {project.isManager && (
                    <span className="rounded-full bg-royal/10 px-2 py-0.5 text-xs font-medium text-royal-700">
                      Manager
                    </span>
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
                    <dt className="text-xs text-ink-faint">My open tasks</dt>
                    <dd className="mt-0.5 tabular-nums text-ink-soft">{project.myOpenTasks}</dd>
                  </div>
                </dl>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Today's work + Assigned tasks */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Today's work">
          {todaysWork.length === 0 ? (
            <EmptyState
              icon={<CalendarDays className="h-7 w-7" />}
              title="Nothing in progress"
              description="Tasks you've started (or that are blocked) show up here."
              className="border-0 bg-transparent py-10"
            />
          ) : (
            <ul className="divide-y divide-line">
              {todaysWork.map((t) => (
                <TaskRow key={t.id} task={t} />
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Assigned tasks">
          {assignedTasks.length === 0 ? (
            <EmptyState
              icon={<ListTodo className="h-7 w-7" />}
              title="No open tasks"
              description="Your unfinished tasks across all projects appear here."
              className="border-0 bg-transparent py-10"
            />
          ) : (
            <ul className="divide-y divide-line">
              {assignedTasks.map((t) => (
                <TaskRow key={t.id} task={t} />
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* Pending deliverables + Recent timeline */}
      <div className="grid gap-6 lg:grid-cols-5">
        <Panel title="Pending deliverables" className="lg:col-span-3">
          {pendingDeliverables.length === 0 ? (
            <EmptyState
              icon={<PackageOpen className="h-7 w-7" />}
              title="Nothing awaiting review"
              description="Deliverables you upload stay here until an admin approves them."
              className="border-0 bg-transparent py-10"
            />
          ) : (
            <ul className="divide-y divide-line">
              {pendingDeliverables.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <Link
                      href={`/employee/projects/${d.projectId}`}
                      className="truncate text-sm font-medium text-ink transition-colors hover:text-royal-700"
                    >
                      {d.title}
                    </Link>
                    <p className="mt-0.5 truncate text-xs text-ink-muted">
                      {d.projectCode} · v{d.currentVersion} · {formatDate(d.createdAt)}
                    </p>
                  </div>
                  <StatusBadge presentation={deliverableStatusPresentation(d.status)} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Recent timeline" className="lg:col-span-2">
          {recentActivity.length === 0 ? (
            <EmptyState
              icon={<Activity className="h-7 w-7" />}
              title="Nothing yet"
              description="Updates on your projects appear here."
              className="border-0 bg-transparent py-10"
            />
          ) : (
            <TimelineFeed items={recentActivity} />
          )}
        </Panel>
      </div>

      {/* Completed tasks */}
      <Panel title="Completed tasks">
        {completedTasks.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 className="h-7 w-7" />}
            title="No completed tasks yet"
            description="Tasks you finish will be listed here."
            className="border-0 bg-transparent py-10"
          />
        ) : (
          <ul className="divide-y divide-line">
            {completedTasks.map((t) => (
              <TaskRow key={t.id} task={t} />
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
