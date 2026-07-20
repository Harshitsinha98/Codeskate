/**
 * Auth configuration — PLACEHOLDER values only (no implementation).
 * Real provider wiring (Better Auth: Google/password/magic-link/OTP) is added in
 * a later phase. Source of truth: docs/BACKEND.md §0, §13.
 */

const authConfig = {
  provider: "better-auth" as const,
  session: {
    accessTokenTtlSeconds: 60 * 15,
    refreshTokenTtlDays: 30,
  },
  providers: {
    google: { enabled: false },
    password: { enabled: false },
    magicLink: { enabled: false },
    otp: { enabled: false },
  },
  // Populated from env in a later phase (never hard-code secrets).
  secret: process.env.AUTH_SECRET ?? "",
};

export default authConfig;
