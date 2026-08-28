"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { ApiHttpError, ApiValidationError } from "@/lib/apiClient";
import { resetPassword } from "@/lib/authApi";

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (newPassword !== confirm) {
      setError("New password and confirmation must match.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await resetPassword(token, newPassword);
      router.replace("/login?reset=1");
    } catch (err) {
      setError(err instanceof ApiHttpError || err instanceof ApiValidationError || err instanceof Error
        ? err.message
        : "Reset failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">HealthCore Digital</p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">Reset password</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {error ? (
          <p className="text-sm text-red-700">
            {error}{" "}
            <Link className="font-semibold underline" href="/forgot-password">
              Request a new link
            </Link>
          </p>
        ) : null}
        {!token ? (
          <p className="text-sm text-red-700">
            Missing reset token.{" "}
            <Link className="font-semibold underline" href="/forgot-password">
              Request a new link
            </Link>
          </p>
        ) : null}
        <label className="block text-sm font-medium text-slate-700">
          New password
          <input
            type="password"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Confirm new password
          <input
            type="password"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </label>
        <button
          type="submit"
          disabled={submitting || !token}
          className="w-full rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-50"
        >
          {submitting ? "Updating…" : "Set new password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-slate-600">Loading…</p>}>
      <ResetForm />
    </Suspense>
  );
}
