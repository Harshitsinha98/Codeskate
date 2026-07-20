"use client";

/**
 * Global Error Boundary — the last-resort boundary that catches errors thrown in
 * the root layout itself (where the segment-level `error.tsx` boundaries under
 * /admin, /employee, /client cannot reach). It must render its own <html>/<body>
 * because it replaces the root layout, and it must avoid app providers/context.
 *
 * The digest is Next.js's server-generated error id; we surface it so a user can
 * quote it in a support request and it can be matched to a server log line.
 */

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Best-effort client-side breadcrumb; the real error is already logged
    // server-side with full context.
    console.error("[global-error]", error.digest ?? error.message);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
          background: "#0b0b0f",
          color: "#e7e7ea",
        }}
      >
        <div style={{ maxWidth: 420, padding: "40px 24px", textAlign: "center" }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 8px" }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: 14, color: "#9a9aa2", margin: "0 0 24px", lineHeight: 1.5 }}>
            An unexpected error occurred. Please try again — if it keeps happening, contact
            support.
          </p>
          {error.digest ? (
            <p style={{ fontSize: 12, color: "#6a6a72", margin: "0 0 24px" }}>
              Reference: <code>{error.digest}</code>
            </p>
          ) : null}
          <button
            onClick={reset}
            style={{
              cursor: "pointer",
              border: "1px solid #2a2a32",
              background: "#16161c",
              color: "#e7e7ea",
              fontSize: 14,
              borderRadius: 12,
              padding: "10px 20px",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
