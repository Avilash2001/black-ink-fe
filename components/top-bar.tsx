"use client";

import Link from "next/link";
import { ArrowLeft, Info, Settings } from "lucide-react";
import { useState } from "react";
import SettingsDialog from "@/components/settings-dialog";

export default function TopBar({ onInfo }: { onInfo?: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className="fixed top-0 inset-x-0 z-20 backdrop-blur-xl border-b"
        style={{ background: "var(--nav-bg)", borderColor: "var(--bd)" }}
      >
        <div className="max-w-prose mx-auto px-5 py-3.5 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-[var(--text-lo)] hover:text-[var(--text-hi)] transition-colors duration-200"
          >
            <ArrowLeft size={15} />
            Exit
          </Link>

          <div className="flex items-center gap-1">
            {onInfo && (
              <button
                onClick={onInfo}
                className="p-2 rounded-lg text-[var(--text-dim)] hover:text-[var(--text-mid)] hover:bg-[var(--bd)] transition-all duration-200"
                aria-label="Story info"
              >
                <Info size={17} />
              </button>
            )}

            <button
              onClick={() => setOpen(true)}
              className="p-2 rounded-lg text-[var(--text-dim)] hover:text-[var(--text-mid)] hover:bg-[var(--bd)] transition-all duration-200"
              aria-label="Settings"
            >
              <Settings size={17} />
            </button>
          </div>
        </div>
      </div>

      <SettingsDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
