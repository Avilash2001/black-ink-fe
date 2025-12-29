"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ActionType } from "@/app/adventure/[id]/page";

const LABELS: Record<ActionType, string> = {
  SYSTEM: "System Action",
  DO: "What do you do?",
  SAY: "What do you say?",
  STORY: "How do you change the story?",
  SEE: "What do you focus on?",
  CONTINUE: "Continue generating the story?",
};

export default function ActionInputDialog({
  action,
  onCancel,
  onSubmit,
}: {
  action: ActionType | null;
  onCancel: () => void;
  onSubmit: (text: string) => void;
}) {
  if (!action) return null;

  return <DialogBody action={action} onCancel={onCancel} onSubmit={onSubmit} />;
}

function DialogBody({
  action,
  onCancel,
  onSubmit,
}: {
  action: ActionType;
  onCancel: () => void;
  onSubmit: (text: string) => void;
}) {
  const [text, setText] = useState("");

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{LABELS[action]}</DialogTitle>
        </DialogHeader>

        {action !== "CONTINUE" && (
          <Textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your intent..."
            className="min-h-30 text-base"
          />
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            disabled={action !== "CONTINUE" && !text.trim()}
            onClick={() => onSubmit(text.trim())}
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
