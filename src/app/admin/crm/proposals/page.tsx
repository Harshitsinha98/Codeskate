import Link from "next/link";
import { listProposals } from "@/lib/proposal-service";
import { listLeads } from "@/lib/lead-service";
import { Panel } from "@/features/client-dashboard/components/Panel";
import { EmptyState } from "@/features/client-dashboard/components/EmptyState";
import { StatusBadge } from "@/features/client-dashboard/components/StatusBadge";
import { formatDate } from "@/features/client-dashboard/lib/presentation";
import { formatMoney } from "@/lib/money";
import { CrmRealtimeRefresher, proposalStatusPresentation } from "@/features/crm";

export const dynamic = "force-dynamic";

export default async function CrmProposalsPage() {
  const [proposals, leads] = await Promise.all([listProposals(), listLeads()]);
  const leadName = (id: string) => leads.find((l) => l.id === id)?.name ?? "—";

  return (
    <div className="space-y-8">
      <CrmRealtimeRefresher />

      <header>
        <h1 className="text-display-lg text-ink">Proposals</h1>
        <p className="mt-2 text-ink-muted">{proposals.length} proposal{proposals.length === 1 ? "" : "s"}.</p>
      </header>

      {proposals.length === 0 ? (
        <EmptyState title="No proposals yet" description="Proposals are created from a lead's detail page." />
      ) : (
        <Panel bodyClassName="overflow-x-auto" title="All proposals">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-faint">
                <th className="pb-3 pr-4 font-medium">Number</th>
                <th className="pb-3 pr-4 font-medium">Lead</th>
                <th className="pb-3 pr-4 font-medium">Title</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 pr-4 font-medium">Total</th>
                <th className="pb-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {proposals.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-ink/[0.02]">
                  <td className="py-3 pr-4 font-mono text-xs text-royal-700">{p.number}</td>
                  <td className="py-3 pr-4">
                    <Link href={`/admin/crm/leads/${p.leadId}`} className="text-ink hover:text-royal-700">
                      {leadName(p.leadId)}
                    </Link>
                  </td>
                  <td className="py-3 pr-4 text-ink-muted">{p.title}</td>
                  <td className="py-3 pr-4"><StatusBadge presentation={proposalStatusPresentation(p.status)} /></td>
                  <td className="py-3 pr-4 tabular-nums text-ink-muted">
                    {formatMoney({ amountMinor: p.totalMinor, currency: p.currency })}
                  </td>
                  <td className="py-3 text-ink-muted">{formatDate(p.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}
    </div>
  );
}
