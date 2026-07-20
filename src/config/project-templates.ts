/**
 * Project templates — the delivery blueprint for each catalog service.
 *
 * A template is the single source of truth for what a project looks like the
 * moment it's provisioned from a paid order: its ordered phases, each phase's
 * default tasks + milestones, and an estimated duration (days). The project
 * engine (`@/lib/project-service`) expands the matching template into concrete
 * Project / ProjectPhase / ProjectMilestone / ProjectTask rows.
 *
 * Keyed by catalog service slug (see `@/config/catalog`). `getProjectTemplate`
 * falls back to a generic template for an unknown slug so provisioning never
 * fails — delivery must never block a paid order.
 */

import type { PhaseTemplate, ProjectTemplate, ServiceType } from "@/types/project";
import { serviceTypeForSlug } from "@/lib/service-type";
import { DEFAULT_PROJECT_PHASES } from "@/constants/project";

/** Website Development — Discovery → Wireframes → UI → Frontend → Backend → Testing → Deployment. */
const WEBSITE_PHASES: PhaseTemplate[] = [
  {
    name: "Discovery",
    estimatedDurationDays: 5,
    tasks: [
      { title: "Stakeholder kickoff & goals", description: "Align on objectives, audience and success metrics." },
      { title: "Information architecture", description: "Map sitemap, content model and key user journeys." },
      { title: "Tech stack & performance budget", description: "Agree architecture and a performance budget up front." },
    ],
    milestones: [{ name: "Discovery sign-off" }],
  },
  {
    name: "Wireframes",
    estimatedDurationDays: 5,
    tasks: [
      { title: "Low-fidelity wireframes", description: "Structure every key screen before visual design." },
      { title: "Content mapping", description: "Slot real content into the wireframe skeleton." },
    ],
    milestones: [{ name: "Wireframes approved" }],
  },
  {
    name: "UI Design",
    estimatedDurationDays: 8,
    tasks: [
      { title: "Design system & components", description: "Reusable, conversion-first component library." },
      { title: "High-fidelity screens", description: "Full visual design across all breakpoints." },
      { title: "Motion & interaction spec", description: "Define transitions and micro-interactions." },
    ],
    milestones: [{ name: "UI design approved" }],
  },
  {
    name: "Frontend",
    estimatedDurationDays: 12,
    tasks: [
      { title: "Component implementation", description: "Build the type-safe component library." },
      { title: "Page assembly & responsiveness", description: "Assemble pages, wire routing, tune responsiveness." },
      { title: "Accessibility pass", description: "Keyboard, ARIA and contrast conformance." },
    ],
    milestones: [{ name: "Frontend feature-complete" }],
  },
  {
    name: "Backend",
    estimatedDurationDays: 10,
    tasks: [
      { title: "Data model & APIs", description: "Schema, endpoints and integration contracts." },
      { title: "Auth & business logic", description: "Sessions, permissions and core workflows." },
      { title: "Third-party integrations", description: "Payments, CMS, analytics and email." },
    ],
    milestones: [{ name: "Backend feature-complete" }],
  },
  {
    name: "Testing",
    estimatedDurationDays: 5,
    tasks: [
      { title: "QA & cross-browser testing", description: "Functional, visual and device coverage." },
      { title: "Performance & SEO audit", description: "Core Web Vitals and on-page SEO checks." },
      { title: "UAT with client", description: "Client acceptance on staging." },
    ],
    milestones: [{ name: "QA passed" }],
  },
  {
    name: "Deployment",
    estimatedDurationDays: 2,
    tasks: [
      { title: "Production release", description: "Ship through the preview-per-branch pipeline." },
      { title: "Analytics & monitoring", description: "Wire analytics, error tracking and uptime alerts." },
      { title: "Handover & documentation", description: "Docs, training and post-launch plan." },
    ],
    milestones: [{ name: "Go-live" }],
  },
];

