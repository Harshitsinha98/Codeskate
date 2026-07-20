"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/**
 * Email + password sign-in. The "Continue with Google" button and the "Forgot
 * password" link render ONLY when their features are enabled (env-gated flags
 * passed from the server page) — unavailable providers are hidden gracefully.
 */
export function LoginForm({
  googleEnabled,
  emailEnabled,
}: {
  googleEnabled: boolean;
  emailEnabled: boolean;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get("redirect") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await authClient.signIn.email({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message ?? "Unable to sign in. Check your details.");
      return;
    }
    router.push(redirectTo);
    router.refresh();
  }

  async function onGoogle() {
    await authClient.signIn.social({ provider: "google", callbackURL: redirectTo });
  }

  return (
    <div className="space-y-5">
      {googleEnabled && (
        <>
          <button
            type="button"
            onClick={onGoogle}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-line bg-surface px-6 py-3 text-sm font-medium text-ink transition-colors hover:border-ink/20"
          >
            Continue with Google
          </button>
          <div className="flex items-center gap-3 text-xs text-ink-faint">
            <span className="h-px flex-1 bg-line" />
            or
            <span className="h-px flex-1 bg-line" />
          </div>
        </>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <Field
          label="Work email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="jane@company.com"
          autoComplete="email"
        />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          autoComplete="current-password"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="flex items-center justify-between text-sm text-ink-muted">
        {emailEnabled ? (
          <Link href="/forgot-password" className="hover:text-ink">
            Forgot password?
          </Link>
        ) : (
          <span />
        )}
        <Link href="/register" className="hover:text-ink">
          Create an account
        </Link>
      </div>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-soft">{label}</span>
      <input
        type={type}
        required
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-2xl border border-line bg-base/50 px-4 py-3 text-sm text-ink",
          "placeholder:text-ink-faint transition-colors focus:border-royal/40 focus:bg-surface focus:outline-none"
        )}
      />
    </label>
  );
}
