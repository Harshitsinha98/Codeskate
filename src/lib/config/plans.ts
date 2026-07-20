/**
 * CENTRALIZED PLANS — the four engagement tiers, defined once.
 *
 * Every plan carries the full spec (price, old price, discount, timeline,
 * CTA, features, add-ons…). Marketing components (`PricingCards`,
 * `ComparisonTable`, service pages) consume these — never duplicate a plan.
 */

import { formatPrice, DISCOUNT, SUPPORT } from "./pricing";

export type PlanId = "starter" | "growth" | "business" | "enterprise";

export type CentralPlan = {
  id: PlanId;
  slug: string;
  title: string;
  subtitle: string;
  /** Numeric starting price in INR; null = "Custom". */
  startingPrice: number | null;
  /** Numeric pre-discount price in INR; null = none. */
  oldPrice: number | null;
  discountPercentage: number;
  billingType: "one-time" | "monthly" | "project" | "retainer";
  /** Human cadence label shown next to the price. */
  cadence: string;
  popular: boolean;
  recommended: boolean;
  timeline: string;
  deliveryDays: number | null;
  ctaText: string;
  ctaLink: string;
  badge: string | null;
  supportPeriod: string;
  refundPolicy: string;
  maintenance: string;
  technologies: string[];
  includedFeatures: string[];
  excludedFeatures: string[];
  addons: string[];
};

export const PLANS: Record<PlanId, CentralPlan> = {
  starter: {
    id: "starter",
    slug: "starter",
    title: "Starter",
    subtitle: "For founders validating an idea with a fast, credible launch.",
    startingPrice: 5999,
    oldPrice: 14999,
    discountPercentage: DISCOUNT.percentage,
    billingType: "one-time",
    cadence: "launch offer",
    popular: true,
    recommended: false,
    timeline: "1–2 weeks",
    deliveryDays: 14,
    ctaText: "Get started",
    ctaLink: "/contact",
    badge: "Most popular",
    supportPeriod: SUPPORT.label,
    refundPolicy: "7-day satisfaction window",
    maintenance: "Optional retainer after launch",
    technologies: ["Next.js", "React", "Tailwind CSS"],
    includedFeatures: [
      "Marketing website (up to 5 pages)",
      "Custom, responsive design",
      "On-page & technical SEO",
      "Analytics & conversion tracking",
      "2 weeks post-launch support",
    ],
    excludedFeatures: ["Headless CMS", "Web app / portal", "Dedicated team"],
    addons: ["Extra pages", "Copywriting", "Logo & brand kit"],
  },
  growth: {
    id: "growth",
    slug: "growth",
    title: "Growth",
    subtitle: "For growing teams that need a fully custom site with a CMS.",
    startingPrice: 19999,
    oldPrice: null,
    discountPercentage: 0,
    billingType: "project",
    cadence: "starting price",
    popular: false,
    recommended: true,
    timeline: "3–5 weeks",
    deliveryDays: 35,
    ctaText: "Book a consultation",
    ctaLink: "/contact",
    badge: null,
    supportPeriod: "4 weeks post-launch support",
    refundPolicy: "Milestone-based, cancel any time",
    maintenance: "Growth retainer recommended",
    technologies: ["Next.js", "React", "Headless CMS", "TypeScript"],
    includedFeatures: [
      "Everything in Starter",
      "Up to 10 pages, custom design system",
      "Headless CMS your team can run",
      "Core Web Vitals optimization",
      "4 weeks post-launch support",
    ],
    excludedFeatures: ["Web app / portal", "Dedicated team"],
    addons: ["API integrations", "E-commerce", "Multilingual"],
  },
  business: {
    id: "business",
    slug: "business",
    title: "Business",
    subtitle: "For companies building a web app, portal or platform.",
    startingPrice: 49999,
    oldPrice: null,
    discountPercentage: 0,
    billingType: "project",
    cadence: "starting price",
    popular: false,
    recommended: false,
    timeline: "6–10 weeks",
    deliveryDays: 70,
    ctaText: "Book a consultation",
    ctaLink: "/contact",
    badge: null,
    supportPeriod: "8 weeks post-launch support",
    refundPolicy: "Milestone-based, cancel any time",
    maintenance: "SLA-backed maintenance available",
    technologies: ["Next.js", "Node.js", "PostgreSQL", "AWS"],
    includedFeatures: [
      "Everything in Growth",
      "Web app / customer portal",
      "API & third-party integrations",
      "Dashboards & role-based access",
      "8 weeks post-launch support",
    ],
    excludedFeatures: ["Dedicated cross-functional team"],
    addons: ["Mobile app", "AI automation", "Priority SLA"],
  },
  enterprise: {
    id: "enterprise",
    slug: "enterprise",
    title: "Enterprise",
    subtitle: "For established teams that need a dedicated senior partner.",
    startingPrice: null,
    oldPrice: null,
    discountPercentage: 0,
    billingType: "retainer",
    cadence: "retainer or project",
    popular: false,
    recommended: false,
    timeline: "Ongoing",
    deliveryDays: null,
    ctaText: "Talk to us",
    ctaLink: "/contact",
    badge: null,
    supportPeriod: "Priority SLA & monitoring",
    refundPolicy: "Custom contract terms",
    maintenance: "Dedicated team & quarterly reviews",
    technologies: ["Web", "Mobile", "AI", "Cloud"],
    includedFeatures: [
      "Everything in Business",
      "Dedicated cross-functional team",
      "Multi-platform (web, mobile, AI)",
      "Priority SLA & monitoring",
      "Quarterly strategy reviews",
    ],
    excludedFeatures: [],
    addons: ["Staff augmentation", "24/7 support", "Custom integrations"],
  },
};

/** Ordered list of plans for grids/tables. */
export const PLAN_ORDER: PlanId[] = ["starter", "growth", "business", "enterprise"];

export const PLAN_LIST: CentralPlan[] = PLAN_ORDER.map((id) => PLANS[id]);

/** Display-ready price label for a plan, e.g. "₹9,999" or "Custom". */
export function planPriceLabel(plan: CentralPlan): string {
  return plan.startingPrice === null ? "Custom" : formatPrice(plan.startingPrice);
}

export function planOldPriceLabel(plan: CentralPlan): string | null {
  return plan.oldPrice === null ? null : formatPrice(plan.oldPrice);
}
