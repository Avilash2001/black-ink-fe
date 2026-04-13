import { api } from "./client";

export interface MurdleSuspect {
  name: string;
  description: string;
  color: string;
}

export interface MurdleItem {
  name: string;
  description: string;
}

export interface MurdleStatement {
  suspect: string;
  text: string;
}

export interface MurdleAssignment {
  suspect: string;
  weapon: string;
  location: string;
  motive: string;
}

export interface MurdleSolution {
  murderer: string;
  assignments: MurdleAssignment[];
}

export interface MurdleGame {
  _id: string;
  title: string;
  intro: string;
  suspects: MurdleSuspect[];
  weapons: MurdleItem[];
  locations: MurdleItem[];
  motives: MurdleItem[];
  clues: string[];
  statements: MurdleStatement[];
  solution?: MurdleSolution; // only present when solved or givenUp
  solved: boolean;
  givenUp: boolean;
  playerGrid: Record<string, string>;
  playerAccusation: {
    who: string;
    how: string;
    where: string;
    why: string;
  } | null;
  createdAt: string;
  solvedAt?: string;
  givenUpAt?: string;
  // Hints
  hintsReady: boolean;
  revealedHints: string[];          // up to 3 revealed hint texts
  hintsRevealedAt: string[];        // ISO timestamps of each reveal
  hintsAvailableAt: (string | null)[]; // ISO timestamps when each hint unlocks
}

export interface MysteryListItem {
  _id: string;
  title: string;
  intro: string;
  solved: boolean;
  givenUp: boolean;
  createdAt: string;
  solvedAt?: string;
  givenUpAt?: string;
}

export function generateMurdle(): Promise<{ gameId: string }> {
  return api<{ gameId: string }>("/whodunit", { method: "POST" });
}

export function getMyMysteries(): Promise<MysteryListItem[]> {
  return api<MysteryListItem[]>("/whodunit/me");
}

export function getMurdle(id: string): Promise<MurdleGame> {
  return api<MurdleGame>(`/whodunit/${id}`);
}

export function accuseMurdle(
  id: string,
  accusation: { who: string; how: string; where: string; why: string }
): Promise<{ correct: boolean; solution?: MurdleSolution }> {
  return api<{ correct: boolean; solution?: MurdleSolution }>(
    `/whodunit/${id}/accuse`,
    {
      method: "POST",
      body: JSON.stringify(accusation),
    }
  );
}

export function giveUpMurdle(
  id: string
): Promise<{ solution: MurdleSolution }> {
  return api<{ solution: MurdleSolution }>(`/whodunit/${id}/give-up`, {
    method: "POST",
  });
}

export function updateMurdleGrid(
  id: string,
  grid: Record<string, string>
): Promise<void> {
  return api<void>(`/whodunit/${id}/grid`, {
    method: "PATCH",
    body: JSON.stringify({ grid }),
  });
}

export function revealMurdleHint(
  id: string,
  n: number
): Promise<{ hint: string }> {
  return api<{ hint: string }>(`/whodunit/${id}/hint/${n}`, { method: "POST" });
}

export function generateMurdleNarrative(
  id: string
): Promise<{ narrative: string }> {
  return api<{ narrative: string }>(`/whodunit/${id}/narrative`, {
    method: "POST",
  });
}
