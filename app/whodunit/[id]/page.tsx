"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Timer, CheckCircle2, XCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import HomeBar from "@/components/home-bar";
import DeductionGrid from "@/components/murdle/deduction-grid";
import {
  getMurdle,
  accuseMurdle,
  giveUpMurdle,
  updateMurdleGrid,
  revealMurdleHint,
  generateMurdleNarrative,
  MurdleGame,
  MurdleSolution,
} from "@/lib/api/murdle";

// Suspect color map
const SUSPECT_COLORS: Record<string, string> = {
  crimson: "#DC143C",
  blue: "#4169E1",
  gold: "#DAA520",
  magenta: "#FF00FF",
};

// Large suspect silhouette for cards (mimics original Murdle style)
function SuspectSilhouette({ color }: { color: string }) {
  const hex = SUSPECT_COLORS[color] ?? color;
  return (
    <svg width="90" height="90" viewBox="0 0 90 90" fill="none" aria-hidden="true">
      <circle cx="45" cy="30" r="20" fill={hex} />
      <path d="M5 88c0-22.091 17.909-40 40-40s40 17.909 40 40" fill={hex} />
    </svg>
  );
}

// Emoji lookup for weapons, locations, motives — with deduplication
function getItemEmojiRaw(name: string, category: "weapon" | "location" | "motive"): string {
  const n = name.toLowerCase();
  if (category === "weapon") {
    if (n.includes("dagger") || n.includes("knife") || n.includes("blade") || n.includes("sword")) return "🗡️";
    if (n.includes("opener") || n.includes("stiletto") || n.includes("lancet") || n.includes("scalpel")) return "🔪";
    if (n.includes("poison") || n.includes("tincture") || n.includes("vial") || n.includes("toxin") || n.includes("elixir")) return "🧪";
    if (n.includes("syringe") || n.includes("injection") || n.includes("needle")) return "💉";
    if (n.includes("gun") || n.includes("pistol") || n.includes("revolver") || n.includes("rifle")) return "🔫";
    if (n.includes("rope") || n.includes("garrote") || n.includes("wire") || n.includes("cord") || n.includes("string")) return "🪢";
    if (n.includes("chain")) return "🔗";
    if (n.includes("candlestick") || n.includes("candle")) return "🕯️";
    if (n.includes("axe") || n.includes("hatchet") || n.includes("cleaver")) return "🪓";
    if (n.includes("wrench") || n.includes("spanner")) return "🔧";
    if (n.includes("pipe") || n.includes("lead pipe")) return "🔩";
    if (n.includes("hammer") || n.includes("mallet") || n.includes("club") || n.includes("bludgeon") || n.includes("bat")) return "🔨";
    if (n.includes("iron bar") || n.includes("iron rod")) return "🪛";
    if (n.includes("arrow") || n.includes("bow")) return "🏹";
    if (n.includes("book") || n.includes("tome")) return "📚";
    if (n.includes("crystal") || n.includes("gem") || n.includes("stone") || n.includes("paperweight")) return "💎";
    if (n.includes("bottle") || n.includes("flask") || n.includes("decanter")) return "🍾";
    if (n.includes("vase") || n.includes("urn")) return "🏺";
    if (n.includes("pen") || n.includes("quill")) return "🖊️";
    if (n.includes("scissors") || n.includes("shears")) return "✂️";
    if (n.includes("statuette") || n.includes("figurine") || n.includes("statue")) return "🗿";
    if (n.includes("clock") || n.includes("watch")) return "⌚";
    if (n.includes("brass") || n.includes("bronze")) return "🥉";
    if (n.includes("iron") || n.includes("metal")) return "🪝";
    if (n.includes("silk") || n.includes("scarf") || n.includes("cravat") || n.includes("tie")) return "🧣";
    return "⚔️";
  }
  if (category === "location") {
    if (n.includes("library") || n.includes("study") || n.includes("archive")) return "📚";
    if (n.includes("garden") || n.includes("maze") || n.includes("hedge") || n.includes("greenhouse")) return "🌿";
    if (n.includes("kitchen") || n.includes("pantry") || n.includes("dining")) return "🍽️";
    if (n.includes("observatory") || n.includes("telescope")) return "🔭";
    if (n.includes("cellar") || n.includes("wine") || n.includes("basement") || n.includes("vault")) return "🍷";
    if (n.includes("ballroom") || n.includes("salon") || n.includes("grand hall")) return "🏛️";
    if (n.includes("bedroom") || n.includes("chamber") || n.includes("suite")) return "🛏️";
    if (n.includes("lab")) return "🔬";
    if (n.includes("chapel") || n.includes("church") || n.includes("cathedral")) return "⛪";
    if (n.includes("tower") || n.includes("turret") || n.includes("roof")) return "🗼";
    if (n.includes("golf") || n.includes("course")) return "⛳";
    if (n.includes("boat") || n.includes("dock") || n.includes("harbor") || n.includes("pier")) return "⛵";
    if (n.includes("stable") || n.includes("barn")) return "🐎";
    if (n.includes("gallery") || n.includes("museum")) return "🖼️";
    if (n.includes("chateau") || n.includes("castle") || n.includes("manor") || n.includes("fortress")) return "🏰";
    if (n.includes("forest") || n.includes("woods")) return "🌲";
    if (n.includes("pool") || n.includes("bath")) return "🏊";
    if (n.includes("corridor") || n.includes("hall") || n.includes("passage")) return "🚪";
    if (n.includes("clock") || n.includes("clock tower")) return "🕰️";
    return "🏠";
  }
  // motive
  if (n.includes("jealous") || n.includes("envy") || n.includes("rage")) return "💚";
  if (n.includes("greed") || n.includes("money") || n.includes("fortune") || n.includes("wealth") || n.includes("inherit")) return "💰";
  if (n.includes("debt") || n.includes("unpaid") || n.includes("owe") || n.includes("bankrupt")) return "💸";
  if (n.includes("revenge") || n.includes("vengeance") || n.includes("vendetta")) return "⚔️";
  if (n.includes("love") || n.includes("affair") || n.includes("romance") || n.includes("passion") || n.includes("hide an")) return "❤️";
  if (n.includes("power") || n.includes("ambition") || n.includes("control")) return "👑";
  if (n.includes("blackmail") || n.includes("silence") || n.includes("spy") || n.includes("eliminate")) return "🕵️";
  if (n.includes("secret") || n.includes("expose") || n.includes("conceal")) return "🤫";
  if (n.includes("fear") || n.includes("protect") || n.includes("survival")) return "🛡️";
  if (n.includes("honor") || n.includes("pride") || n.includes("reputation")) return "🏆";
  if (n.includes("patent") || n.includes("stolen") || n.includes("theft") || n.includes("steal") || n.includes("invention")) return "📜";
  return "🎭";
}

