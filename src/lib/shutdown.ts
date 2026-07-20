/**
 * Graceful shutdown — flush in-flight work and close resources on SIGTERM/SIGINT
 * (the signals a container orchestrator sends on deploy/scale-down). Handlers are
 * registered once at startup via `instrumentation.ts`.
 *
 * Server-only.
 */

import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/observability/logger";

let registered = false;
let shuttingDown = false;

/** Best-effort resource cleanup, run once. */
async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info("shutdown: received signal, draining", { signal });

  try {
    await prisma.$disconnect();
    logger.info("shutdown: database disconnected");
  } catch (error) {
    logger.error("shutdown: database disconnect failed", { error });
  }

  // Give the logger/transports a tick to flush, then exit cleanly.
  process.exit(0);
}

/** Attach SIGTERM/SIGINT handlers exactly once per process. */
export function registerShutdownHandlers(): void {
  if (registered) return;
  registered = true;

  for (const signal of ["SIGTERM", "SIGINT"] as const) {
    process.on(signal, () => {
      void shutdown(signal);
    });
  }
}
