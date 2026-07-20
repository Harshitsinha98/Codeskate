/**
 * Storage configuration — PLACEHOLDER values only (no implementation).
 * Cloudflare R2 (S3-compatible) wiring is added in a later phase.
 * Source of truth: docs/BACKEND.md §9 (File Upload Architecture).
 */

const storageConfig = {
  provider: "cloudflare-r2" as const,
  bucket: process.env.R2_BUCKET ?? "",
  publicBaseUrl: process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "",
  maxUploadBytes: 25 * 1024 * 1024,
};

export default storageConfig;
