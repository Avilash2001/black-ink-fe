export interface Session {
  userId: string;
  email: string;
}

export interface AdventureMeta {
  id: string;
  genre: string;
  name: string;
  updatedAt: number;
}

const SESSION_KEY = "ai-session";
const ADVENTURES_KEY = "ai-adventures";

/* Session */
export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setSession(session: Session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

/* Adventures */
export function getAdventures(): AdventureMeta[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(ADVENTURES_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveAdventure(meta: AdventureMeta) {
  const all = getAdventures().filter((a) => a.id !== meta.id);
  localStorage.setItem(ADVENTURES_KEY, JSON.stringify([meta, ...all]));
}
