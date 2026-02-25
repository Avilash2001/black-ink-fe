"use client";

import Link from "next/link";
import { ArrowLeft, Settings } from "lucide-react";
import { useState } from "react";
import SettingsDialog from "@/components/settings-dialog";

export default function TopBar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-20 bg-[oklch(0.08_0.005_65/75%)] backdrop-blur-xl border-b border-[oklch(1_0_0/6%)]">
        <div className="max-w-prose mx-auto px-5 py-3.5 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-[oklch(0.48_0_0)] hover:text-[oklch(0.75_0_0)] transition-colors duration-200"
          >
            <ArrowLeft size={15} />
            Exit
          </Link>

          <button
            onClick={() => setOpen(true)}
            className="p-2 rounded-lg text-[oklch(0.42_0_0)] hover:text-[oklch(0.72_0_0)] hover:bg-[oklch(1_0_0/5%)] transition-all duration-200"
            aria-label="Settings"
          >
            <Settings size={17} />
          </button>
        </div>
      </div>

      <SettingsDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
