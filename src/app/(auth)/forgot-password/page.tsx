import type { Metadata } from "next";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { ForgotPasswordForm } from "@/features/auth";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  const emailEnabled = Boolean(process.env.RESEND_API_KEY);

  return (
    <AuthCard title="Reset your password" subtitle="We’ll email you a reset link">
      <ForgotPasswordForm emailEnabled={emailEnabled} />
    </AuthCard>
  );
}
