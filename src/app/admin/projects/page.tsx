import Link from "next/link";
import { getAdminProjects } from "@/lib/admin-dashboard";
import { ProgressBar } from "@/features/client-dashboard/components/ProgressBar";
import { StatusBadge } from "@/features/client-dashboard/components/StatusBadge";
import { EmptyState } from "@/features/client-dashboard/components/EmptyState";
import {
  projectStatusPresentation,
  formatDate,
} from "@/features/client-dashboard/lib/presentation";

export default async function AdminProjectsPage() {
  const projects = await getAdminProjects();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-display-lg text-ink">Projects</h1>
        <p className="mt-2 text-ink-muted">{projects.length} total</p>
      </header>

      {projects.length === 0 ? (
        <EmptyState title="No projects yet" description="Projects appear here once orders are paid." />
      ) : (
        <div className="overflow-hidden rounded-4xl border border-line bg-surface shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-faint">
                  <th className="px-5 py-4 font-medium">Project ID</th>
                  <th className="px-5 py-4 font-medium">Client</th>
                  <th className="px-5 py-4 font-medium">Service</th>
                  <th className="px-5 py-4 font-medium">Package</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium">Progress</th>
                  <th className="px-5 py-4 font-medium">Manager</th>
                  <th className="px-5 py-4 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {projects.map((p) => (
                  <tr key={p.id} className="group transition-colors hover:bg-base/60">
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/projects/${p.id}`}
                        className="font-mono text-xs text-royal-700 transition-colors group-hover:text-royal"
                      >
                        {p.code}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      {p.clientId ? (
                        <Link href={`/admin/clients/${p.clientId}`} className="text-ink-soft hover:text-ink">
                          {p.clientName ?? "Unknown"}
                        </Link>
                      ) : (
                        <span className="text-ink-muted">Guest</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-ink-soft">{p.serviceTitle}</td>
                    <td className="px-5 py-4 text-ink-muted">{p.packageName ?? "—"}</td>
                    <td className="px-5 py-4">
                      <StatusBadge presentation={projectStatusPresentation(p.status)} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="w-32">
                        <ProgressBar value={p.progressPct} showLabel />
                      </div>
                    </td>
                    <td className="px-5 py-4 text-ink-muted">{p.managerName ?? "Unassigned"}</td>
                    <td className="px-5 py-4 text-ink-muted">{formatDate(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
