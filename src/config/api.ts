/**
 * API configuration — PLACEHOLDER values only (no implementation).
 * Points the frontend service layer at the NestJS backend in a later phase.
 * Source of truth: docs/BACKEND.md §3, §12.
 */

const apiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
  version: "v1" as const,
  prefix: "/api/v1",
  timeoutMs: 15_000,
};

export default apiConfig;
