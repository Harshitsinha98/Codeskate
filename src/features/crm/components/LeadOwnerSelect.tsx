"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { assignLeadOwnerAction } from "@/app/admin/crm/actions";
import type { CrmSalesperson } from "@/lib/crm-dashboard";

/**
 * Inline sales-person assignment for a lead. Reassigns the owner via
 * `assignLeadOwnerAction` (notifies the new owner). Refreshes on success.
 */
export function LeadOwnerSelect({
  leadId,
  ownerId,
  salespeople,
}: {
  leadId: string;
  ownerId: string | null;
  salespeople: CrmSalesperson[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onChange(next: string) {
    const value = next === "" ? null : next;
    if (value === ownerId) return;
    startTransition(async () => {
      await assignLeadOwnerAction(leadId, value);
      router.refresh();
    });
  }

  return (
    <div className="inline-flex items-center gap-2">
      <select
        value={ownerId ?? ""}
        disabled={pending}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-full border border-line bg-base px-3 py-1.5 text-sm text-ink outline-none transition-colors focus:border-ink/40 disabled:opacity-60"
      >
        <option value="">Unassigned</option>
        {salespeople.map((s) => (
          <option key={s.id} value={s.id}>{s.name ?? s.email}</option>
        ))}
      </select>
      {pending && <Loader2 className="h-4 w-4 animate-spin text-ink-faint" />}
    </div>
  );
}
