/**
 * Atomic permission primitives (resource:action) for AgencyOS RBAC.
 * Placeholder foundation — representative set, extended as modules are built.
 * Source of truth: docs/ARCHITECTURE.md §3, docs/BACKEND.md §7.
 */

export const PERMISSIONS = {
  // Organizations & settings
  ORG_MANAGE: "org:manage",
  SETTINGS_MANAGE: "settings:manage",
  MEMBER_MANAGE: "member:manage",

  // CRM & sales
  LEAD_VIEW: "lead:view",
  LEAD_MANAGE: "lead:manage",
  PROPOSAL_MANAGE: "proposal:manage",

  // Projects & delivery
  PROJECT_VIEW: "project:view",
  PROJECT_CREATE: "project:create",
  PROJECT_MANAGE: "project:manage",
  TASK_MANAGE: "task:manage",
  TIME_LOG: "time:log",

  // Finance
  INVOICE_CREATE: "invoice:create",
  INVOICE_VIEW: "invoice:view",
  PAYMENT_PAY: "payment:pay",
  FINANCE_REPORT_VIEW: "finance:report:view",

  // Content
  CMS_MANAGE: "cms:manage",

  // Approvals
  APPROVAL_DECIDE: "approval:decide",

  // AI
  AI_CONFIGURE: "ai:configure",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
