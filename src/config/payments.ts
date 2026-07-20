/**
 * Payments configuration — client-safe (no secrets). Env-gated exactly like
 * `authFlags` in `@/lib/auth`: `enabled` reflects only the PUBLIC key, so this
 * file is safe to import from client components. The server-only secret
 * (RAZORPAY_KEY_SECRET) is read exclusively in `@/lib/payments/razorpay.ts`.
 */

const paymentsConfig = {
  defaultProvider: "razorpay" as const,
  providers: {
    razorpay: {
      enabled: Boolean(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID),
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
    },
    stripe: {
      enabled: Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
    },
  },
  currency: "INR",
};

export default paymentsConfig;
