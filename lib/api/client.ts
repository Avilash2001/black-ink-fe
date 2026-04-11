const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://black-ink-be-production.up.railway.app";

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  const text = await res.text();
  return text ? JSON.parse(text) : (undefined as T);
}
