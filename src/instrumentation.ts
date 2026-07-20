/**
 * Next.js instrumentation hook — runs once when the server process starts.
 * Wires in startup environment validation and graceful-shutdown handlers.
 *
 * See: https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation
 */

export async function register(): Promise<void> {
  // Only run on the Node.js server runtime (not edge / browser bundles).
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { runStartupChecks } = await import("@/lib/startup");
  const { registerShutdownHandlers } = await import("@/lib/shutdown");

  runStartupChecks();
  registerShutdownHandlers();
}
