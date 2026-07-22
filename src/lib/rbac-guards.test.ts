import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { isAdminEmail } from "@/lib/admin-auth";
import { isEmployeeEmail } from "@/lib/employee-auth";
import { isFinanceEmail } from "@/lib/finance-auth";
import { isVerifiedIdentity } from "@/lib/privileged-identity";

const ADMIN = "boss@codeskate.com";
const EMPLOYEE = "dev@codeskate.com";
const FINANCE = "cfo@codeskate.com";
const OUTSIDER = "random@gmail.com";

describe("privileged email allowlists", () => {
  beforeEach(() => {
    process.env.ADMIN_EMAILS = `${ADMIN}, EXTRA@codeskate.com`;
    process.env.EMPLOYEE_EMAILS = EMPLOYEE;
    process.env.FINANCE_MANAGER_EMAILS = FINANCE;
  });
  afterEach(() => {
    delete process.env.ADMIN_EMAILS;
    delete process.env.EMPLOYEE_EMAILS;
    delete process.env.FINANCE_MANAGER_EMAILS;
  });

  it("isAdminEmail matches allowlisted emails case-insensitively", () => {
    expect(isAdminEmail(ADMIN)).toBe(true);
    expect(isAdminEmail(ADMIN.toUpperCase())).toBe(true);
    expect(isAdminEmail("extra@codeskate.com")).toBe(true); // stored uppercase, matched lower
  });

  it("isAdminEmail rejects outsiders and empty input", () => {
    expect(isAdminEmail(OUTSIDER)).toBe(false);
    expect(isAdminEmail(null)).toBe(false);
    expect(isAdminEmail(undefined)).toBe(false);
    expect(isAdminEmail("")).toBe(false);
  });

  it("admins are implicitly employees (privilege inheritance)", () => {
    expect(isEmployeeEmail(EMPLOYEE)).toBe(true);
    expect(isEmployeeEmail(ADMIN)).toBe(true); // admin ⊆ employee
    expect(isEmployeeEmail(OUTSIDER)).toBe(false);
  });

  it("admins are implicitly finance users, plus the finance allowlist", () => {
    expect(isFinanceEmail(FINANCE)).toBe(true);
    expect(isFinanceEmail(ADMIN)).toBe(true); // admin ⊆ finance
    expect(isFinanceEmail(EMPLOYEE)).toBe(false); // plain employee is NOT finance
    expect(isFinanceEmail(OUTSIDER)).toBe(false);
  });

  it("denies everyone when the allowlists are empty", () => {
    delete process.env.ADMIN_EMAILS;
    delete process.env.EMPLOYEE_EMAILS;
    delete process.env.FINANCE_MANAGER_EMAILS;
    expect(isAdminEmail(ADMIN)).toBe(false);
    expect(isEmployeeEmail(EMPLOYEE)).toBe(false);
    expect(isFinanceEmail(FINANCE)).toBe(false);
  });
});

describe("isVerifiedIdentity — privileged access fails safe", () => {
  it("grants only when emailVerified is exactly true", () => {
    expect(isVerifiedIdentity({ emailVerified: true })).toBe(true);
  });

  it("denies unverified / unknown identities", () => {
    expect(isVerifiedIdentity({ emailVerified: false })).toBe(false);
    expect(isVerifiedIdentity({ emailVerified: null })).toBe(false);
    expect(isVerifiedIdentity({})).toBe(false);
    expect(isVerifiedIdentity(null)).toBe(false);
    expect(isVerifiedIdentity(undefined)).toBe(false);
  });
});
