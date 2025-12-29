"use client";

import { Button } from "@/components/ui/button";
import { ActionType } from "@/app/adventure/[id]/page";
import { ArrowRight, Hand, MessageCircle, Eye, Wand2 } from "lucide-react";

export default function ActionBar({
  onAction,
  disabled,
}: {
  onAction: (action: ActionType) => void;
  disabled?: boolean;
}) {
  return (
    <div className="fixed bottom-0 pb-safe md:bottom-6 left-1/2 -translate-x-1/2 w-full md:w-96 opacity-100 z-50">
      <div className="bg-neutral-950/80 backdrop-blur-md border-t md:border border-neutral-800 md:rounded-2xl p-3 space-y-3 shadow-xl">
        {/* PRIMARY ACTION */}
        <Button
          size="lg"
          className="w-full text-base flex items-center justify-center gap-2"
          disabled={disabled}
          onClick={() => onAction("CONTINUE")}
        >
          Continue
          <ArrowRight size={18} />
        </Button>

        {/* SECONDARY ACTIONS */}
        <div className="grid grid-cols-3 gap-2">
          <ActionButton
            label="Do"
            icon={<Hand size={16} />}
            onClick={() => onAction("DO")}
            disabled={disabled}
          />

          <ActionButton
            label="Say"
            icon={<MessageCircle size={16} />}
            onClick={() => onAction("SAY")}
            disabled={disabled}
          />

          <ActionButton
            label="See"
            icon={<Eye size={16} />}
            onClick={() => onAction("SEE")}
            disabled={disabled}
          />
        </div>

        {/* META ACTION */}
        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2 text-neutral-300 border-neutral-700"
          disabled={disabled}
          onClick={() => onAction("STORY")}
        >
          Shape the Story
          <Wand2 size={16} />
        </Button>
      </div>
    </div>
  );
}

function ActionButton({
  label,
  icon,
  onClick,
  disabled,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      variant="secondary"
      className="flex flex-col gap-1 h-14 text-sm"
      disabled={disabled}
      onClick={onClick}
    >
      {icon}
      {label}
    </Button>
  );
}
