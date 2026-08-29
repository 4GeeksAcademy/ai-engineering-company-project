"use client";

import { AuthGuard, AuthProvider } from "@/components/AuthProvider";
import { BackofficeShell } from "@/components/BackofficeShell";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AuthGuard>
        <BackofficeShell>{children}</BackofficeShell>
      </AuthGuard>
    </AuthProvider>
  );
}
