const TOKEN_KEY = "healthcore_access_token";

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

function redirectToLogin(): void {
  clearAccessToken();
  if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
    window.location.href = "/login";
  }
}

export async function parseError(response: Response): Promise<never> {
  const payload = await response.json().catch(() => ({}));
  const errors: FieldError[] = Array.isArray(payload.errors)
    ? payload.errors
    : Array.isArray(payload.detail?.errors)
      ? payload.detail.errors
      : [];

  if (response.status === 422 || errors.length > 0) {
    const message =
      typeof payload.detail === "string"
        ? payload.detail
        : payload.detail?.detail || "Validation failed";
    throw new ApiValidationError(message, errors);
  }

  const detail =
    typeof payload.detail === "string"
      ? payload.detail
      : "Request failed. Please try again.";
  throw new ApiHttpError(detail, response.status);
}

type ApiFetchOptions = RequestInit & { auth?: boolean };

export async function apiFetch(path: string, options: ApiFetchOptions = {}): Promise<Response> {
  const { auth = true, headers, ...rest } = options;
  const nextHeaders = new Headers(headers);
  if (auth) {
    const token = getAccessToken();
    if (token) nextHeaders.set("Authorization", `Bearer ${token}`);
  }
  const response = await fetch(`${apiBaseUrl()}${path}`, { ...rest, headers: nextHeaders });
  if (auth && response.status === 401) {
    redirectToLogin();
  }
  return response;
}
