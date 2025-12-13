"use client";

import { useState } from "react";
import { redirect, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSession, saveAdventure } from "@/lib/storage";

const GENRES = [
  "Fantasy",
  "Sci-Fi",
  "Horror",
  "Mystery",
  "Post-Apocalyptic",
  "Dark Romance",
];

export default function NewAdventurePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [genre, setGenre] = useState<string | null>(null);

  const session = getSession();
  if (!session) redirect("/login");

  const canStart = name.trim().length > 0 && genre;

  return (
    <main className="min-h-screen flex flex-col justify-center gap-10 max-w-xl mx-auto">
      <header className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold">Start a New Adventure</h1>
        <p className="text-neutral-400">
          Choose a genre and enter your name. The story will begin immediately.
        </p>
      </header>

      {/* Genre selection */}
      <section className="space-y-4">
        <h2 className="text-sm uppercase tracking-wide text-neutral-400">
          Genre
        </h2>

        <div className="grid grid-cols-2 gap-3">
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className={[
                "border rounded-lg px-4 py-3 text-left transition-colors",
                genre === g
                  ? "border-neutral-200 bg-neutral-900"
                  : "border-neutral-800 hover:bg-neutral-900",
              ].join(" ")}
            >
              {g}
            </button>
          ))}
        </div>
      </section>

      {/* Name input */}
      <section className="space-y-2">
        <h2 className="text-sm uppercase tracking-wide text-neutral-400">
          Your Name
        </h2>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
        />
      </section>

      {/* CTA */}
      <Button
        size="lg"
        disabled={!canStart}
        onClick={() => {
          const id = crypto.randomUUID();

          saveAdventure({
            id,
            genre: genre!, // safe because canStart is true
            name,
            updatedAt: Date.now(),
          });

          router.push(`/adventure/${id}`);
        }}
      >
        Begin Adventure
      </Button>
    </main>
  );
}
