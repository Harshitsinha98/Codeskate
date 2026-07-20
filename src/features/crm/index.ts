/**
 * Feature: Sales CRM (leads, pipeline, proposals) — agency-internal surface.
 * Barrel for the CRM UI components. Business logic lives in the services
 * (`@/lib/lead-service`, `@/lib/proposal-service`, `@/lib/crm-dashboard`).
 */

export { CrmRealtimeRefresher } from "@/features/crm/components/CrmRealtimeRefresher";
export { CreateLeadForm } from "@/features/crm/components/CreateLeadForm";
export { LeadStageSelect } from "@/features/crm/components/LeadStageSelect";
export { LeadOwnerSelect } from "@/features/crm/components/LeadOwnerSelect";
export { ProposalPanel, type CatalogOption } from "@/features/crm/components/ProposalPanel";
export {
  leadStagePresentation,
  leadPriorityPresentation,
  proposalStatusPresentation,
  crmTitleCase,
} from "@/features/crm/lib/presentation";
