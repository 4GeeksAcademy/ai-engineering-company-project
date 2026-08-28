"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { forgotPassword } from "@/lib/authApi";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await forgotPassword(email);
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">HealthCore Digital</p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">Forgot password</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {done ? (
          <p className="text-sm text-slate-700">
            If that address is registered, you&apos;ll receive a link shortly.
          </p>
        ) : (
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
        )}
        <button
          type="submit"
          disabled={submitting || done}
          className="w-full rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-50"
        >
          {done ? "Request sent" : submitting ? "Sending…" : "Send reset link"}
        </button>
        <Link className="block text-center text-sm font-semibold text-sky-800 hover:underline" href="/login">
          Back to sign in
        </Link>
      </form>
    </div>
  );
}
