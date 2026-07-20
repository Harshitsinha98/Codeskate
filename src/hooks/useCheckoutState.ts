"use client";

/**
 * Checkout state persistence — survives a page refresh via sessionStorage.
 * Real, working state management for this sprint (no backend/database):
 * the whole `CheckoutState` is serialized on every change and rehydrated on
 * mount. sessionStorage (not localStorage) is deliberate — checkout progress
 * should not silently persist across browser sessions/days.
 *
 * Implemented as a tiny external store (`useSyncExternalStore`) rather than
 * `useState` + a rehydrating `useEffect`: React's own guidance is that
 * synchronizing with a browser API like sessionStorage is exactly what
 * `useSyncExternalStore` is for — it handles the server/first-client-render
 * snapshot correctly (avoiding a hydration mismatch) and lets the "real"
 * value take over immediately after mount, with no setState-in-effect.
 */

import { useCallback, useSyncExternalStore } from "react";
import type { CheckoutState } from "@/types/checkout";
import { CHECKOUT_STEPS, CHECKOUT_STORAGE_KEY } from "@/constants/checkout";

export function emptyCheckoutState(): CheckoutState {
  return {
    currentStep: CHECKOUT_STEPS.PACKAGE,
    selection: { serviceSlug: null, packageId: null, addonIds: [] },
    billing: {
      name: "",
      email: "",
      phone: "",
      company: "",
      gstNumber: "",
      country: "",
      state: "",
      city: "",
      address: "",
    },
    requirements: {
      projectName: "",
      businessDescription: "",
      goals: "",
      targetAudience: "",
      timeline: "",
      budget: "",
      additionalNotes: "",
      files: [],
    },
    couponCode: "",
    appliedCoupon: null,
    updatedAt: new Date(0).toISOString(),
  };
}

export type SavingStatus = "idle" | "saving" | "saved";

// A single stable "empty" reference used for every server/first-client render,
// so useSyncExternalStore never sees a spurious mismatch before hydration.
const SERVER_STATE_SNAPSHOT = emptyCheckoutState();

// Module-scoped store: one checkout in progress per tab, shared by every
// component instance that calls the hook (no prop-drilling / context needed).
let cachedState: CheckoutState | null = null;
let cachedSavingStatus: SavingStatus = "idle";
let saveTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readPersisted(): CheckoutState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(CHECKOUT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CheckoutState) : null;
  } catch {
    return null;
  }
}

function writePersisted(state: CheckoutState) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // sessionStorage unavailable (private mode / quota) — checkout still
    // works in-memory for the current page load, it just won't survive refresh.
  }
}

/** Lazily reads sessionStorage on first client access, then caches. */
function getStateSnapshot(): CheckoutState {
  if (cachedState === null) {
    cachedState = readPersisted() ?? emptyCheckoutState();
  }
  return cachedState;
}

function getServerStateSnapshot(): CheckoutState {
  return SERVER_STATE_SNAPSHOT;
}

function getSavingSnapshot(): SavingStatus {
  return cachedSavingStatus;
}

function getServerSavingSnapshot(): SavingStatus {
  return "idle";
}

const getHydratedSnapshot = () => true;
const getServerHydratedSnapshot = () => false;

function updateState(patch: Partial<CheckoutState>) {
  const prev = getStateSnapshot();
  cachedState = { ...prev, ...patch, updatedAt: new Date().toISOString() };
  cachedSavingStatus = "saving";
  emitChange();

  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    writePersisted(cachedState as CheckoutState);
    cachedSavingStatus = "saved";
    emitChange();
  }, 300);
}

function resetState() {
  cachedState = emptyCheckoutState();
  cachedSavingStatus = "idle";
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);
  }
  emitChange();
}

/**
 * Hook exposing the persisted checkout state plus a shallow `update` setter.
 * `hydrated` is false during SSR / the first client render (before
 * sessionStorage has been consulted) so consumers can avoid a flash of the
 * wrong content; it flips to true immediately once mounted.
 */
export function useCheckoutState() {
  const state = useSyncExternalStore(
    subscribe,
    getStateSnapshot,
    getServerStateSnapshot
  );
  const savingStatus = useSyncExternalStore(
    subscribe,
    getSavingSnapshot,
    getServerSavingSnapshot
  );
  const hydrated = useSyncExternalStore(
    subscribe,
    getHydratedSnapshot,
    getServerHydratedSnapshot
  );

  const update = useCallback((patch: Partial<CheckoutState>) => {
    updateState(patch);
  }, []);

  const reset = useCallback(() => {
    resetState();
  }, []);

  return { state, update, reset, hydrated, savingStatus };
}
