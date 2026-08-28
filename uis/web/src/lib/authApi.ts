import { apiFetch, parseError, setAccessToken } from "@/lib/apiClient";

export type Role = "admin" | "manager" | "user";

export type Profile = {
  id: number;
  user_id: number;
  name: string | null;
  phone: string | null;
  address: string | null;
};

export type MeResponse = {
  email: string;
  role: Role;
  profile: Profile;
};

export async function loginRequest(email: string, password: string): Promise<string> {
  const body = new URLSearchParams();
  body.set("username", email);
  body.set("password", password);
  const response = await apiFetch("/auth/login", {
    method: "POST",
    auth: false,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!response.ok) await parseError(response);
  const payload = (await response.json()) as { access_token: string };
  setAccessToken(payload.access_token);
  return payload.access_token;
}

export async function registerRequest(input: {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  address?: string;
}): Promise<void> {
  const response = await apiFetch("/users", {
    method: "POST",
    auth: false,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) await parseError(response);
  await loginRequest(input.email, input.password);
}

export async function fetchMe(): Promise<MeResponse> {
  const response = await apiFetch("/auth/me");
  if (!response.ok) await parseError(response);
  return response.json();
}

export async function updateMyProfile(input: {
  name?: string | null;
  phone?: string | null;
  address?: string | null;
}): Promise<Profile> {
  const response = await apiFetch("/profiles/me", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) await parseError(response);
  return response.json();
}

export async function forgotPassword(email: string): Promise<string> {
  const response = await apiFetch("/auth/forgot-password", {
    method: "POST",
    auth: false,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) await parseError(response);
  const payload = (await response.json()) as { detail: string };
  return payload.detail;
}

export async function resetPassword(token: string, new_password: string): Promise<void> {
  const response = await apiFetch("/auth/reset-password", {
    method: "POST",
    auth: false,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, new_password }),
  });
  if (!response.ok) await parseError(response);
}

export async function changePassword(
  current_password: string,
  new_password: string,
): Promise<void> {
  const response = await apiFetch("/auth/change-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ current_password, new_password }),
  });
  if (!response.ok) await parseError(response);
}
