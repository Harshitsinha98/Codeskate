import Link from "next/link";
import { listLeads, type LeadFilter } from "@/lib/lead-service";
import { listCrmSalespeople } from "@/lib/crm-dashboard";
import { Panel } from "@/features/client-dashboard/components/Panel";
import { EmptyState } from "@/features/client-dashboard/components/EmptyState";
import { StatusBadge } from "@/features/client-dashboard/components/StatusBadge";
import { formatDate } from "@/features/client-dashboard/lib/presentation";
import { formatMoney } from "@/lib/money";
import {
  CreateLeadForm,
  CrmRealtimeRefresher,
  leadStagePresentation,
  leadPriorityPresentation,
  crmTitleCase,
} from "@/features/crm";
import { LEAD_STAGE, LEAD_PRIORITY, type LeadStageValue, type LeadPriorityValue } from "@/constants/crm";

export const dynamic = "force-dynamic";

const STAGES = Object.values(LEAD_STAGE) as LeadStageValue[];
const PRIORITIES = Object.values(LEAD_PRIORITY) as LeadPriorityValue[];

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function one(v: string | string[] | undefined): string {
  return typeof v === "string" ? v : "";
}

export default async function CrmLeadsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const search = one(sp.search);
  const stage = one(sp.stage);
  const ownerId = one(sp.owner);
  const priority = one(sp.priority);
  const createdAfterRaw = one(sp.after);

  const filter: LeadFilter = {
    search: search || null,
    stage: (stage as LeadStageValue) || null,
    ownerId: ownerId || null,
    priority: (priority as LeadPriorityValue) || null,
    createdAfter: createdAfterRaw ? new Date(createdAfterRaw) : null,
  };

  const [leads, salespeople] = await Promise.all([listLeads(filter), listCrmSalespeople()]);
  const ownerName = (id: string | null) => {
    if (!id) return "Unassigned";
    const s = salespeople.find((p) => p.id === id);
    return s?.name ?? s?.email ?? "—";
  };

  return (
    <div className="space-y-8">
      <CrmRealtimeRefresher />

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-display-lg text-ink">Leads</h1>
          <p className="mt-2 text-ink-muted">{leads.length} lead{leads.length === 1 ? "" : "s"}.</p>
        </div>
        <CreateLeadForm />
      </header>

      <Panel title="Search & filters">
        <form method="get" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <input
            name="search"
            defaultValue={search}
            placeholder="Name, company, email, phone"
            className="lg:col-span-2 rounded-2xl border border-line bg-base px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-ink/40"
          />
          <select name="stage" defaultValue={stage} className={filterCls}>
            <option value="">All stages</option>
            {STAGES.map((s) => (
              <option key={s} value={s}>{crmTitleCase(s)}</option>
            ))}
          </select>
          <select name="owner" defaultValue={ownerId} className={filterCls}>
            <option value="">All owners</option>
            {salespeople.map((p) => (
              <option key={p.id} value={p.id}>{p.name ?? p.email}</option>
            ))}
          </select>
          <select name="priority" defaultValue={priority} className={filterCls}>
            <option value="">All priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{crmTitleCase(p)}</option>
            ))}
          </select>
          <input name="after" type="date" defaultValue={createdAfterRaw} className={filterCls} />
          <div className="flex items-center gap-3 lg:col-span-6">
            <button
              type="submit"
              className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-surface transition-opacity hover:opacity-90"
            >
              Apply
            </button>
            <Link href="/admin/crm/leads" className="text-sm text-ink-muted hover:text-ink">
              Reset
            </Link>
          </div>
        </form>
      </Panel>

      {leads.length === 0 ? (
        <EmptyState title="No leads match" description="Try adjusting your search or filters." />
      ) : (
        <Panel bodyClassName="overflow-x-auto" title="All leads">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-faint">
                <th className="pb-3 pr-4 font-medium">Name</th>
                <th className="pb-3 pr-4 font-medium">Company</th>
                <th className="pb-3 pr-4 font-medium">Stage</th>
                <th className="pb-3 pr-4 font-medium">Priority</th>
                <th className="pb-3 pr-4 font-medium">Owner</th>
                <th className="pb-3 pr-4 font-medium">Budget</th>
                <th className="pb-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {leads.map((lead) => (
                <tr key={lead.id} className="transition-colors hover:bg-ink/[0.02]">
                  <td className="py-3 pr-4">
                    <Link href={`/admin/crm/leads/${lead.id}`} className="font-medium text-ink hover:text-royal-700">
                      {lead.name}
                    </Link>
                    <p className="text-xs text-ink-faint">{lead.email}</p>
                  </td>
                  <td className="py-3 pr-4 text-ink-muted">{lead.company ?? "—"}</td>
                  <td className="py-3 pr-4"><StatusBadge presentation={leadStagePresentation(lead.stage)} /></td>
                  <td className="py-3 pr-4"><StatusBadge presentation={leadPriorityPresentation(lead.priority)} /></td>
                  <td className="py-3 pr-4 text-ink-muted">{ownerName(lead.ownerId)}</td>
                  <td className="py-3 pr-4 tabular-nums text-ink-muted">
                    {lead.budgetMinor != null
                      ? formatMoney({ amountMinor: lead.budgetMinor, currency: lead.currency })
                      : "—"}
                  </td>
                  <td className="py-3 text-ink-muted">{formatDate(lead.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}
    </div>
  );
}

const filterCls =
  "rounded-2xl border border-line bg-base px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-ink/40";
