"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { deleteStory, getMyStories } from "@/lib/api/stories";
import { StoryListItem } from "@/types/story";
import { Trash2, ChevronRight, Globe, Sparkles, User } from "lucide-react";
import HomeBar from "@/components/home-bar";
import { useAuth } from "@/lib/auth-context";

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  const first = name.split(" ")[0];
  if (hour < 12) return `Good morning, ${first}.`;
  if (hour < 18) return `Good afternoon, ${first}.`;
  return `Good evening, ${first}.`;
}

export default function Home() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [adventures, setAdventures] = useState<StoryListItem[]>([]);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

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

      {/* Atmospheric background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-[oklch(0.79_0.165_78/0.07)] blur-[160px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] rounded-full bg-[oklch(0.55_0.12_280/0.04)] blur-[120px]" />
        <div className="absolute bottom-1/4 left-0 w-[300px] h-[300px] rounded-full bg-[oklch(0.79_0.165_78/0.04)] blur-[100px]" />
      </div>

      {!user ? (
        /* ── LOGGED-OUT LANDING ── */
        <main className="flex flex-col">
          {/* Hero */}
          <section className="min-h-screen flex flex-col items-center justify-center gap-8 px-6 text-center">
            <div className="space-y-5">
              <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[oklch(0.79_0.165_78)] opacity-80">
                AI-Powered Adventure
              </p>
              <h1 className="text-7xl md:text-8xl font-bold tracking-tight ink-gradient leading-[1.05]">
                Black Ink
              </h1>
              <p className="max-w-md text-center text-[oklch(0.54_0_0)] text-lg leading-relaxed">
                Your story. Your choice. Step into worlds forged by AI and shaped by every decision you make.
              </p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <Link href="/login">
                <Button
                  size="lg"
                  className="px-12 text-base font-semibold amber-glow transition-all duration-300"
                >
                  Begin Your Story
                </Button>
              </Link>
              <Link href="/whodunit">
                <button className="px-8 py-2.5 rounded-lg text-sm font-bold tracking-[0.15em] border border-[#DC143C]/30 bg-[#DC143C]/8 text-[#DC143C] hover:bg-[#DC143C]/15 hover:border-[#DC143C]/50 transition-all duration-200">
                  Play Whodunit
                </button>
              </Link>
            </div>

            <p className="text-xs text-[oklch(0.36_0_0)]">
              Free to start &mdash; no credit card required
            </p>
          </section>

          {/* Feature cards */}
          <section className="pb-32 px-6">
            <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
              <FeatureCard
                icon={<Globe size={22} strokeWidth={1.5} />}
                title="Infinite Worlds"
                description="Fantasy, horror, sci-fi, romance — every genre, every era, every possibility."
              />
              <FeatureCard
                icon={<Sparkles size={22} strokeWidth={1.5} />}
                title="Living Stories"
                description="AI narration that remembers, adapts, and escalates with every choice you make."
              />
              <FeatureCard
                icon={<User size={22} strokeWidth={1.5} />}
                title="Your Hero"
                description="Craft your protagonist, choose your path, and own every consequence."
              />
            </div>
          </section>
        </main>
      ) : (
        /* ── LOGGED-IN DASHBOARD ── */
        <main className="min-h-screen flex flex-col items-center justify-center gap-8 px-6 pt-14">
          <div className="w-full max-w-md space-y-8">
            {/* Header */}
            <div className="text-center space-y-1">
              <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-[oklch(0.79_0.165_78)] opacity-70">
                Black Ink
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-[oklch(0.92_0.005_74)]">
                {getGreeting(user!.name)}
              </h1>
              <p className="text-sm text-[oklch(0.45_0_0)]">
                Where will you go today?
              </p>
            </div>

            {/* Start CTA */}
            <div className="space-y-2">
              <Link href="/adventure/new" className="block">
                <Button
                  size="lg"
                  className="w-full text-base font-semibold amber-glow transition-all duration-300"
                >
                  Start New Adventure
                </Button>
              </Link>
              <Link href="/whodunit" className="block">
                <button className="w-full py-3 px-6 rounded-lg text-sm font-bold tracking-[0.15em] border border-[#DC143C]/30 bg-[#DC143C]/8 text-[#DC143C] hover:bg-[#DC143C]/15 hover:border-[#DC143C]/50 transition-all duration-200">
                  Play Whodunit
                </button>
              </Link>
            </div>

            {/* Adventures list */}
            {isLoading ? (
              <div className="text-center text-[oklch(0.40_0_0)] text-sm py-4">
                Loading adventures…
              </div>
            ) : adventures.length > 0 ? (
              <div className="space-y-3">
                <h2 className="text-[10px] font-semibold text-[oklch(0.40_0_0)] uppercase tracking-[0.18em]">
                  Your Adventures
                </h2>

                <div className="space-y-2">
                  {adventures.map((a) => (
                    <Link
                      key={a._id}
                      href={`/adventure/${a._id}`}
                      className="group flex justify-between items-center glass-card rounded-xl px-4 py-3.5 hover:border-[oklch(0.79_0.165_78/20%)] hover:bg-[oklch(0.79_0.165_78/4%)] transition-all duration-200"
                    >
                      <div className="min-w-0">
                        <div className="font-medium text-[oklch(0.90_0.005_74)] group-hover:text-white transition-colors truncate">
                          {a.protagonist}
                        </div>
                        <div className="text-xs text-[oklch(0.50_0.04_78)] mt-0.5">
                          {a.genre}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <ChevronRight
                          size={15}
                          className="text-[oklch(0.36_0_0)] group-hover:text-[oklch(0.79_0.165_78)] transition-colors"
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
                          className="p-1.5 rounded-md text-[oklch(0.36_0_0)] hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
                          aria-label="Delete story"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </Link>
                  ))}
                </div>

                <p className="text-center text-[10px] text-[oklch(0.36_0_0)] pt-1">
                  {adventures.length} {adventures.length === 1 ? "adventure" : "adventures"}
                </p>
              </div>
            ) : null}
          </div>
        </main>
      )}
    </>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="glass-card rounded-2xl px-6 py-7 space-y-3 hover:border-[oklch(0.79_0.165_78/18%)] hover:bg-[oklch(0.79_0.165_78/3%)] transition-all duration-300">
      <div className="text-[oklch(0.79_0.165_78)]">{icon}</div>
      <h3 className="font-semibold text-[oklch(0.90_0.005_74)] text-sm tracking-wide">
        {title}
      </h3>
      <p className="text-sm text-[oklch(0.50_0_0)] leading-relaxed">{description}</p>
    </div>
  );
}
