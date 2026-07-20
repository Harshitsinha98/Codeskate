import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail } from "lucide-react";
import { getAdminClient } from "@/lib/admin-dashboard";
import { formatMoney } from "@/lib/money";
import { ProgressBar } from "@/features/client-dashboard/components/ProgressBar";
import { StatusBadge } from "@/features/client-dashboard/components/StatusBadge";
import { Panel } from "@/features/client-dashboard/components/Panel";
import { EmptyState } from "@/features/client-dashboard/components/EmptyState";
import {
  projectStatusPresentation,
  orderStatusPresentation,
  formatDate,
} from "@/features/client-dashboard/lib/presentation";

export default async function AdminClientProfilePage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const client = await getAdminClient(clientId);
  if (!client) notFound();

  return (
    <div className="space-y-8">
      <Link
        href="/admin/projects"
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to projects
      </Link>

      <header className="rounded-4xl border border-line bg-surface p-8 shadow-soft">
        <h1 className="text-display-lg text-ink">{client.name ?? "Unnamed client"}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-ink-muted">
          <span className="inline-flex items-center gap-1.5">
            <Mail className="h-4 w-4" />
            {client.email}
          </span>
          <span>Joined {formatDate(client.createdAt)}</span>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-5">
        <Panel title="Projects" className="lg:col-span-3">
          {client.projects.length === 0 ? (
            <EmptyState title="No projects" className="border-0 bg-transparent py-10" />
          ) : (
            <ul className="divide-y divide-line">
              {client.projects.map((p) => (
                <li key={p.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <Link
                        href={`/admin/projects/${p.id}`}
                        className="truncate text-sm font-medium text-ink hover:text-royal"
                      >
                        {p.name}
                      </Link>
                      <p className="mt-0.5 font-mono text-xs text-ink-faint">{p.code}</p>
                    </div>
                    <StatusBadge presentation={projectStatusPresentation(p.status)} />
                  </div>
                  <div className="mt-3">
                    <ProgressBar value={p.progressPct} showLabel />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Orders" className="lg:col-span-2">
          {client.orders.length === 0 ? (
            <EmptyState title="No orders" className="border-0 bg-transparent py-10" />
          ) : (
            <ul className="divide-y divide-line">
              {client.orders.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-ink-soft">{o.serviceTitle}</p>
                    <p className="mt-0.5 text-xs text-ink-muted">{formatDate(o.createdAt)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm tabular-nums text-ink-soft">
                      {formatMoney({ amountMinor: o.totalMinor, currency: o.currency })}
                    </span>
                    <StatusBadge presentation={orderStatusPresentation(o.status)} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
