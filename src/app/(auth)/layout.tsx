import type { ReactNode } from "react";

/**
 * Auth route-group layout — a minimal centered shell for /login, /register,
 * /forgot-password, /reset-password. Nests inside the root layout; does not
 * affect any marketing route.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mesh-hero flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-16">
      {children}
    </div>
  );
}
