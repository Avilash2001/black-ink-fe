"use client";

import { useState } from "react";
import { redirect, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSession } from "@/lib/storage";
import { createStory } from "@/lib/api/stories";
import { getSettings } from "@/lib/settings";
import HomeBar from "@/components/home-bar";

const GENRES = [
  "Fantasy",
  "Sci-Fi",
  "Horror",
  "Mystery",
  "Post-Apocalyptic",
  "Dark Romance",
];

export default function NewAdventurePage() {
  const settings = getSettings();
  const router = useRouter();

  const [name, setName] = useState("");
  const [genre, setGenre] = useState<string | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const session = getSession();
  if (!session) redirect("/login");

  const canStart = name.trim().length > 0 && genre && gender && !isCreating;

  return (
    <>
      <HomeBar />
      <main className="min-h-screen flex flex-col justify-center gap-10 max-w-xl mx-auto px-4">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold">Start a New Adventure</h1>
          <p className="text-neutral-400">
            Choose a genre and enter your name. The story will begin
            immediately.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-sm uppercase tracking-wide text-neutral-400">
            Genre
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {GENRES.map((g) => (
              <button
                key={g}
                disabled={isCreating}
                onClick={() => setGenre(g)}
                className={[
                  "border rounded-lg px-4 py-3 text-left transition-colors",
                  genre === g
                    ? "border-neutral-200 bg-neutral-900"
                    : "border-neutral-800 hover:bg-neutral-900",
                  isCreating && "opacity-50 pointer-events-none",
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
            disabled={isCreating}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-sm uppercase tracking-wide text-neutral-400">
            Character Gender
          </h2>

          <div className="grid grid-cols-3 gap-3">
            {["male", "female", "non-binary"].map((g) => (
              <button
                key={g}
                disabled={isCreating}
                onClick={() => setGender(g)}
                className={[
                  "border rounded-lg px-4 py-3 capitalize",
                  gender === g
                    ? "border-neutral-200 bg-neutral-900"
                    : "border-neutral-800 hover:bg-neutral-900",
                ].join(" ")}
              >
                {g}
              </button>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="space-y-3">
          <Button
            size="lg"
            disabled={!canStart}
            onClick={async () => {
              if (!genre || !gender) return;

              try {
                setIsCreating(true);

                const res = await createStory({
                  genre,
                  protagonist: name,
                  gender,
                  matureEnabled: settings.matureContent,
                });

                router.push(`/adventure/${res.storyId}`);
              } finally {
                setIsCreating(false);
              }
            }}
          >
            {isCreating ? "The world is forming…" : "Begin Adventure"}
          </Button>

          {isCreating && (
            <p className="text-sm text-neutral-400 text-center animate-pulse">
              Weaving the opening scene…
            </p>
          )}
        </div>
      </main>
    </>
  );
}
