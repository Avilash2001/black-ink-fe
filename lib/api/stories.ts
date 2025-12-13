import { ActionType } from "@/app/adventure/[id]/page";
import { api } from "./client";
import type { Story } from "@/types/story";

export async function createStory(input: {
  genre: string;
  protagonist: string;
  matureEnabled: boolean;
}) {
  return api<{
    storyId: string;
    openingParagraphs: string[];
  }>("/stories", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getStory(storyId: string) {
  return api<Story>(`/stories/${storyId}`);
}

export async function submitTurn(
  storyId: string,
  input: {
    action: ActionType;
    text: string;
    rewindToken: number;
  }
) {
  return api<{
    paragraphs: string[];
    tokenStart: number;
    tokenEnd: number;
  }>(`/stories/${storyId}/turn`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}
