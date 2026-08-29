const TOKEN_KEY = "healthcore_access_token";
const DEFAULT_TIMEOUT_MS = 15_000;

export function apiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8000";
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
}

export type FieldError = { field: string; message: string };

export class ApiValidationError extends Error {
  errors: FieldError[];

  constructor(message: string, errors: FieldError[]) {
    super(message);
    this.errors = errors;
  }
}

export class ApiHttpError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export class ApiTimeoutError extends Error {
  constructor() {
    super("The request took too long. Please try again.");
    this.name = "ApiTimeoutError";
  }
}

function redirectToLogin(): void {
  clearAccessToken();
  if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
    window.location.href = "/login";
  }
}

export function messageForStatus(status: number): string {
  if (status === 400) return "The request could not be processed. Please check your input and try again.";
  if (status === 401) return "Please sign in again, or check your email and password.";
  if (status === 403) return "You do not have permission to do that.";
  if (status === 404) return "We could not find that resource.";
  if (status === 409) return "That record already exists.";
  if (status === 422) return "Please check the highlighted fields and try again.";
  if (status >= 500) return "Something went wrong on our side. Please try again.";
  return "Something went wrong. Please try again.";
}

export function toUserMessage(err: unknown): string {
  if (err instanceof ApiTimeoutError) return err.message;
  if (err instanceof ApiValidationError) return messageForStatus(422);
  if (err instanceof ApiHttpError) return messageForStatus(err.status);
  if (typeof DOMException !== "undefined" && err instanceof DOMException && err.name === "AbortError") {
    return "The request took too long. Please try again.";
  }
  if (err instanceof TypeError) {
    return "We could not reach the server. Check your connection and try again.";
  }
  return "Something went wrong. Please try again.";
}

function fieldErrorsFromPayload(payload: Record<string, unknown>): FieldError[] {
  if (Array.isArray(payload.errors)) {
    return payload.errors as FieldError[];
  }
  const detail = payload.detail;
  if (detail && typeof detail === "object" && Array.isArray((detail as { errors?: FieldError[] }).errors)) {
    return (detail as { errors: FieldError[] }).errors;
  }
  return [];
}

export async function parseError(response: Response): Promise<never> {
  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  const errors = fieldErrorsFromPayload(payload);
  if (response.status === 422 || errors.length > 0) {
    throw new ApiValidationError(messageForStatus(422), errors);
  }
  throw new ApiHttpError(messageForStatus(response.status), response.status);
}

export async function readJson<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiHttpError(messageForStatus(500), 500);
  }
}

type ApiFetchOptions = RequestInit & { auth?: boolean; redirectOn401?: boolean; timeoutMs?: number };

export async function apiFetch(path: string, options: ApiFetchOptions = {}): Promise<Response> {
  const { auth = true, redirectOn401 = true, timeoutMs = DEFAULT_TIMEOUT_MS, headers, signal, ...rest } = options;
  const nextHeaders = new Headers(headers);
  if (auth) {
    const token = getAccessToken();
    if (token) nextHeaders.set("Authorization", `Bearer ${token}`);
  }

  const controller = new AbortController();
  const onAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", onAbort, { once: true });
  }
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${apiBaseUrl()}${path}`, {
      ...rest,
      headers: nextHeaders,
      signal: controller.signal,
    });
    if (auth && redirectOn401 && response.status === 401) {
      redirectToLogin();
    }
    return response;
  } catch (err) {
    if (err instanceof ApiTimeoutError) throw err;
    if (typeof DOMException !== "undefined" && err instanceof DOMException && err.name === "AbortError") {
      throw new ApiTimeoutError();
    }
    throw err;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }
}
