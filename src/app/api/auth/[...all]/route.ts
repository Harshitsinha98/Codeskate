/**
 * Better Auth catch-all route handler.
 * Serves every auth endpoint under /api/auth/* (sign-in/up, session, OAuth
 * callbacks, verification, reset). Node runtime (Prisma is not edge-compatible).
 */

import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

export const { GET, POST } = toNextJsHandler(auth);
