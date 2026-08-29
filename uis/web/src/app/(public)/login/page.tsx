"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { toUserMessage } from "@/lib/apiClient";
import { loginRequest } from "@/lib/authApi";
import { ErrorBanner } from "@/components/ErrorBanner";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const resetOk = params.get("reset") === "1";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await loginRequest(email, password);
      router.replace("/");
    } catch (err) {
      setError(toUserMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">HealthCore Digital</p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">Sign in</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {resetOk ? <p className="text-sm text-emerald-700">Password updated. Sign in with your new password.</p> : null}
        {error ? (
          <ErrorBanner
            message={error}
            onRetry={() => setError(null)}
            homeHref="/forgot-password"
            homeLabel="Forgot your password?"
          />
        ) : null}
        <label className="block text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Password
          <input
            type="password"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-50"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
        <p className="text-sm text-slate-600">
          <Link className="font-semibold text-sky-800 hover:underline" href="/forgot-password">
            Forgot your password?
          </Link>
        </p>
        <p className="text-sm text-slate-600">
          Need an account?{" "}
          <Link className="font-semibold text-sky-800 hover:underline" href="/register">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-slate-600">Loading…</p>}>
      <LoginForm />
    </Suspense>
  );
}
