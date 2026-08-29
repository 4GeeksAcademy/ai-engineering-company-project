"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ErrorBanner } from "@/components/ErrorBanner";
import { ApiHttpError, clearAccessToken, getAccessToken, toUserMessage } from "@/lib/apiClient";
import { fetchMe, type MeResponse } from "@/lib/authApi";

type AuthContextValue = {
  user: MeResponse | null;
  loading: boolean;
  sessionError: string | null;
  refresh: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    if (!getAccessToken()) {
      setUser(null);
      setSessionError(null);
      setLoading(false);
      return;
    }
    try {
      const me = await fetchMe();
      setUser(me);
      setSessionError(null);
    } catch (err) {
      if (err instanceof ApiHttpError && err.status === 401) {
        setUser(null);
        clearAccessToken();
        setSessionError(null);
      } else {
        setSessionError(toUserMessage(err));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh, pathname]);

  const logout = useCallback(() => {
    clearAccessToken();
    setUser(null);
    setSessionError(null);
    router.replace("/login");
  }, [router]);

  const value = useMemo(
    () => ({ user, loading, sessionError, refresh, logout }),
    [user, loading, sessionError, refresh, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, loading, sessionError, refresh } = useAuth();

  useEffect(() => {
    if (!loading && !user && !sessionError) {
      router.replace("/login");
    }
  }, [loading, user, sessionError, router]);

  if (loading) {
    return <p className="p-8 text-sm text-slate-600">Checking your session…</p>;
  }
  if (sessionError) {
    return (
      <div className="mx-auto max-w-md p-8">
        <ErrorBanner
          message={sessionError}
          onRetry={() => {
            void refresh();
          }}
          homeHref="/login"
          homeLabel="Back to sign in"
        />
      </div>
    );
  }
  if (!user) {
    return (
      <p className="p-8 text-sm text-slate-600">
        Redirecting to sign in…{" "}
        <Link className="font-semibold text-sky-800 underline" href="/login">
          Go to sign in
        </Link>
      </p>
    );
  }
  return <>{children}</>;
}
