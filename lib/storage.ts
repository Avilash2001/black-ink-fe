export type Session = {
  id: string;
  name: string;
  email: string;
  matureEnabled: boolean;
  theme: 'dark' | 'light';
  dateOfBirth: string | null; // "YYYY-MM-DD", permanent once set
};

const KEY = "black-ink-session";

function isBrowser() {
  return typeof window !== "undefined";
}

export function setSession(session: Session) {
  if (!isBrowser()) return;
  localStorage.setItem(KEY, JSON.stringify(session));
}

export function getSession(): Session | null {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(KEY);
  return raw ? { matureEnabled: false, dateOfBirth: null, theme: 'dark', ...JSON.parse(raw) } : null;
}

export function clearSession() {
  if (!isBrowser()) return;
  localStorage.removeItem(KEY);
}
