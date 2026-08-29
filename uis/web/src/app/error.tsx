"use client";

import Link from "next/link";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
        HealthCore Digital
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">Something went wrong</h1>
      <p className="mt-3 text-sm text-slate-600">
        We could not load this page. You can try again or return to the home screen.
      </p>
      <div className="mt-6 flex flex-wrap gap-4">
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800"
        >
          Try again
        </button>
        <Link className="self-center text-sm font-semibold text-sky-800 hover:underline" href="/">
          Back to home
        </Link>
      </div>
    </div>
  );
}
