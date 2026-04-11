"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import HomeBar from "@/components/home-bar";
import { useAuth } from "@/lib/auth-context";
import { generateMurdle, getMyMysteries, MysteryListItem } from "@/lib/api/murdle";
import { ChevronRight, Search } from "lucide-react";

export default function InkquestPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mysteries, setMysteries] = useState<MysteryListItem[]>([]);
  const [mysteriesLoading, setMysteriesLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setMysteriesLoading(true);
    getMyMysteries()
      .then(setMysteries)
      .catch(console.error)
      .finally(() => setMysteriesLoading(false));
  }, [user]);

  const handleGenerate = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    try {
      setIsGenerating(true);
      setError(null);
      const { gameId } = await generateMurdle();
      router.push(`/murdle/${gameId}`);
    } catch (err) {
      console.error(err);
      setError("Failed to generate mystery. Please try again.");
      setIsGenerating(false);
    }
  };

  if (authLoading) return null;

  return (
    <>
      <HomeBar />

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-[oklch(0.45_0.18_15/0.07)] blur-[160px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] rounded-full bg-[oklch(0.40_0.10_280/0.04)] blur-[120px]" />
      </div>

      <main className="min-h-screen pt-14">
        <div className="max-w-xl mx-auto px-6 py-16 space-y-14">

          {/* Hero */}
          <div className="space-y-5 text-center">
            <p className="text-[10px] font-semibold tracking-[0.35em] uppercase text-[oklch(0.55_0.18_15)]">
              A Black Ink Mystery
            </p>
            <h1
              className="text-7xl font-bold uppercase tracking-[0.06em]"
              style={{
                color: "#DC143C",
                textShadow: "0 0 60px oklch(0.45 0.22 15 / 0.35), 0 0 120px oklch(0.45 0.22 15 / 0.12)",
              }}
            >
              Inkquest
            </h1>
            <p className="text-[oklch(0.55_0_0)] text-sm leading-relaxed max-w-sm mx-auto">
              The AI that writes your adventures also stages murders. Every mystery is unique — study the clues, cross-examine the suspects, and name the killer before the case goes cold.
            </p>
          </div>

          {/* Generate / Login CTA */}
          <div className="flex flex-col items-center gap-3">
            {!user ? (
              <>
                <p className="text-xs text-[oklch(0.42_0_0)]">Sign in to generate and save your mysteries.</p>
                <Link href="/login">
                  <button className="px-10 py-3 text-sm font-bold uppercase tracking-[0.18em] rounded-lg bg-[#DC143C] text-white border border-[#DC143C] hover:bg-[#c01236] shadow-[0_0_24px_oklch(0.45_0.22_15/0.3)] hover:shadow-[0_0_40px_oklch(0.45_0.22_15/0.5)] transition-all duration-300">
                    Sign In to Play
                  </button>
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="px-10 py-3 text-sm font-bold uppercase tracking-[0.18em] rounded-lg bg-[#DC143C] text-white border border-[#DC143C] hover:bg-[#c01236] shadow-[0_0_24px_oklch(0.45_0.22_15/0.3)] hover:shadow-[0_0_40px_oklch(0.45_0.22_15/0.5)] disabled:opacity-50 disabled:pointer-events-none transition-all duration-300"
                >
                  {isGenerating ? (
                    <span className="flex items-center gap-2">
                      <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Staging the crime...
                    </span>
                  ) : (
                    "New Mystery"
                  )}
                </button>
                {isGenerating && (
                  <p className="text-xs text-[oklch(0.40_0_0)] animate-pulse">
                    The AI is planting clues and choosing a killer...
                  </p>
                )}
                {error && (
                  <p className="text-sm text-[oklch(0.65_0.22_27)]">{error}</p>
                )}
              </>
            )}
          </div>

          {/* How to play */}
          <div className="glass-card rounded-xl px-6 py-5 space-y-3">
            <h2 className="text-[10px] font-semibold text-[oklch(0.40_0_0)] uppercase tracking-[0.2em]">
              How it works
            </h2>
            <div className="space-y-3 text-sm text-[oklch(0.55_0_0)] leading-relaxed">
              <p><span className="text-[oklch(0.65_0.18_15)] font-semibold">1.</span> The AI generates a complete murder case — suspects, weapons, locations, motives, clues, and a hidden solution.</p>
              <p><span className="text-[oklch(0.65_0.18_15)] font-semibold">2.</span> Read the clues and suspect statements. Innocent suspects always tell the truth. The killer always lies.</p>
              <p><span className="text-[oklch(0.65_0.18_15)] font-semibold">3.</span> Use the deduction grid to eliminate impossibilities until only one solution remains.</p>
              <p><span className="text-[oklch(0.65_0.18_15)] font-semibold">4.</span> Make your accusation — WHO, with WHAT, WHERE, and WHY.</p>
            </div>
          </div>

          {/* Past mysteries */}
          {user && (
            <div className="space-y-3">
              <h2 className="text-[10px] font-semibold text-[oklch(0.40_0_0)] uppercase tracking-[0.18em]">
                Your Cases
              </h2>

              {mysteriesLoading ? (
                <p className="text-center text-[oklch(0.38_0_0)] text-sm py-4">
                  Loading cases…
                </p>
              ) : mysteries.length === 0 ? (
                <div className="glass-card rounded-xl px-5 py-6 text-center space-y-2">
                  <Search size={20} className="mx-auto text-[oklch(0.32_0_0)]" strokeWidth={1.5} />
                  <p className="text-sm text-[oklch(0.38_0_0)]">No cases yet. Generate your first mystery above.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {mysteries.map((m) => (
                    <Link
                      key={m._id}
                      href={`/murdle/${m._id}`}
                      className="group flex justify-between items-center glass-card rounded-xl px-4 py-3.5 hover:border-[oklch(0.55_0.15_15/20%)] hover:bg-[oklch(0.55_0.15_15/4%)] transition-all duration-200"
                    >
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-xs font-semibold text-[oklch(0.80_0.005_74)] group-hover:text-white transition-colors truncate uppercase tracking-wide">
                          {m.title}
                        </p>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
                            style={
                              m.solved
                                ? { background: "oklch(0.30 0.08 145 / 20%)", color: "oklch(0.65 0.12 145)" }
                                : m.givenUp
                                ? { background: "oklch(0.35 0.10 27 / 20%)", color: "oklch(0.60 0.18 27)" }
                                : { background: "oklch(1 0 0 / 6%)", color: "oklch(0.45 0 0)" }
                            }
                          >
                            {m.solved ? "Solved" : m.givenUp ? "Unsolved" : "Open"}
                          </span>
                        </div>
                      </div>
                      <ChevronRight
                        size={15}
                        className="text-[oklch(0.32_0_0)] group-hover:text-[#DC143C] transition-colors shrink-0 ml-3"
                      />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
