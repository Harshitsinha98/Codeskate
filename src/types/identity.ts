/**
 * Identity domain types for AgencyOS.
 * Placeholder foundation — INTERFACES ONLY, no implementation.
 *
 * ── Core architectural stance (see docs/adr/ADR-001) ─────────────────────────
 *  IDENTITY   = a real person (one record per human). Independent of orgs.
 *  AUTH       = the methods that person uses to prove identity (many per person).
 *  ORG LINK   = an Identity joins Organizations ONLY via memberships — never by
 *               duplicating person data into the org. `Identity` holds the single
 *               copy of profile/contact/security; `OrganizationMembership`
 *               (see @/types/organization) references it by `userId` and adds the
 *               per-org roles. No person field is repeated across orgs.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Source of truth: docs/DATABASE.md (users), docs/adr/ADR-001-Identity-Architecture.md.
 */

import type { ID, ISODateString, Timestamps, SoftDeletable } from "@/types/common";
import type {
  ProviderType,
  VerificationStatus,
  AccountStatus,
  SecurityLevel,
  MfaStatus,
  MfaMethod,
} from "@/constants/identity";

// Re-export the derived unions so consumers can import them from "@/types".
export type {
  ProviderType,
  VerificationStatus,
  AccountStatus,
  SecurityLevel,
  MfaStatus,
  MfaMethod,
} from "@/constants/identity";

/** A displayable avatar (uploaded, provider-sourced, or generated). */
export interface Avatar {
  url: string | null;
  source: "upload" | "provider" | "gravatar" | "generated" | null;
  updatedAt: ISODateString | null;
}

/** Human profile — the SINGLE source of a person's public-facing details. */
export interface IdentityProfile {
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  avatar: Avatar;
  jobTitle: string | null;
  bio: string | null;
  locale: string;
  timezone: string;
}

/** Per-person preferences (not org-specific). */
export interface IdentityPreferences {
  locale: string;
  timezone: string;
  theme: "system" | "light" | "dark";
  reducedMotion: boolean;
  marketingEmailsOptIn: boolean;
}

/** Verification record for a person's primary email. */
export interface EmailVerification {
  email: string;
  status: VerificationStatus;
  verifiedAt: ISODateString | null;
  lastSentAt: ISODateString | null;
}

/** Verification record for a person's phone (future / MFA-SMS). */
export interface PhoneVerification {
  phone: string | null;
  status: VerificationStatus;
  verifiedAt: ISODateString | null;
  lastSentAt: ISODateString | null;
}

/**
 * Password credential metadata — NEVER the password itself.
 * The hash lives only in the backend (docs/BACKEND.md §13). This is the
 * frontend-safe view: does one exist, when was it rotated, is a reset pending.
 */
export interface PasswordCredential {
  isSet: boolean;
  updatedAt: ISODateString | null;
  resetRequestedAt: ISODateString | null;
}

/**
 * An external OAuth account linked to the identity (Google/GitHub/…).
 * Tokens are held server-side only; this is the safe descriptor.
 */
export interface OAuthAccount {
  provider: ProviderType;
  providerAccountId: string;
  email: string | null;
  linkedAt: ISODateString | null;
  lastUsedAt: ISODateString | null;
}

/**
 * A single authentication METHOD attached to the identity.
 * One identity → many methods (email+password, Google, magic link, …).
 * `oauth` is populated only for OAuth-type providers.
 */
export interface AuthenticationMethod {
  id: ID;
  provider: ProviderType;
  status: VerificationStatus;
  isPrimary: boolean;
  oauth: OAuthAccount | null;
  createdAt: ISODateString | null;
  lastUsedAt: ISODateString | null;
}

/**
 * A convenience view of a linked provider for UI lists ("Connected accounts").
 * Derived from AuthenticationMethod; no persistence of its own.
 */
export interface LinkedProvider {
  provider: ProviderType;
  label: string;
  connected: boolean;
  isPrimary: boolean;
  email: string | null;
  linkedAt: ISODateString | null;
}

/** Account recovery configuration (frontend-safe descriptors). */
export interface RecoveryOptions {
  recoveryEmail: string | null;
  recoveryEmailStatus: VerificationStatus;
  recoveryPhone: string | null;
  hasRecoveryCodes: boolean;
  recoveryCodesRemaining: number;
}

/** MFA + security posture of the identity. */
export interface SecuritySettings {
  securityLevel: SecurityLevel;
  mfaStatus: MfaStatus;
  mfaMethods: MfaMethod[];
  lastPasswordChangeAt: ISODateString | null;
  recovery: RecoveryOptions;
}

/**
 * The Identity aggregate — one record per real person.
 *
 * Independent of Organizations: it holds NO org data and NO roles. Org
 * relationships are expressed exclusively through `OrganizationMembership`
 * (@/types/organization), which points here via `userId`. This keeps a single,
 * non-duplicated copy of the person.
 */
export interface Identity extends Timestamps, SoftDeletable {
  id: ID;
  primaryEmail: string;
  accountStatus: AccountStatus;
  profile: IdentityProfile;
  preferences: IdentityPreferences;
  emailVerification: EmailVerification;
  phoneVerification: PhoneVerification;
  password: PasswordCredential;
  authenticationMethods: AuthenticationMethod[];
  security: SecuritySettings;
  lastLoginAt: ISODateString | null;
}

/**
 * Minimal identity view for session context — what the app carries at runtime.
 * The organization/role context is resolved SEPARATELY via memberships
 * (@/types/organization `OrganizationContext`), never merged into the person.
 */
export interface IdentitySummary {
  id: ID;
  primaryEmail: string;
  displayName: string | null;
  avatarUrl: string | null;
  accountStatus: AccountStatus;
}
