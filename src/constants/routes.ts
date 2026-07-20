/**
 * Central route registry for AgencyOS.
 * Placeholder foundation — marketing routes are LIVE today; auth/app routes are
 * reserved for future phases (no pages exist yet, per the migration plan).
 * Source of truth: docs/EVOLUTION_ROADMAP.md §2 (Routing Structure).
 */

/** Public marketing routes — these EXIST today and must not change. */
export const MARKETING_ROUTES = {
  home: "/",
  about: "/about",
  services: "/services",
  work: "/work",
  blog: "/blog",
  pricing: "/pricing",
  process: "/process",
  industries: "/industries",
  careers: "/careers",
  contact: "/contact",
  privacy: "/privacy",
  terms: "/terms",
} as const;

/** Commerce routes — live today, public (checkout collects details before auth). */
export const COMMERCE_ROUTES = {
  checkout: "/checkout",
} as const;

/** Auth routes — reserved (future (auth) route group). */
export const AUTH_ROUTES = {
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  verify: "/verify",
} as const;

/** Authenticated app routes — reserved (future (app) route group). */
export const APP_ROUTES = {
  client: "/client",
  admin: "/admin",
  employee: "/employee",
  settings: "/settings",
} as const;

export const ROUTES = {
  ...MARKETING_ROUTES,
  ...COMMERCE_ROUTES,
  auth: AUTH_ROUTES,
  app: APP_ROUTES,
} as const;

export type MarketingRoute =
  (typeof MARKETING_ROUTES)[keyof typeof MARKETING_ROUTES];
