import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { LoginForm } from "@/features/auth";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  // Env-gated flags resolved on the server; unavailable providers are hidden.
  const googleEnabled = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  );
  const emailEnabled = Boolean(process.env.RESEND_API_KEY);

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to your AgencyOS workspace">
      <Suspense fallback={null}>
        <LoginForm googleEnabled={googleEnabled} emailEnabled={emailEnabled} />
      </Suspense>
    </AuthCard>
  );
}
