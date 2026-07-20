import Link from "next/link";
import {
  Users,
  TrendingUp,
  CalendarClock,
  Trophy,
  FileText,
} from "lucide-react";
import { getCrmDashboard } from "@/lib/crm-dashboard";
import { MetricCard } from "@/features/admin-dashboard/components/MetricCard";
import { Panel } from "@/features/client-dashboard/components/Panel";
import { EmptyState } from "@/features/client-dashboard/components/EmptyState";
import { StatusBadge } from "@/features/client-dashboard/components/StatusBadge";
import { formatDate } from "@/features/client-dashboard/lib/presentation";
import {
  CrmRealtimeRefresher,
  leadStagePresentation,
  proposalStatusPresentation,
  crmTitleCase,
} from "@/features/crm";
import { LEAD_PIPELINE_STAGES } from "@/constants/crm";

export const dynamic = "force-dynamic";

export default async function CrmDashboardPage() {
  const dash = await getCrmDashboard();

  return (
    <div className="space-y-10">
      <CrmRealtimeRefresher />

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-display-lg text-ink">Sales CRM</h1>
          <p className="mt-2 text-ink-muted">Pipeline, leads, and proposals.</p>
        </div>
        <Link
          href="/admin/crm/leads"
          className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-surface transition-opacity hover:opacity-90"
        >
          View all leads →
        </Link>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Active leads" value={dash.activeLeads} icon={<Users className="h-4 w-4" />} />
        <MetricCard label="Won" value={dash.wonLeads} icon={<Trophy className="h-4 w-4" />} />
        <MetricCard
          label="Conversion rate"
          value={`${dash.conversionRatePct}%`}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <MetricCard label="Total leads" value={dash.totalLeads} icon={<Users className="h-4 w-4" />} />
      </section>

      <Panel title="Pipeline overview">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
          {LEAD_PIPELINE_STAGES.map((stage) => {
            const pres = leadStagePresentation(stage);
            return (
              <div key={stage} className="rounded-3xl border border-line bg-base/50 p-4">
                <p className="text-2xl font-semibold tabular-nums text-ink">{dash.stageCounts[stage]}</p>
                <p className="mt-1 text-xs text-ink-muted">{pres.label}</p>
              </div>
            );
          })}
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-5">
        <Panel title="Recent leads" className="lg:col-span-3">
          {dash.recentLeads.length === 0 ? (
            <EmptyState title="No leads yet" className="border-0 bg-transparent py-10" />
          ) : (
            <ul className="divide-y divide-line">
              {dash.recentLeads.map((lead) => (
                <li key={lead.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <Link href={`/admin/crm/leads/${lead.id}`} className="truncate text-sm font-medium text-ink hover:text-royal-700">
                      {lead.name}
                    </Link>
                    <p className="mt-0.5 truncate text-xs text-ink-muted">
                      {lead.company ?? lead.email} · {formatDate(lead.createdAt)}
                    </p>
                  </div>
                  <StatusBadge presentation={leadStagePresentation(lead.stage)} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Upcoming meetings" className="lg:col-span-2">
          {dash.upcomingMeetings.length === 0 ? (
            <EmptyState
              icon={<CalendarClock className="h-5 w-5" />}
              title="No meetings scheduled"
              className="border-0 bg-transparent py-10"
            />
          ) : (
            <ul className="divide-y divide-line">
              {dash.upcomingMeetings.map((lead) => (
                <li key={lead.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <Link href={`/admin/crm/leads/${lead.id}`} className="truncate text-sm text-ink hover:text-royal-700">
                    {lead.name}
                  </Link>
                  <span className="shrink-0 text-xs text-ink-muted">{formatDate(lead.expectedCloseDate)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel
        title="Proposal status"
        action={
          <Link href="/admin/crm/proposals" className="text-sm text-royal-700 hover:text-royal">
            All proposals →
          </Link>
        }
      >
        <div className="flex flex-wrap gap-3">
          {Object.entries(dash.proposalStatusCounts).map(([status, count]) => (
            <div key={status} className="flex items-center gap-2 rounded-full border border-line px-4 py-2">
              <FileText className="h-4 w-4 text-ink-faint" />
              <span className="text-sm text-ink">{crmTitleCase(status)}</span>
              <span className="text-sm font-semibold tabular-nums text-ink">{count}</span>
              <StatusBadge presentation={proposalStatusPresentation(status)} className="ml-1" />
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
