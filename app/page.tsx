"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { deleteStory, getMyStories } from "@/lib/api/stories";
import { StoryListItem } from "@/types/story";
import { Trash2, ChevronRight } from "lucide-react";
import HomeBar from "@/components/home-bar";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [adventures, setAdventures] = useState<StoryListItem[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchAdventures = async () => {
      try {
        const data = await getMyStories();
        setAdventures(data);
      } catch (err) {
        console.error("Failed to fetch stories", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdventures();
  }, [user]);

  return (
    <>
      <HomeBar />

      {/* Atmospheric background glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-[oklch(0.78_0.14_74/0.06)] blur-[140px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] rounded-full bg-[oklch(0.55_0.12_280/0.04)] blur-[100px]" />
      </div>

      <main className="min-h-screen flex flex-col items-center justify-center gap-10 px-6">
        <div className="text-center space-y-4">
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight ink-gradient">
            Black Ink
          </h1>
          <p className="max-w-sm text-center text-[oklch(0.56_0_0)] text-base leading-relaxed">
            Embark on epic text-based adventures powered by AI. Create your
            hero, choose your genre, and let the story unfold.
          </p>
        </div>

        {!user ? (
          <Link href="/login">
            <Button size="lg" className="px-10 text-base font-semibold shadow-[0_0_30px_oklch(0.78_0.14_74/0.35)]">
              Begin Your Story
            </Button>
          </Link>
        ) : (
          <div className="w-full max-w-md space-y-6">
            <Link href="/adventure/new" className="block">
              <Button
                size="lg"
                className="w-full text-base font-semibold shadow-[0_0_30px_oklch(0.78_0.14_74/0.3)] hover:shadow-[0_0_40px_oklch(0.78_0.14_74/0.5)] transition-shadow duration-300"
              >
                Start New Adventure
              </Button>
            </Link>

            {isLoading ? (
              <div className="text-center text-[oklch(0.40_0_0)] text-sm py-4">
                Loading adventures…
              </div>
            ) : adventures.length > 0 ? (
              <div className="space-y-3">
                <h2 className="text-[10px] font-semibold text-[oklch(0.42_0_0)] uppercase tracking-[0.15em]">
                  Your Adventures
                </h2>

                {adventures.map((a) => (
                  <Link
                    key={a._id}
                    href={`/adventure/${a._id}`}
                    className="group flex justify-between items-center glass-card rounded-xl px-4 py-3.5 hover:border-[oklch(1_0_0/16%)] hover:bg-[oklch(1_0_0/6%)] transition-all duration-200"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-[oklch(0.92_0_0)] group-hover:text-white transition-colors truncate">
                        {a.protagonist}
                      </div>
                      <div className="text-xs text-[oklch(0.48_0_0)] mt-0.5">
                        {a.genre}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <ChevronRight
                        size={15}
                        className="text-[oklch(0.38_0_0)] group-hover:text-[oklch(0.78_0.14_74)] transition-colors"
                      />
                      <button
                        onClick={async (e) => {
                          e.preventDefault();
                          const ok = confirm("Delete this story permanently?");
                          if (!ok) return;
                          await deleteStory(a._id);
                          setAdventures((prev) =>
                            prev.filter((s) => s._id !== a._id)
                          );
                        }}
                        className="p-1 rounded-md text-[oklch(0.38_0_0)] hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
                        aria-label="Delete story"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </main>
    </>
  );
}
