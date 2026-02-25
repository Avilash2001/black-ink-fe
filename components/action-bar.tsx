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
    <div className="fixed bottom-0 pb-safe md:bottom-6 left-1/2 -translate-x-1/2 w-full md:w-[400px] opacity-100 z-50">
      <div className="bg-[oklch(0.08_0.005_65/88%)] backdrop-blur-xl border-t md:border border-[oklch(1_0_0/8%)] md:rounded-2xl p-3 space-y-2.5 shadow-2xl">
        {/* PRIMARY ACTION */}
        <Button
          size="lg"
          className="w-full text-base font-semibold flex items-center justify-center gap-2 shadow-[0_0_20px_oklch(0.78_0.14_74/0.25)] hover:shadow-[0_0_30px_oklch(0.78_0.14_74/0.4)] disabled:shadow-none transition-shadow duration-300"
          disabled={disabled}
          onClick={() => onAction("CONTINUE")}
        >
          Continue
          <ArrowRight size={17} />
        </Button>

        {/* SECONDARY ACTIONS */}
        <div className="grid grid-cols-3 gap-2">
          <ActionButton
            label="Do"
            icon={<Hand size={15} />}
            onClick={() => onAction("DO")}
            disabled={disabled}
          />

          <ActionButton
            label="Say"
            icon={<MessageCircle size={15} />}
            onClick={() => onAction("SAY")}
            disabled={disabled}
          />

          <ActionButton
            label="See"
            icon={<Eye size={15} />}
            onClick={() => onAction("SEE")}
            disabled={disabled}
          />
        </div>

        {/* META ACTION */}
        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2 text-[oklch(0.52_0_0)] border-[oklch(1_0_0/8%)] bg-transparent hover:bg-[oklch(1_0_0/5%)] hover:text-[oklch(0.72_0_0)] hover:border-[oklch(1_0_0/14%)] transition-all duration-200"
          disabled={disabled}
          onClick={() => onAction("STORY")}
        >
          Shape the Story
          <Wand2 size={15} />
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
      className="flex flex-col gap-1 h-14 text-xs font-medium bg-[oklch(1_0_0/5%)] hover:bg-[oklch(1_0_0/8%)] text-[oklch(0.68_0_0)] hover:text-[oklch(0.88_0_0)] border border-[oklch(1_0_0/8%)] transition-all duration-200"
      disabled={disabled}
      onClick={onClick}
    >
      {icon}
      {label}
    </Button>
  );
}
