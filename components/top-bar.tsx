"use client";

import Link from "next/link";
import { ArrowLeft, Settings } from "lucide-react";
import { useState } from "react";
import SettingsDialog from "@/components/settings-dialog";

export default function TopBar({ focusMode }: { focusMode: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className={[
          "sticky top-0 z-20 backdrop-blur bg-neutral-950/70 border-b border-neutral-800 transition-opacity",
          focusMode ? "opacity-0 pointer-events-none" : "opacity-100",
        ].join(" ")}
      >
        <div className="max-w-prose mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-neutral-300 hover:text-white"
          >
            <ArrowLeft size={16} />
            Exit
          </Link>

          <button
            onClick={() => setOpen(true)}
            className="text-neutral-400 hover:text-white"
            aria-label="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      <SettingsDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
