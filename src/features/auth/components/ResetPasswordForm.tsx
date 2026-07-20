"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/**
 * Set a new password from a reset link. The token arrives as a `?token=` query
 * param (Better Auth). Invalid/missing token is handled gracefully.
 */
export function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-6 text-center">
        <h2 className="font-display text-xl text-ink">Invalid reset link</h2>
        <p className="mt-2 text-sm text-ink-muted">
          This link is missing or expired. Request a new one.
        </p>
        <Link href="/forgot-password" className="mt-4 inline-block text-sm text-ink hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await authClient.resetPassword({ newPassword: password, token: token as string });
    setLoading(false);
    if (error) {
      setError(error.message ?? "Unable to reset password.");
      return;
    }
    router.push("/login");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-soft">New password</span>
        <input
          type="password"
          required
          value={password}
          autoComplete="new-password"
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          className={cn(
            "w-full rounded-2xl border border-line bg-base/50 px-4 py-3 text-sm text-ink",
            "placeholder:text-ink-faint transition-colors focus:border-royal/40 focus:bg-surface focus:outline-none"
          )}
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