/** Mobile App Development — Requirement Analysis → UI → API → Android → iOS → Testing → Deployment. */
const APP_PHASES: PhaseTemplate[] = [
  {
    name: "Requirement Analysis",
    estimatedDurationDays: 6,
    tasks: [
      { title: "Product strategy & MVP scope", description: "User journeys and an MVP scope that ships." },
      { title: "Platform & architecture decisions", description: "Native vs cross-platform, data and offline strategy." },
    ],
    milestones: [{ name: "Requirements sign-off" }],
  },
  {
    name: "UI",
    estimatedDurationDays: 10,
    tasks: [
      { title: "Interactive prototype", description: "Validate flows with real users before code." },
      { title: "High-fidelity UI & design system", description: "Screens and a scalable component system." },
    ],
    milestones: [{ name: "UI approved" }],
  },
  {
    name: "API",
    estimatedDurationDays: 12,
    tasks: [
      { title: "API design & data model", description: "Endpoints, schema and integration contracts." },
      { title: "Auth & core services", description: "Accounts, permissions and business logic." },
      { title: "Push & notifications backend", description: "Delivery infrastructure for engagement." },
    ],
    milestones: [{ name: "API feature-complete" }],
  },
  {
    name: "Android",
    estimatedDurationDays: 12,
    tasks: [
      { title: "Android implementation", description: "Modular, testable Android build." },
      { title: "Play Store delivery pipeline", description: "Continuous delivery to internal testing." },
    ],
    milestones: [{ name: "Android build ready" }],
  },
  {
    name: "iOS",
    estimatedDurationDays: 12,
    tasks: [
      { title: "iOS implementation", description: "Modular, testable iOS build." },
      { title: "TestFlight delivery pipeline", description: "Continuous delivery to TestFlight." },
    ],
    milestones: [{ name: "iOS build ready" }],
  },
  {
    name: "Testing",
    estimatedDurationDays: 6,
    tasks: [
      { title: "QA across devices", description: "Functional and device-matrix coverage." },
      { title: "Performance & crash testing", description: "Profiling, memory and stability." },
      { title: "UAT with client", description: "Client acceptance on release candidate." },
    ],
    milestones: [{ name: "QA passed" }],
  },
  {
    name: "Deployment",
    estimatedDurationDays: 3,
    tasks: [
      { title: "Store submissions", description: "App Store and Play Store release." },
      { title: "Monitoring & analytics", description: "Crash reporting and product analytics." },
      { title: "Handover & documentation", description: "Docs, training and growth plan." },
    ],
    milestones: [{ name: "Live on stores" }],
  },
];

/** SEO / search delivery — Keyword Research → On-page → Technical → Backlinks → Reporting. */
const SEO_PHASES: PhaseTemplate[] = [
  {
    name: "Keyword Research",
    estimatedDurationDays: 4,
    tasks: [
      { title: "Audience & intent mapping", description: "Cluster keywords by funnel intent." },
      { title: "Competitor gap analysis", description: "Find the highest-leverage ranking opportunities." },
    ],
    milestones: [{ name: "Keyword strategy approved" }],
  },
  {
    name: "On-page SEO",
    estimatedDurationDays: 6,
    tasks: [
      { title: "Metadata & content optimization", description: "Titles, meta, headings and copy." },
      { title: "Internal linking structure", description: "Topic clusters and link equity flow." },
    ],
    milestones: [{ name: "On-page optimizations live" }],
  },
  {
    name: "Technical SEO",
    estimatedDurationDays: 6,
    tasks: [
      { title: "Crawl & indexation audit", description: "Fix crawl, canonical and indexation issues." },
      { title: "Core Web Vitals & speed", description: "Performance and structured data." },
    ],
    milestones: [{ name: "Technical audit resolved" }],
  },
  {
    name: "Backlinks",
    estimatedDurationDays: 10,
    tasks: [
      { title: "Link prospecting", description: "Identify authoritative, relevant targets." },
      { title: "Outreach & placements", description: "Earn and place quality backlinks." },
    ],
    milestones: [{ name: "First link placements secured" }],
  },
  {
    name: "Reporting",
    estimatedDurationDays: 3,
    tasks: [
      { title: "Rank & traffic dashboard", description: "Wire up rankings, traffic and conversions." },
      { title: "Monthly performance report", description: "Insights and next-iteration plan." },
    ],
    milestones: [{ name: "Reporting cadence established" }],
  },
];

/** UI / UX Design — Discover → Frame → Craft → Validate → Handoff. */
const DESIGN_PHASES: PhaseTemplate[] = [
  {
    name: "Discover",
    estimatedDurationDays: 5,
    tasks: [
      { title: "Interviews & analytics review", description: "Find the real problem behind the brief." },
      { title: "Competitive teardown", description: "Benchmark patterns and opportunities." },
    ],
    milestones: [{ name: "Research synthesis approved" }],
  },
  {
    name: "Frame",
    estimatedDurationDays: 6,
    tasks: [
      { title: "User flows & IA", description: "Flows and structure aligned to goals." },
      { title: "Low-fidelity structure", description: "Wireframe the key journeys." },
    ],
    milestones: [{ name: "Wireframes approved" }],
  },
  {
    name: "Craft",
    estimatedDurationDays: 8,
    tasks: [
      { title: "High-fidelity UI", description: "Visual design across key screens." },
      { title: "Motion & component system", description: "Scalable, reusable component library." },
    ],
    milestones: [{ name: "UI design approved" }],
  },
  {
    name: "Validate",
    estimatedDurationDays: 5,
    tasks: [
      { title: "Usability testing", description: "Test with real users and iterate." },
      { title: "Iteration to metrics", description: "Refine until the numbers move." },
    ],
    milestones: [{ name: "Design validated" }],
  },
  {
    name: "Handoff",
    estimatedDurationDays: 2,
    tasks: [
      { title: "Developer handoff kit", description: "Specs, tokens and assets." },
      { title: "Design QA support", description: "Support build-time design fidelity." },
    ],
    milestones: [{ name: "Handoff complete" }],
  },
];

