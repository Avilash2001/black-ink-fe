"use client";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import SettingsDialog from "./settings-dialog";
import { useAuth } from "@/lib/auth-context";

export default function HomeBar() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const pathName = usePathname();

  const [open, setOpen] = useState(false);

  if (pathName === "/" && !user) {
    return <></>;
  }

  return (
    !(pathName === "/" && !user) && (
      <div className="fixed top-0 inset-x-0 h-14 flex items-center justify-between px-5 bg-[oklch(0.07_0.008_65/85%)] backdrop-blur-xl border-b border-[oklch(1_0_0/6%)] z-50">
        <button
          className="text-sm font-semibold tracking-[0.12em] uppercase text-[oklch(0.79_0.165_78)] hover:text-[oklch(0.90_0.14_78)] transition-colors duration-200"
          onClick={() => router.push("/")}
        >
          Black Ink
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setOpen(true)}
            className="p-2 rounded-lg text-[oklch(0.42_0_0)] hover:text-[oklch(0.72_0_0)] hover:bg-[oklch(1_0_0/5%)] transition-all duration-200"
            aria-label="Settings"
          >
            <Settings size={17} />
          </button>

          {user && (
            <Button
              variant="ghost"
              size="sm"
              className="text-[oklch(0.42_0_0)] hover:text-[oklch(0.72_0_0)] hover:bg-[oklch(1_0_0/5%)]"
              onClick={async () => {
                await signOut();
              }}
            >
              Logout
            </Button>
          )}
        </div>

        <SettingsDialog open={open} onClose={() => setOpen(false)} />
      </div>
    )
  );
}
