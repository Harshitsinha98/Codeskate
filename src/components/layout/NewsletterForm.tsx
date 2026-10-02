"use client";

import { ArrowRight, Check } from "lucide-react";
import { useState } from "react";

/** Footer newsletter capture — client-side only (no backend wired). */
export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setDone(true);
    setEmail("");
    setTimeout(() => setDone(false), 3500);
  };

  return (
    <form onSubmit={submit} className="w-full max-w-xs">
      <label className="font-mono text-[0.7rem] uppercase tracking-wider text-white/40">
        The CodeSkate dispatch — monthly, no fluff.
      </label>
      <div className="mt-2 flex items-center rounded-full border border-white/10 bg-white/[0.04] p-1 pl-4 transition-colors focus-within:border-royal/50">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="w-full bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
          aria-label="Email address"
        />
        <button
          type="submit"
          aria-label="Subscribe"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-royal text-white transition-colors hover:bg-royal-600"
        >
          {done ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
        </button>
      </div>
      {done && (
        <p className="mt-2 text-xs text-emerald-400">You&apos;re in. Watch your inbox.</p>
      )}
    </form>
  );
}
