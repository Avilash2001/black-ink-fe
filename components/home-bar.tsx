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
      <div className="fixed top-0 inset-x-0 h-14 flex items-center justify-between px-4 bg-neutral-950 border-b border-neutral-800 z-50">
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

          {user && (
            <Button
              variant="ghost"
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
