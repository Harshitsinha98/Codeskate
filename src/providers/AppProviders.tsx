/**
 * AppProviders — composes all project-wide providers in one place.
 * PLACEHOLDER: every provider is currently a pass-through, so this wrapper is a
 * no-op that renders children unchanged.
 *
 * NOT wired into the root layout yet — intentionally, to keep the current
 * marketing site byte-identical. Wiring will be a separate, approved step once
 * a provider gains real behavior. Import order mirrors dependency direction.
 */

import type { ReactNode } from "react";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { SocketProvider } from "@/providers/SocketProvider";
import { AIProvider } from "@/providers/AIProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <SocketProvider>
            <AIProvider>{children}</AIProvider>
          </SocketProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
