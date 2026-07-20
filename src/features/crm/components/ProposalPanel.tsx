"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2, Check, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/money";
import {
  createProposalAction,
  setProposalStatusAction,
  acceptProposalAction,
} from "@/app/admin/crm/actions";
import { PROPOSAL_STATUS } from "@/constants/crm";
import { proposalStatusPresentation } from "@/features/crm/lib/presentation";
import { StatusBadge } from "@/features/client-dashboard/components/StatusBadge";
import { formatDate } from "@/features/client-dashboard/lib/presentation";
import type { Proposal } from "@/types/crm";

/** A catalog option list, flattened server-side for the quotation builder. */
export interface CatalogOption {
  serviceSlug: string;
  serviceTitle: string;
  packages: { id: string; name: string; priceLabel: string }[];
}

/**
 * Lead proposal panel — build a quotation from the EXISTING catalog, list the
 * lead's proposals, drive their status, and (on accept) hand off to the EXISTING
 * checkout page via the returned URL. All pricing is server-computed by the
 * proposal service; this is a thin UI over the actions.
 */
export function ProposalPanel({
  leadId,
  proposals,
  catalog,
}: {
  leadId: string;
  proposals: Proposal[];
  catalog: CatalogOption[];
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [serviceSlug, setServiceSlug] = useState(catalog[0]?.serviceSlug ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const packages = useMemo(
    () => catalog.find((c) => c.serviceSlug === serviceSlug)?.packages ?? [],
    [catalog, serviceSlug]
  );
  const [packageId, setPackageId] = useState(packages[0]?.id ?? "");

  function create(formData: FormData) {
    setError(null);
    const svc = String(formData.get("serviceSlug") ?? "");
    const pkg = String(formData.get("packageId") ?? "");
    if (!svc || !pkg) {
      setError("Pick a service and package.");
      return;
    }
    startTransition(async () => {
      try {
        await createProposalAction({
          leadId,
          serviceSlug: svc,
          packageId: pkg,
          couponCode: String(formData.get("couponCode") ?? "") || null,
          notes: String(formData.get("notes") ?? "") || null,
        });
        setCreating(false);
        router.refresh();
      } catch {
        setError("Could not create the proposal.");
      }
    });
  }

  function setStatus(proposalId: string, status: (typeof PROPOSAL_STATUS)[keyof typeof PROPOSAL_STATUS]) {
    startTransition(async () => {
      await setProposalStatusAction(proposalId, leadId, status);
      router.refresh();
    });
  }

  function accept(proposalId: string) {
    startTransition(async () => {
      const { checkoutUrl } = await acceptProposalAction(proposalId, leadId);
      router.push(checkoutUrl);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-ink">Proposals</h2>
        {!creating && (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm text-ink transition-colors hover:bg-ink/5"
          >
            <FileText className="h-4 w-4" />
            New proposal
          </button>
        )}
      </div>

      {creating && (
        <form action={create} className="rounded-3xl border border-line bg-base/50 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-ink-muted">Service</span>
              <select
                name="serviceSlug"
                value={serviceSlug}
                onChange={(e) => {
                  setServiceSlug(e.target.value);
                  const first = catalog.find((c) => c.serviceSlug === e.target.value)?.packages[0]?.id ?? "";
                  setPackageId(first);
                }}
                className={inputCls}
              >
                {catalog.map((c) => (
                  <option key={c.serviceSlug} value={c.serviceSlug}>{c.serviceTitle}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-ink-muted">Package</span>
              <select
                name="packageId"
                value={packageId}
                onChange={(e) => setPackageId(e.target.value)}
                className={inputCls}
              >
                {packages.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} — {p.priceLabel}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-ink-muted">Coupon (optional)</span>
              <input name="couponCode" className={inputCls} />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-xs font-medium text-ink-muted">Notes (optional)</span>
              <textarea name="notes" rows={2} className={cn(inputCls, "resize-y")} />
            </label>
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <div className="mt-4 flex items-center gap-3">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-surface transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              Generate quotation
            </button>
            <button type="button" onClick={() => setCreating(false)} className="text-sm text-ink-muted hover:text-ink">
              Cancel
            </button>
          </div>
        </form>
      )}

      {proposals.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-muted">No proposals yet.</p>
      ) : (
        <ul className="divide-y divide-line">
          {proposals.map((p) => {
            const decided =
              p.status === PROPOSAL_STATUS.ACCEPTED ||
              p.status === PROPOSAL_STATUS.REJECTED ||
              p.status === PROPOSAL_STATUS.EXPIRED;
            return (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-medium text-ink">
                    <span className="font-mono text-xs text-royal-700">{p.number}</span>
                    <StatusBadge presentation={proposalStatusPresentation(p.status)} />
                  </p>
                  <p className="mt-1 text-xs text-ink-muted">
                    {formatMoney({ amountMinor: p.totalMinor, currency: p.currency })} · {p.title}
                    {p.expiresAt ? ` · expires ${formatDate(p.expiresAt)}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {p.status === PROPOSAL_STATUS.DRAFT && (
                    <ActionBtn onClick={() => setStatus(p.id, PROPOSAL_STATUS.SENT)} disabled={pending}>
                      Mark sent
                    </ActionBtn>
                  )}
                  {p.status === PROPOSAL_STATUS.SENT && (
                    <ActionBtn onClick={() => setStatus(p.id, PROPOSAL_STATUS.VIEWED)} disabled={pending}>
                      Mark viewed
                    </ActionBtn>
                  )}
                  {!decided && (
                    <>
                      <ActionBtn onClick={() => setStatus(p.id, PROPOSAL_STATUS.REJECTED)} disabled={pending}>
                        Reject
                      </ActionBtn>
                      <button
                        type="button"
                        onClick={() => accept(p.id)}
                        disabled={pending}
                        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Accept → checkout
                      </button>
                    </>
                  )}
                  {p.status === PROPOSAL_STATUS.ACCEPTED && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700">
                      <ExternalLink className="h-3.5 w-3.5" />
                      Handed to checkout
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-2xl border border-line bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-ink/40";

function ActionBtn({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-full border border-line px-3 py-1.5 text-xs text-ink transition-colors hover:bg-ink/5 disabled:opacity-60"
    >
      {children}
    </button>
  );
}
