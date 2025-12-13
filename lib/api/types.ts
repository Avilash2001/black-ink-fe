import { ActionType } from "@/app/adventure/[id]/page";

export interface TurnRequest {
  action: ActionType;
  text: string;
  timelineEndToken: number;
}

export interface TurnResponse {
  paragraphs: string[];
}
