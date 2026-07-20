"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { changeLeadStageAction } from "@/app/admin/crm/actions";
import { LEAD_STAGE, type LeadStageValue } from "@/constants/crm";
import { crmTitleCase } from "@/features/crm/lib/presentation";

const STAGES = Object.values(LEAD_STAGE) as LeadStageValue[];

/**
 * Inline pipeline-stage selector for a lead. Changing the value calls
 * `changeLeadStageAction`, which runs the service seam that records the change,
 * emits realtime, and generates notifications. Refreshes on success.
 */
export function LeadStageSelect({ leadId, stage }: { leadId: string; stage: LeadStageValue }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onChange(next: string) {
    if (next === stage) return;
    startTransition(async () => {
      await changeLeadStageAction(leadId, next as LeadStageValue);
      router.refresh();
    });
  }

  return (
    <div className="inline-flex items-center gap-2">
      <select
        value={stage}
        disabled={pending}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-full border border-line bg-base px-3 py-1.5 text-sm text-ink outline-none transition-colors focus:border-ink/40 disabled:opacity-60"
      >
        {STAGES.map((s) => (
          <option key={s} value={s}>{crmTitleCase(s)}</option>
        ))}
      </select>
      {pending && <Loader2 className="h-4 w-4 animate-spin text-ink-faint" />}
    </div>
  );
}