// Fallback pools for deduplication
const WEAPON_FALLBACKS = ["⚔️","🔪","🗡️","🪃","🪖","🧨","💣","🪤","🔩","🪛"];
const LOCATION_FALLBACKS = ["🏠","🏡","🏚️","🏗️","🗺️","🧭","🌉","🏟️","🏪","🏫"];
const MOTIVE_FALLBACKS = ["🎭","🎪","🎯","🎲","🎰","🃏","🎴","🎬","🎩","🎸"];
const SUSPECT_FALLBACKS = ["🕵️","👤","🧑","👩","🧔","👳","🦹","🧛","🧟","🥷"];

function buildEmojiMap(names: string[], category: "weapon" | "location" | "motive" | "suspect"): Map<string, string> {
  const map = new Map<string, string>();
  const used = new Set<string>();
  const fallbacks =
    category === "weapon" ? WEAPON_FALLBACKS
    : category === "location" ? LOCATION_FALLBACKS
    : category === "suspect" ? SUSPECT_FALLBACKS
    : MOTIVE_FALLBACKS;
  let fallbackIdx = 0;
  for (const name of names) {
    let emoji = category === "suspect" ? "🕵️" : getItemEmojiRaw(name, category);
    if (used.has(emoji)) {
      while (fallbackIdx < fallbacks.length && used.has(fallbacks[fallbackIdx])) fallbackIdx++;
      emoji = fallbackIdx < fallbacks.length ? fallbacks[fallbackIdx++] : "❓";
    }
    used.add(emoji);
    map.set(name, emoji);
  }
  return map;
}

function getItemEmoji(name: string, category: "weapon" | "location" | "motive", emojiMap?: Map<string, string>): string {
  if (emojiMap) return emojiMap.get(name) ?? getItemEmojiRaw(name, category);
  return getItemEmojiRaw(name, category);
}

type CardTab = "suspects" | "weapons" | "locations" | "motives";

