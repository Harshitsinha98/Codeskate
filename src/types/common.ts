/**
 * Shared primitive & cross-cutting types for AgencyOS.
 * Placeholder foundation — interfaces only, no runtime code.
 * Aligned with docs/DATABASE.md global conventions (UUID ids, tenant scoping,
 * timestamps, soft delete) and docs/BACKEND.md API envelope (§3.1).
 */

/** UUID (v7) primary-key identifier. */
export type ID = string;

/** ISO-8601 timestamp string. */
export type ISODateString = string;

/** Every persisted record carries these audit timestamps. */
export interface Timestamps {
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/** Soft-delete marker (null = active). */
export interface SoftDeletable {
  deletedAt: ISODateString | null;
}

/** Multi-tenant scoping — present on every tenant-owned record. */
export interface TenantScoped {
  organizationId: ID;
}

/** Base shape composed by most domain entities. */
export interface BaseEntity extends Timestamps, SoftDeletable, TenantScoped {
  id: ID;
}

/** Money is stored as integer minor units + currency (never float). */
export interface Money {
  amountMinor: number;
  currency: string;
}

/** Standard success envelope returned by the API. */
export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

/** Standard error envelope. */
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
    traceId?: string;
  };
}

/** Cursor-based pagination result. */
export interface Paginated<T> {
  data: T[];
  meta: {
    nextCursor: string | null;
    hasMore: boolean;
    total?: number;
  };
}
