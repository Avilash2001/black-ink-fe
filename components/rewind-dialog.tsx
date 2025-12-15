"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function buildPreview(story: string[], rewindToken: number) {
  let cursor = 0;
  const result: string[] = [];

  for (const p of story) {
    const words = p.split(" ");
    if (cursor + words.length <= rewindToken) {
      result.push(p);
      cursor += words.length;
    } else {
      const slice = words.slice(0, Math.max(0, rewindToken - cursor));
      if (slice.length) result.push(slice.join(" "));
      break;
    }
  }

  return result;
}

export default function RewindDialog({
  open,
  rewindToken,
  story,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  rewindToken: number | null;
  story: string[];
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (rewindToken === null) return null;

  const preview = buildPreview(story, rewindToken);

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Rewind story?</DialogTitle>
        </DialogHeader>

        <div className="text-sm text-neutral-400  space-y-4 max-h-60 overflow-auto border border-neutral-800 rounded p-3">
          {preview.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Rewind Here
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