/** Branding — Position → Express → System → Activate. */
const BRANDING_PHASES: PhaseTemplate[] = [
  {
    name: "Position",
    estimatedDurationDays: 5,
    tasks: [
      { title: "Audience & category", description: "Define the one idea you'll own." },
      { title: "Brand strategy", description: "Positioning, values and messaging pillars." },
    ],
    milestones: [{ name: "Positioning approved" }],
  },
  {
    name: "Express",
    estimatedDurationDays: 8,
    tasks: [
      { title: "Logo & identity", description: "Logo, type, color and imagery." },
      { title: "Voice & tone", description: "Verbal identity built around the idea." },
    ],
    milestones: [{ name: "Identity approved" }],
  },
  {
    name: "System",
    estimatedDurationDays: 6,
    tasks: [
      { title: "Brand guidelines", description: "Rules so the brand stays consistent." },
      { title: "Asset library", description: "Templates and assets for every channel." },
    ],
    milestones: [{ name: "Brand system delivered" }],
  },
  {
    name: "Activate",
    estimatedDurationDays: 5,
    tasks: [
      { title: "Rollout across touchpoints", description: "Product, web and social rollout." },
      { title: "Launch assets", description: "Announcement and campaign assets." },
    ],
    milestones: [{ name: "Brand launched" }],
  },
];

/** Digital Marketing — Audit → Build → Convert → Compound (SEO folded in). */
const MARKETING_PHASES: PhaseTemplate[] = [
  {
    name: "Audit",
    estimatedDurationDays: 5,
    tasks: [
      { title: "Full-funnel analysis", description: "Find the biggest growth levers." },
      { title: "Keyword & channel research", description: "Prioritize channels and search intent." },
    ],
    milestones: [{ name: "Growth plan approved" }],
  },
  {
    name: "Build",
    estimatedDurationDays: 10,
    tasks: [
      { title: "Content & on-page SEO", description: "Produce content and optimize on-page." },
      { title: "Technical fixes & automation", description: "Resolve technical debt, wire automation." },
    ],
    milestones: [{ name: "Foundations shipped" }],
  },
  {
    name: "Convert",
    estimatedDurationDays: 8,
    tasks: [
      { title: "Funnels & CRO", description: "Turn traffic into pipeline." },
      { title: "Tracking & attribution", description: "Airtight conversion tracking." },
    ],
    milestones: [{ name: "Conversion tracking live" }],
  },
  {
    name: "Compound",
    estimatedDurationDays: 6,
    tasks: [
      { title: "Monthly iteration", description: "Double down on what the data rewards." },
      { title: "Performance reporting", description: "Report results and next steps." },
    ],
    milestones: [{ name: "Reporting cadence established" }],
  },
];

/** Paid Advertising — Model → Launch → Optimize → Scale. */
const PAID_ADS_PHASES: PhaseTemplate[] = [
  {
    name: "Model",
    estimatedDurationDays: 4,
    tasks: [
      { title: "Unit economics & channel plan", description: "A plan that can scale profitably." },
      { title: "Account & tracking setup", description: "Pixels, conversions and audiences." },
    ],
    milestones: [{ name: "Media plan approved" }],
  },
  {
    name: "Launch",
    estimatedDurationDays: 5,
    tasks: [
      { title: "Creative & audiences", description: "Ad creative and audience targeting." },
      { title: "Campaign launch", description: "Go live with conversion tracking verified." },
    ],
    milestones: [{ name: "Campaigns live" }],
  },
  {
    name: "Optimize",
    estimatedDurationDays: 10,
    tasks: [
      { title: "Bid & budget optimization", description: "Daily bid and budget iteration." },
      { title: "Creative iteration", description: "Test and refresh winning creative." },
    ],
    milestones: [{ name: "Target ROAS reached" }],
  },
  {
    name: "Scale",
    estimatedDurationDays: 8,
    tasks: [
      { title: "Scale winning campaigns", description: "Push winners while ROAS holds." },
      { title: "New channel expansion", description: "Expand into adjacent channels." },
    ],
    milestones: [{ name: "Profitable scale achieved" }],
  },
];

