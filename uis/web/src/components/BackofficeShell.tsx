import Link from "next/link";
import type { ReactNode } from "react";

const nav = [
  { href: "/", label: "Welcome" },
  { href: "/operations", label: "Operations analytics" },
  { href: "/incidents", label: "Incident analysis" },
];

export function BackofficeShell({ children }: { children: ReactNode }) {
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
        <header className="border-b border-slate-200 bg-white px-6 py-4">
          <p className="text-sm text-slate-500">HealthCore Digital · Backoffice</p>
        </header>
        <main className="px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
