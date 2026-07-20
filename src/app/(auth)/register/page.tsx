import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { SignupForm } from "@/features/auth";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  const googleEnabled = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  );
  const emailEnabled = Boolean(process.env.RESEND_API_KEY);

  return (
    <AuthCard title="Create your account" subtitle="Start using AgencyOS">
      <Suspense fallback={null}>
        <SignupForm googleEnabled={googleEnabled} emailEnabled={emailEnabled} />
      </Suspense>
    </AuthCard>
  );
}
