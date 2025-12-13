import { TurnRequest, TurnResponse } from "./types";
import { generateFakeTurn } from "../fake-ai";

export async function submitTurn(
  req: TurnRequest,
): Promise<TurnResponse> {
  // simulate latency
  await new Promise((r) => setTimeout(r, 500));

  const paragraphs = generateFakeTurn(req.action, req.text);

  return { paragraphs };
}
