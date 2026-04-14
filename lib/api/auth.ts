import { api } from "./client";

export async function login(email: string, password: string) {
  return api<{
    id: string;
    name: string;
    email: string;
    matureEnabled: boolean;
    theme: 'dark' | 'light';
    dateOfBirth: string | null;
  }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function register(name: string, email: string, password: string) {
  return api("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export async function logout() {
  await api("/auth/logout", { method: "POST" });
}

export async function getMe() {
  return api<{
    id: string;
    name: string;
    email: string;
    matureEnabled: boolean;
    theme: 'dark' | 'light';
    dateOfBirth: string | null;
  }>("/auth/me");
}

export async function updateMe(patch: { matureEnabled?: boolean; theme?: 'dark' | 'light' }) {
  return api<{
    id: string;
    name: string;
    email: string;
    matureEnabled: boolean;
    theme: 'dark' | 'light';
    dateOfBirth: string | null;
  }>("/auth/me", {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function updateProfile(patch: { name?: string; email?: string }) {
  return api<{
    id: string;
    name: string;
    email: string;
    matureEnabled: boolean;
    theme: 'dark' | 'light';
    dateOfBirth: string | null;
  }>("/auth/me/profile", {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function changePassword(currentPassword: string, newPassword: string) {
  return api<{ success: boolean }>("/auth/me/password", {
    method: "PATCH",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function setDateOfBirth(dateOfBirth: string) {
  return api<{
    id: string;
    name: string;
    email: string;
    matureEnabled: boolean;
    theme: 'dark' | 'light';
    dateOfBirth: string | null;
  }>("/auth/me/dob", {
    method: "POST",
    body: JSON.stringify({ dateOfBirth }),
  });
}
