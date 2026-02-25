"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type StoryInfo = {
  genre: string;
  protagonist: string;
  gender: string;
  matureEnabled: boolean;
  createdAt: string;
  turnCount: number;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-[oklch(1_0_0/6%)] last:border-0">
    <span className="text-[10px] font-semibold text-[oklch(0.42_0_0)] uppercase tracking-[0.12em]">
      {label}
    </span>
    <span className="text-sm text-[oklch(0.82_0_0)]">{value}</span>
  </div>
);

export default function StoryInfoDialog({
  open,
  onClose,
  info,
}: {
  open: boolean;
  onClose: () => void;
  info: StoryInfo | null;
}) {
  if (!info) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Story Info</DialogTitle>
        </DialogHeader>

        <div className="mt-1">
          <Row label="Genre" value={info.genre} />
          <Row label="Protagonist" value={info.protagonist} />
          <Row label="Gender" value={capitalize(info.gender)} />
          <Row
            label="Mature Content"
            value={info.matureEnabled ? "Enabled" : "Disabled"}
          />
          <Row label="Started" value={formatDate(info.createdAt)} />
          <Row
            label="Turns"
            value={`${info.turnCount} turn${info.turnCount !== 1 ? "s" : ""}`}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
