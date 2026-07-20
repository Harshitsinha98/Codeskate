/**
 * Identity domain constants for AgencyOS.
 * Placeholder foundation — values only. These own the literal sets; the Identity
 * TYPES derive their unions from here (single source of truth).
 *
 * IDENTITY ≠ AUTHENTICATION:
 *  - An Identity is a real person (one record per human).
 *  - Authentication methods are the *ways* that person proves who they are.
 * Source of truth: docs/adr/ADR-001-Identity-Architecture.md, docs/DATABASE.md (users).
 */

/** OAuth / external identity providers (present + future). */
export const PROVIDER_TYPES = {
  EMAIL_PASSWORD: "email_password",
  MAGIC_LINK: "magic_link",
  OTP: "otp",
  GOOGLE: "google",
  GITHUB: "github",
  MICROSOFT: "microsoft",
  APPLE: "apple",
  LINKEDIN: "linkedin",
} as const;

export type ProviderType = (typeof PROVIDER_TYPES)[keyof typeof PROVIDER_TYPES];

/** Which providers are live today vs reserved for the future. */
export const ENABLED_PROVIDERS: ProviderType[] = [
  // None enabled yet — authentication is a later phase. Listed for intent only.
];

export const FUTURE_PROVIDERS: ProviderType[] = [
  PROVIDER_TYPES.EMAIL_PASSWORD,
  PROVIDER_TYPES.MAGIC_LINK,
  PROVIDER_TYPES.OTP,
  PROVIDER_TYPES.GOOGLE,
  PROVIDER_TYPES.GITHUB,
  PROVIDER_TYPES.MICROSOFT,
  PROVIDER_TYPES.APPLE,
  PROVIDER_TYPES.LINKEDIN,
];

/** Verification state for an email, phone, or provider link. */
export const VERIFICATION_STATUS = {
  UNVERIFIED: "unverified",
  PENDING: "pending",
  VERIFIED: "verified",
  EXPIRED: "expired",
  FAILED: "failed",
} as const;

export type VerificationStatus =
  (typeof VERIFICATION_STATUS)[keyof typeof VERIFICATION_STATUS];

/** Lifecycle state of the identity/account itself. */
export const ACCOUNT_STATUS = {
  ACTIVE: "active",
  PENDING: "pending",
  LOCKED: "locked",
  SUSPENDED: "suspended",
  DEACTIVATED: "deactivated",
} as const;

export type AccountStatus =
  (typeof ACCOUNT_STATUS)[keyof typeof ACCOUNT_STATUS];

/** Coarse security posture of the identity (drives step-up policies later). */
export const SECURITY_LEVELS = {
  BASIC: "basic", // password / single factor
  ELEVATED: "elevated", // MFA enabled
  HIGH: "high", // MFA + recovery + verified contacts
} as const;

export type SecurityLevel =
  (typeof SECURITY_LEVELS)[keyof typeof SECURITY_LEVELS];

/** Multi-factor authentication state. */
export const MFA_STATUS = {
  DISABLED: "disabled",
  PENDING_SETUP: "pending_setup",
  ENABLED: "enabled",
} as const;

export type MfaStatus = (typeof MFA_STATUS)[keyof typeof MFA_STATUS];

/** Supported MFA method kinds (future). */
export const MFA_METHODS = {
  TOTP: "totp",
  SMS: "sms",
  EMAIL: "email",
  PASSKEY: "passkey",
  RECOVERY_CODE: "recovery_code",
} as const;

export type MfaMethod = (typeof MFA_METHODS)[keyof typeof MFA_METHODS];