function SolutionReveal({ solution, game }: { solution: MurdleSolution; game: MurdleGame }) {
  const murdererSuspect = game.suspects.find(
    (s) => s.name === solution.murderer
  );
  const murdererColor = murdererSuspect
    ? SUSPECT_COLORS[murdererSuspect.color] ?? murdererSuspect.color
    : "#DC143C";

  return (
    <div className="space-y-4">
      <div
        className="rounded-xl px-5 py-4 border"
        style={{
          background: `${murdererColor}10`,
          borderColor: `${murdererColor}30`,
        }}
      >
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-lo)] mb-1">
          The Murderer
        </p>
        <p
          className="text-3xl font-bold uppercase tracking-wide"
          style={{ color: murdererColor }}
        >
          {solution.murderer}
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-dim)]">
          Full Assignments
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--bd)]">
                <th className="text-left py-2.5 pr-4 text-[var(--text-dim)] font-semibold tracking-wide uppercase text-xs">
                  Suspect
                </th>
                <th className="text-left py-2.5 pr-4 text-[var(--text-dim)] font-semibold tracking-wide uppercase text-xs">
                  Weapon
                </th>
                <th className="text-left py-2.5 pr-4 text-[var(--text-dim)] font-semibold tracking-wide uppercase text-xs">
                  Location
                </th>
                <th className="text-left py-2.5 text-[var(--text-dim)] font-semibold tracking-wide uppercase text-xs">
                  Motive
                </th>
              </tr>
            </thead>
            <tbody>
              {solution.assignments.map((a) => {
                const suspect = game.suspects.find((s) => s.name === a.suspect);
                const color = suspect
                  ? SUSPECT_COLORS[suspect.color] ?? suspect.color
                  : "var(--text-mid)";
                const isMurderer = a.suspect === solution.murderer;
                return (
                  <tr
                    key={a.suspect}
                    className="border-b border-[var(--bd)]"
                    style={
                      isMurderer ? { background: `${color}08` } : undefined
                    }
                  >
                    <td className="py-2 pr-3 font-semibold" style={{ color }}>
                      {a.suspect}
                      {isMurderer && (
                        <span className="ml-1.5 text-[9px] text-[oklch(0.65_0.22_27)] font-bold uppercase tracking-wide">
                          KILLER
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-[var(--text-mid)]">
                      {a.weapon}
                    </td>
                    <td className="py-2 pr-3 text-[var(--text-mid)]">
                      {a.location}
                    </td>
                    <td className="py-2 text-[var(--text-mid)]">{a.motive}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function MurdleGamePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [game, setGame] = useState<MurdleGame | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeCardTab, setActiveCardTab] = useState<CardTab>("suspects");
  const [grid, setGrid] = useState<Record<string, string>>({});
  const [accusation, setAccusation] = useState({
    who: "",
    how: "",
    where: "",
    why: "",
  });
  const [accusationResult, setAccusationResult] = useState<{
    correct: boolean;
    solution?: MurdleSolution;
  } | null>(null);
  const [isAccusing, setIsAccusing, ] = useState(false);
  const [isGivingUp, setIsGivingUp] = useState(false);
  const [hints, setHints] = useState<string[]>([]);
  const [hintLoading, setHintLoading] = useState<number | null>(null);
  const [gridModalOpen, setGridModalOpen] = useState(false);
  const [revealedSolution, setRevealedSolution] =
    useState<MurdleSolution | null>(null);
  const [narrative, setNarrative] = useState<string | null>(null);
  const [narrativeLoading, setNarrativeLoading] = useState(false);

  // Debounce timer ref for grid sync
  const gridSyncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getMurdle(id);
        setGame(data);
        setGrid(data.playerGrid ?? {});
        if (data.revealedHints?.length) setHints(data.revealedHints);
        if (data.solution) {
          setRevealedSolution(data.solution);
        }
      } catch (err) {
        console.error(err);
        setError("Could not load this mystery.");
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [id]);

  // Auto-generate narrative when game ends
  useEffect(() => {
    if (!game) return;
    const isOver = game.solved || game.givenUp;
    if (!isOver || narrative || narrativeLoading) return;
    setNarrativeLoading(true);
    generateMurdleNarrative(id)
      .then(({ narrative: text }) => setNarrative(text))
      .catch(console.error)
      .finally(() => setNarrativeLoading(false));
  }, [game, id, narrative, narrativeLoading]);

  const handleGridChange = useCallback(
    (newGrid: Record<string, string>) => {
      setGrid(newGrid);
      if (gridSyncTimer.current) clearTimeout(gridSyncTimer.current);
      gridSyncTimer.current = setTimeout(() => {
        updateMurdleGrid(id, newGrid).catch(console.error);
      }, 500);
    },
    [id]
  );

  const handleAccuse = async () => {
    if (!accusation.who || !accusation.how || !accusation.where || !accusation.why)
      return;
    try {
      setIsAccusing(true);
      const result = await accuseMurdle(id, accusation);
      setAccusationResult(result);
      if (result.correct && result.solution) {
        setRevealedSolution(result.solution);
        setGame((prev) => prev ? { ...prev, solved: true, solution: result.solution } : prev);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAccusing(false);
    }
  };

  const handleRevealHint = async (n: number) => {
    try {
      setHintLoading(n);
      const { hint } = await revealMurdleHint(id, n);
      setHints((prev) => {
        const next = [...prev];
        next[n] = hint;
        return next;
      });
      // Refresh game to get updated hintsRevealedAt / hintsAvailableAt
      const fresh = await getMurdle(id);
      setGame(fresh);
    } catch (err: any) {
      alert(err?.message ?? "Could not reveal hint.");
    } finally {
      setHintLoading(null);
    }
  };

  const handleGiveUp = async () => {
    const confirmed = window.confirm(
      "Give up and reveal the solution? You cannot undo this."
    );
    if (!confirmed) return;
    try {
      setIsGivingUp(true);
      const { solution } = await giveUpMurdle(id);
      setRevealedSolution(solution);
      setGame((prev) =>
        prev ? { ...prev, givenUp: true, solution } : prev
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsGivingUp(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <HomeBar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-6 h-6 border-2 border-[var(--bd-strong)] border-t-[#DC143C] rounded-full animate-spin mx-auto" />
            <p className="text-sm text-[var(--text-lo)]">Loading mystery...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !game) {
    return (
      <>
        <HomeBar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-[oklch(0.65_0.22_27)]">{error ?? "Mystery not found."}</p>
            <button
              onClick={() => router.push("/whodunit")}
              className="text-sm text-[var(--text-mid)] hover:text-[var(--text-hi)] underline underline-offset-2"
            >
              Back to Whodunit
            </button>
          </div>
        </div>
      </>
    );
  }

  const gameOver = game.solved || game.givenUp;
  const canAccuse =
    !gameOver &&
    accusation.who &&
    accusation.how &&
    accusation.where &&
    accusation.why;

  return (
    <>
      <HomeBar />

      {/* Atmospheric blood-red glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-[oklch(0.35_0.18_15/0.06)] blur-[140px]" />
        <div className="absolute bottom-1/3 right-0 w-[400px] h-[400px] rounded-full bg-[oklch(0.30_0.12_280/0.04)] blur-[120px]" />
      </div>

      <div className="min-h-screen pt-14">
        <div className="max-w-7xl mx-auto px-4 py-8 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* ── LEFT COLUMN: Game Content ── */}
            <div className="flex-1 min-w-0 space-y-8">

              {/* 1. Title block */}
              <div className="space-y-2">
                <p
                  className="text-xs font-bold uppercase tracking-[0.35em]"
                  style={{
                    color: "#DC143C",
                    textShadow: "0 0 20px oklch(0.45 0.22 15 / 0.4)",
                  }}
                >
                  WHODUNIT
                </p>
                <h1
                  className="text-3xl md:text-4xl font-bold uppercase tracking-[0.03em] leading-tight text-[var(--text-hi)]"
                  style={{ fontFamily: "var(--font-story, Georgia, serif)" }}
                >
                  {game.title}
                </h1>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {(game.solved || game.givenUp) && (
                    <div
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
                      style={
                        game.solved
                          ? {
                              background: "oklch(0.30 0.08 145 / 20%)",
                              color: "oklch(0.70 0.15 145)",
                              border: "1px solid oklch(0.40 0.10 145 / 30%)",
                            }
                          : {
                              background: "oklch(0.35 0.12 27 / 20%)",
                              color: "oklch(0.65 0.22 27)",
                              border: "1px solid oklch(0.45 0.15 27 / 30%)",
                            }
                      }
                    >
                      {game.solved ? "Mystery Solved!" : "Mystery Unsolved"}
                    </div>
                  )}
                  <GameTimer game={game} />
                </div>
              </div>

              {/* 2. Intro */}
              <div className="glass-card rounded-xl px-5 py-4 space-y-2">
                <p className="text-sm sm:text-base text-[var(--text-mid)] leading-relaxed italic">
                  {game.intro}
                </p>
                <p className="text-sm text-[var(--text-lo)] leading-relaxed">
                  Each of the four suspects brought exactly one weapon to one
                  location, and each had exactly one motive. Only one of them is
                  the murderer — and the clues below are enough to prove it.
                </p>
              </div>

              {/* 3 & 4. Tabbed card view */}
              <div className="space-y-4">
                {/* Tab nav — pill grid */}
                <div className="grid grid-cols-4 gap-1.5">
                  {(["suspects", "weapons", "locations", "motives"] as CardTab[]).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveCardTab(tab)}
                      className="text-[10px] font-black uppercase tracking-[0.12em] transition-all duration-150 rounded-lg px-1 py-2 border"
                      style={
                        activeCardTab === tab
                          ? {
                              borderColor: "#DC143C",
                              color: "#DC143C",
                              background: "oklch(0.35 0.15 15 / 15%)",
                            }
                          : {
                              borderColor: "var(--bd)",
                              color: "var(--text-dim)",
                              background: "var(--inp-bg)",
                            }
                      }
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* 2×2 Murdle-style card grid */}
                {(() => {
                  const suspectEmojis = buildEmojiMap(game.suspects.map(s => s.name), "suspect");
                  const weaponEmojis = buildEmojiMap(game.weapons.map(w => w.name), "weapon");
                  const locationEmojis = buildEmojiMap(game.locations.map(l => l.name), "location");
                  const motiveEmojis = buildEmojiMap(game.motives.map(m => m.name), "motive");
                  return (
                    <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-3 sm:gap-4">
                      {activeCardTab === "suspects" && game.suspects.map((s) => {
                        const hex = SUSPECT_COLORS[s.color] ?? s.color;
                        const emoji = suspectEmojis.get(s.name) ?? "🕵️";
                        return (
                          <div key={s.name} className="flex flex-col items-center rounded-2xl border overflow-hidden" style={{ background: "var(--card-surface)", borderColor: hex + "40" }}>
                            <div className="flex-1 flex items-center justify-center pt-8 pb-4">
                              <span className="text-7xl select-none" style={{ filter: `drop-shadow(0 0 16px ${hex}70)` }}>{emoji}</span>
                            </div>
                            <div className="w-full px-4 pb-5 pt-2 text-center space-y-1">
                              <p className="font-black uppercase tracking-wider text-sm leading-tight" style={{ color: hex, fontFamily: "monospace" }}>{s.name}</p>
                              <p className="text-[11px] text-[var(--text-lo)] leading-snug">{s.description}</p>
                            </div>
                          </div>
                        );
                      })}

                      {activeCardTab === "weapons" && game.weapons.map((w) => (
                        <div key={w.name} className="flex flex-col items-center rounded-2xl border border-[var(--bd)] overflow-hidden" style={{ background: "var(--card-surface)" }}>
                          <div className="flex-1 flex items-end justify-center pt-8 pb-3">
                            <span className="text-6xl select-none">{getItemEmoji(w.name, "weapon", weaponEmojis)}</span>
                          </div>
                          <div className="w-full px-4 pb-5 pt-2 text-center space-y-1">
                            <p className="font-black uppercase tracking-wider text-sm leading-tight text-[var(--text-hi)]" style={{ fontFamily: "monospace" }}>{w.name}</p>
                            <p className="text-[11px] text-[var(--text-lo)] leading-snug">{w.description}</p>
                          </div>
                        </div>
                      ))}

                      {activeCardTab === "locations" && game.locations.map((l) => (
                        <div key={l.name} className="flex flex-col items-center rounded-2xl border border-[var(--bd)] overflow-hidden" style={{ background: "var(--card-surface)" }}>
                          <div className="flex-1 flex items-end justify-center pt-8 pb-3">
                            <span className="text-6xl select-none">{getItemEmoji(l.name, "location", locationEmojis)}</span>
                          </div>
                          <div className="w-full px-4 pb-5 pt-2 text-center space-y-1">
                            <p className="font-black uppercase tracking-wider text-sm leading-tight text-[var(--text-hi)]" style={{ fontFamily: "monospace" }}>{l.name}</p>
                            <p className="text-[11px] text-[var(--text-lo)] leading-snug">{l.description}</p>
                          </div>
                        </div>
                      ))}

                      {activeCardTab === "motives" && game.motives.map((m) => (
                        <div key={m.name} className="flex flex-col items-center rounded-2xl border border-[var(--bd)] overflow-hidden" style={{ background: "var(--card-surface)" }}>
                          <div className="flex-1 flex items-end justify-center pt-8 pb-3">
                            <span className="text-6xl select-none">{getItemEmoji(m.name, "motive", motiveEmojis)}</span>
                          </div>
                          <div className="w-full px-4 pb-5 pt-2 text-center space-y-1">
                            <p className="font-black uppercase tracking-wider text-sm leading-tight text-[var(--text-hi)]" style={{ fontFamily: "monospace" }}>{m.name}</p>
                            <p className="text-[11px] text-[var(--text-lo)] leading-snug">{m.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* 5. Hints */}
              {!gameOver && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--text-dim)]">
                      Detective Hints
                    </h2>
                    <span className="text-[9px] text-[var(--text-dim)]">
                      {hints.filter(Boolean).length}/3 revealed
                    </span>
                  </div>
                  {!game.hintsReady ? (
                    <p className="text-xs text-[var(--text-dim)] italic">
                      Hints are being prepared…
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {[0, 1, 2].map((n) => (
                        <HintCard
                          key={n}
                          n={n}
                          game={game}
                          hints={hints}
                          loading={hintLoading}
                          onReveal={handleRevealHint}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 7. Clues & Evidence */}
              <div
                className="rounded-xl border px-5 py-5 space-y-3"
                style={{
                  background: "var(--card-surface)",
                  borderColor: "oklch(0.55 0.15 15 / 25%)",
                }}
              >
                <h2
                  className="text-sm font-bold uppercase tracking-[0.25em]"
                  style={{ color: "#DC143C" }}
                >
                  Clues &amp; Evidence
                </h2>
                <ul className="space-y-3">
                  {game.clues.map((clue, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-sm sm:text-base text-[var(--text-mid)] leading-relaxed"
                    >
                      <span
                        className="shrink-0 font-bold text-sm mt-0.5"
                        style={{ color: "#DC143C", opacity: 0.7 }}
                      >
                        {i + 1}.
                      </span>
                      {clue}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 6. Statements */}
              <div
                className="rounded-xl border px-5 py-5 space-y-4"
                style={{
                  background: "var(--card-surface)",
                  borderColor: "oklch(0.55 0.15 280 / 25%)",
                }}
              >
                <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-[oklch(0.55_0.18_280)]">
                  Suspect Statements
                </h2>
                <p className="text-xs text-[var(--text-dim)] italic">
                  Innocent suspects always tell the truth. The killer always lies.
                </p>
                <div className="space-y-4">
                  {game.statements.map((stmt, i) => {
                    const suspect = game.suspects.find(
                      (s) => s.name === stmt.suspect
                    );
                    const hex = suspect
                      ? SUSPECT_COLORS[suspect.color] ?? suspect.color
                      : "var(--text-mid)";
                    return (
                      <div
                        key={i}
                        className="flex gap-2 sm:gap-3 items-start"
                      >
                        <span
                          className="shrink-0 text-xs sm:text-sm font-bold mt-0.5 uppercase tracking-wide max-w-[90px] sm:max-w-none leading-snug"
                          style={{ color: hex }}
                        >
                          {stmt.suspect}:
                        </span>
                        <p className="text-sm sm:text-base text-[var(--text-mid)] leading-relaxed italic">
                          &ldquo;{stmt.text}&rdquo;
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 7. Accusation / Result */}
              {!gameOver ? (
                <div className="space-y-4">
                  <h2
                    className="text-sm font-bold uppercase tracking-[0.25em]"
                    style={{ color: "#DC143C" }}
                  >
                    Make Your Accusation
                  </h2>

                  {accusationResult && !accusationResult.correct && (
                    <div className="rounded-lg px-4 py-3 border border-[oklch(0.55_0.22_27/30%)] bg-[oklch(0.40_0.15_27/10%)] text-sm text-[oklch(0.70_0.15_27)]">
                      Wrong accusation. Study the clues again and try once more.
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <AccusationSelect
                      label="WHO?"
                      value={accusation.who}
                      onChange={(v) =>
                        setAccusation((prev) => ({ ...prev, who: v }))
                      }
                      options={game.suspects.map((s) => ({
                        value: s.name,
                        label: s.name,
                        color:
                          SUSPECT_COLORS[s.color] ?? s.color,
                      }))}
                      placeholder="Select suspect..."
                    />
                    <AccusationSelect
                      label="HOW?"
                      value={accusation.how}
                      onChange={(v) =>
                        setAccusation((prev) => ({ ...prev, how: v }))
                      }
                      options={game.weapons.map((w) => ({
                        value: w.name,
                        label: w.name,
                      }))}
                      placeholder="Select weapon..."
                    />
                    <AccusationSelect
                      label="WHERE?"
                      value={accusation.where}
                      onChange={(v) =>
                        setAccusation((prev) => ({ ...prev, where: v }))
                      }
                      options={game.locations.map((l) => ({
                        value: l.name,
                        label: l.name,
                      }))}
                      placeholder="Select location..."
                    />
                    <AccusationSelect
                      label="WHY?"
                      value={accusation.why}
                      onChange={(v) =>
                        setAccusation((prev) => ({ ...prev, why: v }))
                      }
                      options={game.motives.map((m) => ({
                        value: m.name,
                        label: m.name,
                      }))}
                      placeholder="Select motive..."
                    />
                  </div>

                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={handleAccuse}
                      disabled={!canAccuse || isAccusing}
                      className={[
                        "px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] rounded-lg transition-all duration-200",
                        "text-white border",
                        canAccuse && !isAccusing
                          ? "bg-[#8B0000] border-[#DC143C]/40 hover:bg-[#A00000] shadow-[0_0_20px_oklch(0.35_0.22_15/0.3)]"
                          : "bg-[#4a0000] border-[#DC143C]/15 opacity-50 cursor-not-allowed",
                      ].join(" ")}
                    >
                      {isAccusing ? (
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Accusing...
                        </span>
                      ) : (
                        "Make Your Accusation"
                      )}
                    </button>

                    <button
                      onClick={handleGiveUp}
                      disabled={isGivingUp}
                      className="px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] rounded-lg transition-all duration-200 text-[var(--text-dim)] border border-[var(--bd)] hover:text-[var(--text-mid)] hover:border-[var(--bd-strong)]"
                    >
                      {isGivingUp ? "Giving up..." : "Give Up"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {game.solved ? (
                    <div className="rounded-xl px-5 py-4 border border-[oklch(0.45_0.12_145/30%)] bg-[oklch(0.25_0.08_145/15%)] space-y-2">
                      <p className="text-sm font-bold text-[oklch(0.72_0.15_145)] uppercase tracking-wide">
                        Correct! You solved the mystery.
                      </p>
                      <p className="text-xs text-[var(--text-lo)]">
                        Your accusation:{" "}
                        <span className="text-[var(--text-mid)]">
                          {game.playerAccusation?.who}
                        </span>{" "}
                        with the{" "}
                        <span className="text-[var(--text-mid)]">
                          {game.playerAccusation?.how}
                        </span>{" "}
                        in the{" "}
                        <span className="text-[var(--text-mid)]">
                          {game.playerAccusation?.where}
                        </span>
                        , motivated by{" "}
                        <span className="text-[var(--text-mid)]">
                          {game.playerAccusation?.why}
                        </span>
                        .
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-xl px-5 py-4 border border-[oklch(0.45_0.12_27/30%)] bg-[oklch(0.25_0.08_27/15%)] space-y-1">
                      <p className="text-sm font-bold text-[oklch(0.65_0.22_27)] uppercase tracking-wide">
                        The mystery remains unsolved.
                      </p>
                      <p className="text-xs text-[var(--text-lo)]">
                        The full solution has been revealed below.
                      </p>
                    </div>
                  )}

                  {revealedSolution && (
                    <SolutionReveal
                      solution={revealedSolution}
                      game={game}
                    />
                  )}

                  {/* ── Detective's Closing Narrative ── */}
                  <div
                    className="rounded-xl border overflow-hidden"
                    style={{
                      background: "var(--card-surface-2)",
                      borderColor: "var(--bd-strong)",
                    }}
                  >
                    {/* Header */}
                    <div
                      className="flex items-center gap-2 px-5 py-3 border-b"
                      style={{ borderColor: "var(--bd)" }}
                    >
                      <span className="text-base">🪶</span>
                      <span
                        className="text-[9px] font-bold uppercase tracking-[0.22em]"
                        style={{ color: "var(--text-lo)" }}
                      >
                        Detective&apos;s Closing Notes
                      </span>
                    </div>

                    {/* Body */}
                    <div className="px-5 py-4">
                      {narrativeLoading && !narrative ? (
                        <div className="space-y-2 animate-pulse">
                          {[80, 95, 70, 88].map((w, i) => (
                            <div
                              key={i}
                              style={{
                                height: 10,
                                width: `${w}%`,
                                borderRadius: 4,
                                background: "var(--bd-strong)",
                              }}
                            />
                          ))}
                        </div>
                      ) : narrative ? (
                        <div className="space-y-3">
                          {(() => {
                            // Client-side safety: normalise escape seqs & unwrap JSON if backend slipped
                            let text = narrative.replace(/\\n/g, '\n').trim();
                            if (text.startsWith('{') || text.startsWith('"')) {
                              try {
                                const parsed = JSON.parse(text);
                                const findStr = (o: unknown): string | null => {
                                  if (typeof o === 'string') return o;
                                  if (o && typeof o === 'object') {
                                    for (const v of Object.values(o)) {
                                      const f = findStr(v); if (f) return f;
                                    }
                                  }
                                  return null;
                                };
                                text = findStr(parsed)?.replace(/\\n/g, '\n') ?? text;
                              } catch { /* use as-is */ }
                            }
                            const paras = text.split(/\n+/).filter(Boolean);
                            return paras.map((para, i) => (
                              <p
                                key={i}
                                className="text-[12px] leading-relaxed"
                                style={{
                                  color: i === 0 ? "var(--text-mid)" : "var(--text-lo)",
                                  fontStyle: i === paras.length - 1 ? "italic" : "normal",
                                }}
                              >
                                {para}
                              </p>
                            ));
                          })()}
                        </div>
                      ) : (
                        <p className="text-[11px] text-[var(--text-dim)]">
                          Narrative unavailable.
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => router.push("/whodunit")}
                    className="px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] rounded-lg transition-all duration-200 bg-[#DC143C]/10 text-[#DC143C] border border-[#DC143C]/25 hover:bg-[#DC143C]/20"
                  >
                    Play Again
                  </button>
                </div>
              )}
            </div>

            {/* ── RIGHT COLUMN: Sticky Deduction Grid (desktop only) ── */}
            <div className="hidden lg:block w-[390px] flex-shrink-0">
              <div className="lg:sticky lg:top-20">
                <div
                  className="rounded-xl border p-4"
                  style={{
                    background: "var(--card-surface-2)",
                    borderColor: "var(--bd)",
                    backdropFilter: "blur(16px)",
                  }}
                >
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--text-dim)] mb-3">
                    Deduction Grid
                  </h2>
                  <DeductionGrid
                    game={game}
                    grid={grid}
                    onChange={handleGridChange}
                    disabled={gameOver}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile: Floating grid button ── */}
      {!gridModalOpen && (
        <button
          onClick={() => setGridModalOpen(true)}
          className="lg:hidden fixed bottom-5 right-4 z-40 flex items-center gap-2 px-4 py-3 rounded-full text-xs font-bold uppercase tracking-[0.15em] shadow-lg transition-all duration-200"
          style={{
            background: "var(--card-surface)",
            border: "1px solid oklch(0.55 0.18 15 / 40%)",
            color: "#DC143C",
            backdropFilter: "blur(12px)",
            boxShadow: "0 0 20px oklch(0.35 0.22 15 / 0.25)",
          }}
        >
          <span style={{ fontSize: 16 }}>🔍</span>
          Grid
        </button>
      )}

      {/* ── Mobile: Grid modal (full-screen so 358px grid fits without scroll) ── */}
      {gridModalOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex flex-col"
          style={{ background: "var(--background)" }}
        >
          {/* Header bar */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
            style={{ borderColor: "var(--bd)" }}
          >
            <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--text-dim)]">
              Deduction Grid
            </h2>
            <button
              onClick={() => setGridModalOpen(false)}
              className="text-[var(--text-dim)] hover:text-[var(--text-mid)] transition-colors text-xl leading-none px-1"
            >
              ✕
            </button>
          </div>
          {/* Grid centered, no outer padding so it never overflows */}
          <div className="flex-1 flex items-center justify-center overflow-hidden p-2">
            <DeductionGrid
              game={game}
              grid={grid}
              onChange={handleGridChange}
              disabled={gameOver}
            />
          </div>
        </div>
      )}
    </>
  );
}

// ── Hint Panel ───────────────────────────────────────────────────────────────

function useCountdown(targetIso: string | null | undefined): string | null {
  const [label, setLabel] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!targetIso) { setLabel(null); return; }
    const tick = () => {
      const diff = new Date(targetIso).getTime() - Date.now();
      if (diff <= 0) { setLabel(null); return; }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setLabel(`${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetIso]);
  return label;
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function GameTimer({ game }: { game: MurdleGame }) {
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (game.solved || game.givenUp) return;
    const tick = () => setElapsed(Date.now() - new Date(game.createdAt).getTime());
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [game.createdAt, game.solved, game.givenUp]);

  if (game.solved && game.solvedAt) {
    const dur = new Date(game.solvedAt).getTime() - new Date(game.createdAt).getTime();
    return (
      <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "oklch(0.65 0.14 145)" }}>
        <CheckCircle2 size={13} />
        Solved in {formatDuration(dur)}
      </span>
    );
  }
  if (game.givenUp && game.givenUpAt) {
    const dur = new Date(game.givenUpAt).getTime() - new Date(game.createdAt).getTime();
    return (
      <span className="flex items-center gap-1.5 text-xs font-semibold text-[oklch(0.60_0.18_27)]">
        <XCircle size={13} />
        Unsolved after {formatDuration(dur)}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-lo)]">
      <Timer size={13} />
      {formatDuration(elapsed)}
    </span>
  );
}

function HintCard({
  n,
  game,
  hints,
  loading,
  onReveal,
}: {
  n: number;
  game: MurdleGame;
  hints: string[];
  loading: number | null;
  onReveal: (n: number) => void;
}) {
  const availableAt = game.hintsAvailableAt?.[n];
  const countdown = useCountdown(availableAt && !hints[n] ? availableAt : null);
  const prevRevealed = n === 0 || !!hints[n - 1];
  const isRevealed = !!hints[n];
  const isLocked = !prevRevealed || (!!availableAt && Date.now() < new Date(availableAt).getTime());
  const isLoading = loading === n;

  const labels = ["Hint I", "Hint II", "Hint III"];
  const subtitles = ["Subtle", "Helpful", "Almost obvious"];

  return (
    <div
      className="rounded-xl border p-4 space-y-3 transition-all duration-200"
      style={{
        background: isRevealed
          ? "oklch(0.50 0.12 15 / 8%)"
          : "var(--card-surface)",
        borderColor: isRevealed
          ? "oklch(0.55 0.18 15 / 30%)"
          : "var(--bd)",
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: isRevealed ? "#DC143C" : "var(--text-dim)" }}>
            {labels[n]}
          </p>
          <p className="text-[10px] text-[var(--text-dim)]">{subtitles[n]}</p>
        </div>

        {!isRevealed && (
          isLocked ? (
            <span className="text-[10px] text-[var(--text-dim)] font-mono">
              {!prevRevealed ? "Reveal previous hint first" : countdown ? `🔒 ${countdown}` : "..."}
            </span>
          ) : (
            <button
              onClick={() => onReveal(n)}
              disabled={isLoading}
              className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] rounded-lg border border-[#DC143C]/30 bg-[#DC143C]/10 text-[#DC143C] hover:bg-[#DC143C]/20 disabled:opacity-50 transition-all"
            >
              {isLoading ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 border border-[#DC143C]/30 border-t-[#DC143C] rounded-full animate-spin" />
                  Revealing…
                </span>
              ) : "Reveal"}
            </button>
          )
        )}
      </div>

      {isRevealed && (
        <p className="text-sm text-[var(--text-mid)] leading-relaxed italic border-t border-[var(--bd)] pt-3">
          &ldquo;{hints[n]}&rdquo;
        </p>
      )}
    </div>
  );
}

function AccusationSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; color?: string }[];
  placeholder: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-lo)]">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={[
          "w-full rounded-lg px-3 py-2.5 text-sm border transition-colors",
          "bg-[var(--inp-bg)] border-[var(--bd)]",
          "text-[var(--text-hi)] focus:outline-none",
          "focus:border-[oklch(0.55_0.15_15/50%)]",
          "appearance-none cursor-pointer",
        ].join(" ")}
        style={
          value
            ? {
                color:
                  options.find((o) => o.value === value)?.color ??
                  "var(--text-hi)",
              }
            : undefined
        }
      >
        <option value="" className="text-[var(--text-dim)] bg-[var(--inp-bg)]">
          {placeholder}
        </option>
        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            className="bg-[var(--inp-bg)] text-[var(--text-hi)]"
          >
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
