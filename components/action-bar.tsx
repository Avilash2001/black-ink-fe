"use client";

import { Button } from "@/components/ui/button";
import { ActionType } from "@/app/adventure/[id]/page";

const ACTIONS: ActionType[] = ["DO", "SAY", "STORY", "SEE"];

export default function ActionBar({
  onAction,
  focusMode,
  disabled,
}: {
  onAction: (action: ActionType) => void;
  focusMode: boolean;
  disabled?: boolean;
}) {
  return (
    <div
      className={[
        "fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-2 bg-neutral-900/90 backdrop-blur border border-neutral-800 rounded-xl p-2 transition-opacity",
        focusMode ? "opacity-0 pointer-events-none" : "opacity-100",
      ].join(" ")}
    >
      {ACTIONS.map((a) => (
        <Button
          key={a}
          variant="secondary"
          disabled={disabled}
          onClick={() => onAction(a)}
        >
          {a}
        </Button>
      ))}
    </div>
  );
}
