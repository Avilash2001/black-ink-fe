"use client";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/api/auth";
import { clearSession, getSession } from "@/lib/storage";
import { Settings } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import SettingsDialog from "./settings-dialog";

export default function HomeBar() {
  const router = useRouter();
  const session = getSession();
  const pathName = usePathname();

  const [open, setOpen] = useState(false);

  if (pathName === "/" && !session) {
    return <></>;
  }

  return (
    !(pathName === "/" && !session) && (
      <div className="fixed top-0 inset-x-0 h-14 flex items-center justify-between px-4 bg-neutral-950 border-b border-neutral-800">
        <div
          className="text-sm font-medium cursor-pointer"
          onClick={() => {
            router.push("/");
          }}
        >
          Black Ink
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setOpen(true)}
            className="text-neutral-400 hover:text-white"
            aria-label="Settings"
          >
            <Settings size={18} />
          </button>

          {session && (
            <Button
              variant="ghost"
              onClick={async () => {
                await logout();
                clearSession();
                router.push("/login");
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
