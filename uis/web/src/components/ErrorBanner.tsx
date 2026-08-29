"use client";

import Link from "next/link";

type ErrorBannerProps = {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  homeHref?: string;
  homeLabel?: string;
};

export function ErrorBanner({
  message,
  onRetry,
  retryLabel = "Try again",
  homeHref,
  homeLabel = "Back to home",
}: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
    >
      <p>{message}</p>
      {onRetry || homeHref ? (
        <div className="mt-2 flex flex-wrap gap-4">
          {onRetry ? (
            <button type="button" onClick={onRetry} className="font-semibold underline">
              {retryLabel}
            </button>
          ) : null}
          {homeHref ? (
            <Link href={homeHref} className="font-semibold underline">
              {homeLabel}
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
