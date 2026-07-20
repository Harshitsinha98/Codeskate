"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/**
 * Request a password-reset link. Only rendered when email is enabled (the server
 * page gates this); if reached while disabled it shows a graceful message.
 */
export function ForgotPasswordForm({ emailEnabled }: { emailEnabled: boolean }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  if (!emailEnabled) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-6 text-center">
        <h2 className="font-display text-xl text-ink">Password reset unavailable</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Email delivery isn’t configured yet. Please contact your administrator.
        </p>
        <Link href="/login" className="mt-4 inline-block text-sm text-ink hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });
    setLoading(false);
    if (error) {
      setError(error.message ?? "Unable to send reset link.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-6 text-center">
        <h2 className="font-display text-xl text-ink">Check your inbox</h2>
        <p className="mt-2 text-sm text-ink-muted">
          If an account exists for <strong>{email}</strong>, a reset link is on its way.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-soft">Work email</span>
        <input
          type="email"
          required
          value={email}
          autoComplete="email"
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jane@company.com"
          className={cn(
            "w-full rounded-2xl border border-line bg-base/50 px-4 py-3 text-sm text-ink",
            "placeholder:text-ink-faint transition-colors focus:border-royal/40 focus:bg-surface focus:outline-none"
          )}
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Sending…" : "Send reset link"}
      </Button>

      <p className="text-center text-sm text-ink-muted">
        <Link href="/login" className="text-ink hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
