"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ApiValidationError } from "@/lib/apiClient";
import { registerRequest } from "@/lib/authApi";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ field: string; message: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors([]);
    try {
      await registerRequest({
        email,
        password,
        name: name.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
      });
      router.replace("/");
    } catch (err) {
      if (err instanceof ApiValidationError) {
        setError(err.message);
        setFieldErrors(err.errors);
      } else {
        setError(err instanceof Error ? err.message : "Registration failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">HealthCore Digital</p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">Register</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        {fieldErrors.length > 0 ? (
          <ul className="list-disc pl-5 text-sm text-red-700">
            {fieldErrors.map((err) => (
              <li key={`${err.field}-${err.message}`}>
                {err.field}: {err.message}
              </li>
            ))}
          </ul>
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
        <label className="block text-sm font-medium text-slate-700">
          Name (optional)
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Phone (optional)
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Address (optional)
          <textarea
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-50"
        >
          {submitting ? "Creating account…" : "Register"}
        </button>
        <p className="text-sm text-slate-600">
          Already have an account?{" "}
          <Link className="font-semibold text-sky-800 hover:underline" href="/login">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
