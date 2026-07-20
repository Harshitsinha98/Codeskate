"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * Route-level error boundary for the client dashboard. Client component (Next.js
 * requirement for error.tsx). Keeps the failure calm and offers a retry.
 */
export default function ClientDashboardError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-4xl border border-dashed border-line bg-surface/60 px-6 py-16 text-center">
      <AlertTriangle className="mb-4 h-8 w-8 text-ink-faint" />
      <p className="text-base font-medium text-ink">Something went wrong</p>
      <p className="mt-1.5 max-w-sm text-sm text-ink-muted">
        We couldn&apos;t load your dashboard. Please try again.
      </p>
      <div className="mt-6">
        <Button onClick={reset} variant="secondary">
          Try again
        </Button>
      </div>
    </div>
  );
}
