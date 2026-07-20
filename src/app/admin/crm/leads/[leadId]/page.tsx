import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getLead } from "@/lib/lead-service";
import { listProposalsForLead } from "@/lib/proposal-service";
import { listCrmSalespeople } from "@/lib/crm-dashboard";
import { CATALOG_SERVICES } from "@/config/catalog";
import { Panel } from "@/features/client-dashboard/components/Panel";
import { StatusBadge } from "@/features/client-dashboard/components/StatusBadge";
import { formatDate } from "@/features/client-dashboard/lib/presentation";
import { formatMoney } from "@/lib/money";
import {
  CrmRealtimeRefresher,
  LeadStageSelect,
  LeadOwnerSelect,
  ProposalPanel,
  leadPriorityPresentation,
  crmTitleCase,
  type CatalogOption,
} from "@/features/crm";

export const dynamic = "force-dynamic";

const CATALOG: CatalogOption[] = CATALOG_SERVICES.map((s) => ({
  serviceSlug: s.slug,
  serviceTitle: s.title,
  packages: s.packages.map((p) => ({ id: p.id, name: p.name, priceLabel: p.priceLabel })),
}));

type Params = Promise<{ leadId: string }>;

export default async function LeadDetailPage({ params }: { params: Params }) {
  const { leadId } = await params;
  const [lead, proposals, salespeople] = await Promise.all([
    getLead(leadId),
    listProposalsForLead(leadId),
    listCrmSalespeople(),
  ]);
  if (!lead) notFound();

  return (
    <div className="space-y-8">
      <CrmRealtimeRefresher />

      <div>
        <Link href="/admin/crm/leads" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" />
          All leads
        </Link>
      </div>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-display-lg text-ink">{lead.name}</h1>
          <p className="mt-2 text-ink-muted">
            {lead.company ?? lead.email}
            <StatusBadge presentation={leadPriorityPresentation(lead.priority)} className="ml-3 align-middle" />
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <LeadStageSelect leadId={lead.id} stage={lead.stage} />
          <LeadOwnerSelect leadId={lead.id} ownerId={lead.ownerId} salespeople={salespeople} />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Details" className="lg:col-span-1">
          <dl className="space-y-3 text-sm">
            <Row label="Email" value={lead.email} />
            <Row label="Phone" value={lead.phone ?? "—"} />
            <Row label="Company" value={lead.company ?? "—"} />
            <Row label="Source" value={crmTitleCase(lead.source)} />
            <Row
              label="Budget"
              value={lead.budgetMinor != null ? formatMoney({ amountMinor: lead.budgetMinor, currency: lead.currency }) : "—"}
            />
            <Row label="Expected close" value={formatDate(lead.expectedCloseDate)} />
            <Row label="Created" value={formatDate(lead.createdAt)} />
          </dl>
          {lead.requirements && (
            <div className="mt-5 border-t border-line pt-4">
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-faint">Requirements</p>
              <p className="whitespace-pre-wrap text-sm text-ink-muted">{lead.requirements}</p>
            </div>
          )}
          {lead.notes && (
            <div className="mt-4 border-t border-line pt-4">
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-faint">Notes</p>
              <p className="whitespace-pre-wrap text-sm text-ink-muted">{lead.notes}</p>
            </div>
          )}
        </Panel>

        <Panel className="lg:col-span-2">
          <ProposalPanel leadId={lead.id} proposals={proposals} catalog={CATALOG} />
        </Panel>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-ink-faint">{label}</dt>
      <dd className="text-right text-ink">{value}</dd>
    </div>
  );
}
