"use client";

/**
 * Better Auth React client for AgencyOS (browser-side).
 * Defaults to the current origin, so it works in every environment without a
 * hard-coded base URL.
 */

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});

export const { signIn, signUp, signOut, useSession } = authClient;
