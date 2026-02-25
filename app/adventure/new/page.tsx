"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createStory } from "@/lib/api/stories";
import HomeBar from "@/components/home-bar";
import { useAuth } from "@/lib/auth-context";

const GENRES = [
  { title: "Fantasy", mature: false },
  { title: "Sci-Fi", mature: false },
  { title: "Horror", mature: false },
  { title: "Mystery", mature: false },
  { title: "Post-Apocalyptic", mature: false },
  { title: "Crime Mystery", mature: false },
  { title: "Historical Fiction", mature: false },
  { title: "Adventure", mature: false },
  { title: "Comedy", mature: false },
  { title: "Dark Romance", mature: true },
  { title: "Sex Story", mature: true },
  { title: "Hentai", mature: true },
];

export default function NewAdventurePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [genre, setGenre] = useState<string | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  const matureEnabled = user.matureEnabled ?? false;
  const canStart = name.trim().length > 0 && genre && gender && !isCreating;

  return (
    <>
      <HomeBar />

      {/* Atmospheric glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-[oklch(0.78_0.14_74/0.05)] blur-[120px]" />
      </div>

      <main className="min-h-[100dvh] flex flex-col justify-center gap-8 md:gap-10 max-w-xl mx-auto px-6 py-24 md:py-0">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Start a New Adventure
          </h1>
          <p className="text-sm text-[oklch(0.48_0_0)] leading-relaxed">
            Choose a genre and enter your name. The story begins immediately.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-[10px] font-semibold text-[oklch(0.42_0_0)] uppercase tracking-[0.15em]">
            Genre
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
            {GENRES.filter(
              ({ mature }) => !mature || matureEnabled
            ).map(({ title }) => (
              <button
                key={title}
                disabled={isCreating}
                onClick={() => setGenre(title)}
                className={[
                  "rounded-xl px-4 py-3.5 text-center text-sm font-medium transition-all duration-200 border",
                  genre === title
                    ? "border-[oklch(0.78_0.14_74/65%)] bg-[oklch(0.78_0.14_74/12%)] text-[oklch(0.90_0.12_74)] shadow-[0_0_20px_oklch(0.78_0.14_74/0.15)]"
                    : "border-[oklch(1_0_0/9%)] bg-[oklch(1_0_0/3%)] text-[oklch(0.70_0_0)] hover:bg-[oklch(1_0_0/6%)] hover:border-[oklch(1_0_0/16%)] hover:text-[oklch(0.90_0_0)]",
                  isCreating ? "opacity-40 pointer-events-none" : "",
                ].join(" ")}
              >
                {title}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-[10px] font-semibold text-[oklch(0.42_0_0)] uppercase tracking-[0.15em]">
            Your Name
          </h2>
          <Input
            value={name}
            disabled={isCreating}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="h-11 bg-[oklch(1_0_0/4%)] border-[oklch(1_0_0/10%)] focus-visible:border-[oklch(0.78_0.14_74/60%)] focus-visible:ring-[oklch(0.78_0.14_74/20%)]"
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-[10px] font-semibold text-[oklch(0.42_0_0)] uppercase tracking-[0.15em]">
            Character Gender
          </h2>
          <div className="grid grid-cols-3 gap-2.5">
            {["male", "female", "non-binary"].map((g) => (
              <button
                key={g}
                disabled={isCreating}
                onClick={() => setGender(g)}
                className={[
                  "rounded-xl px-4 py-3.5 capitalize text-sm font-medium transition-all duration-200 border",
                  gender === g
                    ? "border-[oklch(0.78_0.14_74/65%)] bg-[oklch(0.78_0.14_74/12%)] text-[oklch(0.90_0.12_74)] shadow-[0_0_20px_oklch(0.78_0.14_74/0.15)]"
                    : "border-[oklch(1_0_0/9%)] bg-[oklch(1_0_0/3%)] text-[oklch(0.70_0_0)] hover:bg-[oklch(1_0_0/6%)] hover:border-[oklch(1_0_0/16%)] hover:text-[oklch(0.90_0_0)]",
                  isCreating ? "opacity-40 pointer-events-none" : "",
                ].join(" ")}
              >
                {g}
              </button>
            ))}
          </div>
        </section>

        <div className="space-y-3 text-center">
          <Button
            size="lg"
            disabled={!canStart}
            className="w-full text-base font-semibold shadow-[0_0_25px_oklch(0.78_0.14_74/0.3)] hover:shadow-[0_0_40px_oklch(0.78_0.14_74/0.5)] disabled:shadow-none transition-shadow duration-300"
            onClick={async () => {
              if (!genre || !gender) return;
              try {
                setIsCreating(true);
                const res = await createStory({
                  genre,
                  protagonist: name,
                  gender,
                  matureEnabled,
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
            <p className="text-sm text-[oklch(0.48_0_0)] animate-pulse">
              Weaving the opening scene…
            </p>
          )}
        </div>
      </main>
    </>
  );
}
