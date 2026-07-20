# ADR-001 — Identity Architecture: Separating Identity, Authentication & Organizations

**Status:** Accepted
**Date:** 2026-07-11
**Deciders:** Principal Architect (frontend domain model phase)
**Context docs:** `PRD.md`, `ARCHITECTURE.md`, `DATABASE.md`, `BACKEND.md`, `EVOLUTION_ROADMAP.md`

---

## Context

AgencyOS is a multi-tenant SaaS. A single human may:
- log in via multiple methods (Google, email+password, magic link, …),
- belong to multiple organizations (their own agency, a client account, a partner),
- hold different roles in each organization.

We must model this on the frontend **before** building authentication, so that auth and the
backend implement *against* a stable domain model rather than inventing one ad hoc. Three concerns
are frequently — and wrongly — merged into a single "User" table/object:

1. **Identity** — *who the person is* (profile, contact, security posture).
2. **Authentication** — *how the person proves it* (credentials, OAuth links, MFA, sessions).
3. **Organization membership** — *where the person belongs and what they can do there* (tenant + roles).

This ADR records the decision to keep these **three separate domains**.

---

## Decision

Model **Identity**, **Authentication methods**, and **Organization membership** as distinct domains
with explicit relationships:

```
        ┌────────────────────────────┐
        │          IDENTITY          │   one record per REAL PERSON
        │  profile · preferences ·   │   (holds the SINGLE copy of person data)
        │  email/phone verification ·│
        │  security posture          │
        └──────────┬─────────────────┘
                   │ 1 : N
     ┌─────────────┴──────────────┐              ┌───────────────────────────┐
     ▼                            ▼              ▼                           │
AUTHENTICATION METHODS      OAUTH ACCOUNTS   ORGANIZATION MEMBERSHIPS         │
(email+password, magic      (Google, GitHub, (Identity ↔ Organization,       │
 link, OTP, passkey…)        Microsoft…)      roles PER membership)          │
     "how you prove it"      "linked providers"   "where you belong + can do" │
                                                        │ N : 1              │
                                                        ▼                    │
                                                 ORGANIZATIONS ──────────────┘
```

Concretely, in this phase (frontend types only):
- `Identity` (`@/types/identity`) holds the **single** copy of a person's profile, preferences,
  verifications, password *metadata* (never the hash), linked auth methods, and security settings.
- `AuthenticationMethod` / `OAuthAccount` / `PasswordCredential` model the **ways** to authenticate —
  many per identity.
- `OrganizationMembership` (`@/types/organization`) links an identity to an organization **by
  `userId`** and carries the **per-org roles**. Person data is *not* copied into it.
- Runtime context is resolved as **two separate objects**: `IdentitySummary` (who) and
  `OrganizationContext` (where/what) — never a single merged "user".

---

## Rationale

### 1. Why Identity is separated from Authentication
- **One person, many credentials.** A user might sign up with Google, later add a password, then a
  passkey. If identity == a credential, you get duplicate people or brittle "primary login" hacks.
  Separating them lets N authentication methods point at **one** stable identity.
- **Account linking & recovery.** "Sign in with Google" and "email+password" must resolve to the
  *same* person. That's only clean when the person (identity) is independent of the method.
- **Security isolation.** Credentials/tokens/hashes have a different lifecycle, sensitivity, and
  storage location (server-only) than profile data. Separation keeps secrets out of the identity
  aggregate and out of the frontend entirely (we expose *metadata* like `PasswordCredential.isSet`,
  never secrets).
- **Provider churn.** Adding Microsoft/Apple/LinkedIn later is *additive* (a new `ProviderType` +
  `AuthenticationMethod`) with **zero** change to the identity model.

### 2. Why Authentication is separated from Organizations
- **Login is global; authorization is per-tenant.** You authenticate **once** as a person, then act
  **within** an organization. Coupling them would force re-authentication per org and duplicate
  credentials per tenant — wrong and insecure.
- **Roles live on the membership, not the person.** The same identity is `admin` in Org A and
  `client_collaborator` in Org B. Roles therefore belong to `OrganizationMembership`, keyed by
  `(userId, organizationId)` — not to the identity and not to the auth method.
- **Tenant isolation stays clean.** Organizations scope *business* data. Identity/auth scope the
  *person*. Keeping them apart means a security bug in one domain can't silently leak the other, and
  tenant data never embeds personal credentials.

### 3. Why this architecture scales better
- **No data duplication.** One identity record → referenced by many memberships. Update a name/email
  once; every org sees it. (Directly satisfies "Do NOT duplicate user information.")
- **Independent evolution.** Providers, MFA methods, org plans, and roles each evolve without
  touching the others — new enums/interfaces are additive.
- **Multi-tenant native.** A person joining a new agency = one new membership row, not a new user.
  This is the exact shape needed for thousands of agencies and shared users (e.g., a freelancer in
  many agencies).
- **SaaS-ready auth swaps.** Because identity is provider-agnostic, changing/adding an auth provider
  (or IdP/SSO/SCIM later) doesn't ripple into business logic.
- **Clear ownership for the backend.** Maps cleanly onto `DATABASE.md` (`users`, `memberships`,
  `sessions`) and `BACKEND.md` (Auth vs Users vs Organizations modules) — the frontend model and
  backend model agree.

---

## Consequences

**Positive**
- Adding a provider, MFA method, or org role is additive and low-risk.
- Account linking, recovery, and SSO have a natural home.
- Person data has exactly one source of truth; no cross-org duplication.
- Frontend guards read two small, stable objects (`IdentitySummary` + `OrganizationContext`).

**Trade-offs / costs**
- More types up front than a single `User` blob (deliberate — clarity over premature simplicity).
- Runtime code must *compose* identity + membership context rather than read one object. Mitigated
  by providing `IdentitySummary` and `OrganizationContext` as the two canonical views.
- The earlier placeholder `@/types/user.ts` (`User`, `Membership`, `SessionUser`) now overlaps
  conceptually with `Identity`. **Deferred reconciliation:** in a later phase `User` will be aligned
  to/aliased by `Identity` and `SessionUser` folded into `IdentitySummary`. Left untouched now to
  preserve backwards compatibility (nothing imports it yet).

**Neutral**
- No runtime impact this phase — types/constants only; nothing wired, marketing untouched.

---

## Alternatives considered

1. **Single `User` model holding credentials + profile + org/roles.** Rejected: duplicates people
   across providers/orgs, mixes secrets with profile, breaks account linking, and doesn't fit
   multi-tenant shared users.
2. **Identity + Auth merged, Organizations separate.** Rejected: still fails "one person, many login
   methods" cleanly and leaks credential lifecycle into the person aggregate.
3. **Roles on the identity (global roles).** Rejected: roles are inherently per-tenant in an agency
   SaaS; a global role can't express "admin here, client there."

---

## References
- `docs/DATABASE.md` — Domain A (users, memberships, sessions).
- `docs/BACKEND.md` — §2 (Auth vs Users vs Organizations modules), §13 (security, secrets server-side).
- `docs/ARCHITECTURE.md` — §3 (roles & permissions), Domain A (tenancy).
- `src/types/identity.ts`, `src/types/organization.ts`, `src/constants/identity.ts`.
