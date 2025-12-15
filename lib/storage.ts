export type Session = {
  id: string;
  name: string;
  email: string;
};

const KEY = "black-ink-session";

export function setSession(session: Session) {
  localStorage.setItem(KEY, JSON.stringify(session));
}

export function getSession(): Session | null {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearSession() {
  localStorage.removeItem(KEY);
}
