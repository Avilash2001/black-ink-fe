import { ActionType } from "@/app/adventure/[id]/page";
import { api } from "./client";
import type { Story, StoryListItem } from "@/types/story";

export async function createStory(input: {
  genre: string;
  protagonist: string;
  gender: string;
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
    rewindToken?: number;
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

export function getMyStories() {
  return api<StoryListItem[]>("/stories/me");
}

export function deleteStory(storyId: string) {
  return api<{ success: boolean }>(`/stories/${storyId}`, {
    method: "DELETE",
  });
}
