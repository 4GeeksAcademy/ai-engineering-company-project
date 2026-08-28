"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useAuth } from "@/components/AuthProvider";

const nav = [
  { href: "/", label: "Welcome" },
  { href: "/operations", label: "Operations analytics" },
  { href: "/incidents", label: "Incident analysis" },
  { href: "/suppliers", label: "Supplier directory" },
  { href: "/account/profile", label: "Profile" },
  { href: "/account/change-password", label: "Change password" },
];

export function BackofficeShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const displayName = user?.profile.name || user?.email || "Signed in";

  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <aside className="border-b border-slate-800 bg-slate-950 text-slate-100 md:border-b-0 md:border-r">
        <div className="px-5 py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">
            Internal
          </p>
          <h1 className="mt-2 text-xl font-semibold">HealthCore Digital</h1>
          <p className="mt-2 text-sm text-slate-400">
            Operations console for clinic network insights
          </p>
        </div>
        <nav className="flex gap-2 px-3 pb-4 md:flex-col" aria-label="Backoffice">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-h-screen">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-6 py-4">
          <p className="text-sm text-slate-500">HealthCore Digital · Backoffice</p>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-600">
              {displayName}
              {user ? <span className="text-slate-400"> · {user.role}</span> : null}
            </span>
            <button
              type="button"
              onClick={logout}
              className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Sign out
            </button>
          </div>
        </header>
        <main className="px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
