/**
 * Better Auth server instance for AgencyOS.
 *
 * Email + password is ALWAYS on. Google login and email flows (verification +
 * password reset) are ENV-GATED: they wire in only when their env vars exist, so
 * the app compiles, builds, and runs without them — and auto-enables them the
 * moment the keys are present. Server-only.
 */

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { isEmailEnabled, sendEmail } from "@/lib/email";

/** Feature availability, resolved once from the environment. */
export const authFlags = {
  emailEnabled: isEmailEnabled(),
  googleEnabled: Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  ),
} as const;

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  // Harden session cookies for production. In production the app is served over
  // HTTPS, so cookies are marked Secure and use the `__Secure-` prefix; SameSite
  // stays `lax` so top-level OAuth redirects still deliver the cookie. Over plain
  // HTTP in development the Secure flag is dropped so local login keeps working.
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    defaultCookieAttributes: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  },

  emailAndPassword: {
    enabled: true,
    // Only require verification when we can actually send email.
    requireEmailVerification: authFlags.emailEnabled,
    // Password reset is wired only when email is available.
    ...(authFlags.emailEnabled
      ? {
          sendResetPassword: async ({
            user,
            url,
          }: {
            user: { email: string };
            url: string;
          }) => {
            await sendEmail({
              to: user.email,
              subject: "Reset your AgencyOS password",
              html: `<p>Reset your password by clicking the link below:</p><p><a href="${url}">Reset password</a></p>`,
            });
          },
        }
      : {}),
  },

  // Email verification is wired only when email is available.
  ...(authFlags.emailEnabled
    ? {
        emailVerification: {
          sendOnSignUp: true,
          sendVerificationEmail: async ({
            user,
            url,
          }: {
            user: { email: string };
            url: string;
          }) => {
            await sendEmail({
              to: user.email,
              subject: "Verify your AgencyOS email",
              html: `<p>Confirm your email by clicking the link below:</p><p><a href="${url}">Verify email</a></p>`,
            });
          },
        },
      }
    : {}),

  // Google is wired only when both credentials are present.
  ...(authFlags.googleEnabled
    ? {
        socialProviders: {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
          },
        },
      }
    : {}),
});

export type Auth = typeof auth;
