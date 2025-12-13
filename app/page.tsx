"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSession, getAdventures } from "@/lib/storage";

export default function Home() {
  const session = getSession();
  const adventures = getAdventures();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8">
      <h1 className="text-4xl font-semibold">AI Adventure</h1>

      {!session ? (
        <Link href="/login">
          <Button size="lg">Sign In</Button>
        </Link>
      ) : (
        <>
          <Link href="/adventure/new">
            <Button size="lg">Start New Adventure</Button>
          </Link>

          {adventures.length > 0 && (
            <div className="w-full max-w-md space-y-3">
              <h2 className="text-sm uppercase text-neutral-400">Resume</h2>

              {adventures.map((a) => (
                <Link
                  key={a.id}
                  href={`/adventure/${a.id}`}
                  className="block border border-neutral-800 rounded-lg p-3 hover:bg-neutral-900"
                >
                  <div className="font-medium">{a.name}</div>
                  <div className="text-sm text-neutral-400">{a.genre}</div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
