import { clearSession } from "../storage";
import { api } from "./client";

export async function login(email: string) {
  return api<{ userId: string; email: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function logout() {
  clearSession()
  window.location.href = "/login";
}
