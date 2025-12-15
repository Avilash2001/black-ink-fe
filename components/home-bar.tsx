"use client";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/api/auth";
import { clearSession, getSession } from "@/lib/storage";
import { usePathname, useRouter } from "next/navigation";

export default function HomeBar() {
  const router = useRouter();
  const session = getSession();
  const pathName = usePathname();

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
    )
  );
}
