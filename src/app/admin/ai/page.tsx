import { Sparkles } from "lucide-react";
import { getAdminProjects } from "@/lib/admin-dashboard";
import { getAiConfig } from "@/lib/ai";
import { Panel } from "@/features/client-dashboard/components/Panel";
import { EmptyState } from "@/features/client-dashboard/components/EmptyState";
import { StatusBadge } from "@/features/client-dashboard/components/StatusBadge";
import { projectStatusPresentation } from "@/features/client-dashboard/lib/presentation";
import { GenerateInsightButton } from "@/features/ai";
import { AI_DIGEST_ROLE } from "@/constants/ai";

export const metadata = { title: "AI Operations — AgencyOS" };

/**
 * AI Operations surface. Every insight is generated on demand through the
 * read-only AI service (`@/lib/ai`) — nothing on this page mutates business
 * data. Agency-wide features (executive summary, admin daily digest) sit at the
 * top; per-project features (summary, client update, risks, weekly report) are
 * generated inline against a selected project.
 */
export default async function AdminAiPage() {
  const projects = await getAdminProjects();
  const config = getAiConfig();

  return (
    <div className="space-y-10">
      <header>
        <h1 className="flex items-center gap-2 text-display-lg text-ink">
          <Sparkles className="h-6 w-6 text-royal-700" />
          AI Operations
        </h1>
        <p className="mt-2 text-ink-muted">
          Read-only insights, summaries and recommendations generated on top of
          your live project data. AI is an assistant — the platform remains the
          source of truth.
        </p>
        {!config.enabled && (
          <p className="mt-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 px-4 py-2 text-sm text-amber-700">
            No AI provider API key is configured. Insights will render as
            placeholders until one is set (provider: {config.provider}).
          </p>
        )}
      </header>

      {/* Agency-wide */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Executive Summary">
          <p className="mb-4 text-sm text-ink-muted">
            One-page management view: project health, delivery status, upcoming
            milestones, risks, pending approvals and outstanding deliverables.
          </p>
          <GenerateInsightButton kind="executive_summary" label="Generate executive summary" />
        </Panel>

        <Panel title="Daily Digest (Admin)">
          <p className="mb-4 text-sm text-ink-muted">
            A role-specific digest of what changed across the agency and what
            needs attention today.
          </p>
          <GenerateInsightButton
            kind="daily_digest"
            digestRole={AI_DIGEST_ROLE.ADMIN}
            label="Generate admin digest"
          />
        </Panel>
      </div>

      {/* Per-project */}
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-ink">Per-project insights</h2>
        {projects.length === 0 ? (
          <EmptyState
            title="No projects yet"
            description="Project insights appear here once orders are paid."
          />
        ) : (
          <div className="space-y-4">
            {projects.map((p) => (
              <Panel key={p.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">
                      {p.code} · {p.serviceTitle}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {p.clientName ?? "Guest"} · {p.progressPct}% complete
                    </p>
                  </div>
                  <StatusBadge presentation={projectStatusPresentation(p.status)} />
                </div>

                <div className="mt-5 grid gap-6 sm:grid-cols-2">
                  <GenerateInsightButton
                    kind="project_summary"
                    projectId={p.id}
                    label="Project summary"
                  />
                  <GenerateInsightButton
                    kind="client_update"
                    projectId={p.id}
                    label="Client update"
                  />
                  <GenerateInsightButton
                    kind="risk_detection"
                    projectId={p.id}
                    label="Detect risks"
                  />
                  <GenerateInsightButton
                    kind="weekly_report"
                    projectId={p.id}
                    label="Weekly report"
                  />
                </div>
              </Panel>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
