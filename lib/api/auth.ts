import { api } from "./client";

export async function login(email: string, password: string) {
  return api<{
    id: string;
    name: string;
    email: string;
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
  }>("/auth/me");
}