/** AI Automation — Map → Build → Integrate → Optimize. */
const AI_PHASES: PhaseTemplate[] = [
  {
    name: "Map",
    estimatedDurationDays: 5,
    tasks: [
      { title: "Workflow discovery", description: "Find where AI pays back fastest." },
      { title: "ROI & feasibility", description: "Prioritize automations by impact." },
    ],
    milestones: [{ name: "Automation roadmap approved" }],
  },
  {
    name: "Build",
    estimatedDurationDays: 12,
    tasks: [
      { title: "Agents & automations", description: "Build the agents and workflows." },
      { title: "Prompt & model tuning", description: "Tune for accuracy and cost." },
    ],
    milestones: [{ name: "Automations built" }],
  },
  {
    name: "Integrate",
    estimatedDurationDays: 8,
    tasks: [
      { title: "Wire into existing stack", description: "Connect to CRM, data and tools." },
      { title: "Guardrails & monitoring", description: "Safety, evals and observability." },
    ],
    milestones: [{ name: "Integrated into production" }],
  },
  {
    name: "Optimize",
    estimatedDurationDays: 6,
    tasks: [
      { title: "Performance tuning", description: "Improve quality, latency and cost." },
      { title: "Handover & enablement", description: "Docs and team enablement." },
    ],
    milestones: [{ name: "Handover complete" }],
  },
];

/** Maintenance & Growth — retainer cadence: Onboard → Stabilize → Improve → Report. */
const MAINTENANCE_PHASES: PhaseTemplate[] = [
  {
    name: "Onboard",
    estimatedDurationDays: 3,
    tasks: [
      { title: "System audit & access", description: "Inventory the stack and secure access." },
      { title: "Baseline metrics", description: "Establish performance and health baselines." },
    ],
    milestones: [{ name: "Onboarding complete" }],
  },
  {
    name: "Stabilize",
    estimatedDurationDays: 7,
    tasks: [
      { title: "Critical fixes", description: "Resolve high-priority issues and risks." },
      { title: "Monitoring & alerts", description: "Uptime, error and security monitoring." },
    ],
    milestones: [{ name: "System stabilized" }],
  },
  {
    name: "Improve",
    estimatedDurationDays: 14,
    tasks: [
      { title: "Iterative enhancements", description: "Ship prioritized improvements." },
      { title: "Performance & SEO upkeep", description: "Ongoing speed and search health." },
    ],
    milestones: [{ name: "Improvement sprint delivered" }],
  },
  {
    name: "Report",
    estimatedDurationDays: 2,
    tasks: [
      { title: "Monthly health report", description: "Uptime, changes and recommendations." },
      { title: "Roadmap review", description: "Plan the next cycle with the client." },
    ],
    milestones: [{ name: "Reporting cadence established" }],
  },
];

/** Generic fallback template — used for an unknown/unmapped service slug. */
const GENERIC_PHASES: PhaseTemplate[] = DEFAULT_PROJECT_PHASES.map((name) => ({
  name,
  estimatedDurationDays: 5,
  tasks: [{ title: `${name} work`, description: `Complete the ${name.toLowerCase()} stage.` }],
  milestones: [{ name: `${name} sign-off` }],
}));

/** Every service's template, keyed by catalog slug. */
const TEMPLATES_BY_SLUG: Record<string, PhaseTemplate[]> = {
  "web-development": WEBSITE_PHASES,
  "mobile-apps": APP_PHASES,
  "ui-ux-design": DESIGN_PHASES,
  branding: BRANDING_PHASES,
  "digital-marketing": MARKETING_PHASES,
  "paid-advertising": PAID_ADS_PHASES,
  "ai-automation": AI_PHASES,
  "maintenance-growth": MAINTENANCE_PHASES,
};

/** Re-exported so callers can seed an SEO-specific engagement when needed. */
export { SEO_PHASES };

/**
 * Resolve the delivery blueprint for a service slug. Falls back to a generic
 * template (never throws) so a paid order always yields a valid project.
 */
export function getProjectTemplate(serviceSlug: string): ProjectTemplate {
  const phases = TEMPLATES_BY_SLUG[serviceSlug] ?? GENERIC_PHASES;
  const serviceType: ServiceType = serviceTypeForSlug(serviceSlug);
  return { serviceSlug, serviceType, phases };
}

/** Total planned duration (days) across a template's phases. */
export function templateDurationDays(template: ProjectTemplate): number {
  return template.phases.reduce((sum, phase) => sum + phase.estimatedDurationDays, 0);
}
