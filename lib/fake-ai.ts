import { ActionType } from "@/app/adventure/[id]/page";

const ACTION_TEMPLATES: Record<ActionType, (input: string) => string[]> = {
  SYSTEM: (input) => [
    `System directive received: ${input}. The environment shifts accordingly.`,
    `The underlying mechanics adjust to the new parameters set by the system.`,
  ],
  DO: (input) => [
    `You decide to ${input}. The air feels heavier as you move.`,
    `Something unseen reacts to your action, shifting the balance of the moment.`,
  ],
  SAY: (input) => [
    `"${input}," you say, your voice breaking the silence.`,
    `The words linger, and the world seems to listen.`,
  ],
  STORY: (input) => [
    `The narrative bends. ${input}`,
    `Reality adjusts itself, accepting the change.`,
  ],
  SEE: (input) => [
    `You focus your attention on ${input}. Details emerge slowly.`,
    `What you notice changes how you understand the situation.`,
  ],
};

export function generateFakeTurn(action: ActionType, text: string): string[] {
  const generator = ACTION_TEMPLATES[action];
  return generator(text);
}
