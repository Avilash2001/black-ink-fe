"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import HomeBar from "@/components/home-bar";
import DeductionGrid from "@/components/murdle/deduction-grid";
import {
  getMurdle,
  accuseMurdle,
  giveUpMurdle,
  updateMurdleGrid,
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
        <p className="text-xs uppercase tracking-[0.2em] text-[oklch(0.50_0_0)] mb-1">
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
        <p className="text-xs uppercase tracking-[0.2em] text-[oklch(0.40_0_0)]">
          Full Assignments
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[oklch(1_0_0/8%)]">
                <th className="text-left py-2.5 pr-4 text-[oklch(0.40_0_0)] font-semibold tracking-wide uppercase text-xs">
                  Suspect
                </th>
                <th className="text-left py-2.5 pr-4 text-[oklch(0.40_0_0)] font-semibold tracking-wide uppercase text-xs">
                  Weapon
                </th>
                <th className="text-left py-2.5 pr-4 text-[oklch(0.40_0_0)] font-semibold tracking-wide uppercase text-xs">
                  Location
                </th>
                <th className="text-left py-2.5 text-[oklch(0.40_0_0)] font-semibold tracking-wide uppercase text-xs">
                  Motive
                </th>
              </tr>
            </thead>
            <tbody>
              {solution.assignments.map((a) => {
                const suspect = game.suspects.find((s) => s.name === a.suspect);
                const color = suspect
                  ? SUSPECT_COLORS[suspect.color] ?? suspect.color
                  : "oklch(0.88 0.005 74)";
                const isMurderer = a.suspect === solution.murderer;
                return (
                  <tr
                    key={a.suspect}
                    className="border-b border-[oklch(1_0_0/5%)]"
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
                    <td className="py-2 pr-3 text-[oklch(0.70_0_0)]">
                      {a.weapon}
                    </td>
                    <td className="py-2 pr-3 text-[oklch(0.70_0_0)]">
                      {a.location}
                    </td>
                    <td className="py-2 text-[oklch(0.70_0_0)]">{a.motive}</td>
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
            <div className="w-6 h-6 border-2 border-[oklch(1_0_0/15%)] border-t-[#DC143C] rounded-full animate-spin mx-auto" />
            <p className="text-sm text-[oklch(0.45_0_0)]">Loading mystery...</p>
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
              onClick={() => router.push("/murdle")}
              className="text-sm text-[oklch(0.60_0_0)] hover:text-[oklch(0.80_0_0)] underline underline-offset-2"
            >
              Back to Murdle
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
                  INKQUEST
                </p>
                <h1
                  className="text-3xl md:text-4xl font-bold uppercase tracking-[0.03em] leading-tight text-[oklch(0.92_0.005_74)]"
                  style={{ fontFamily: "var(--font-story, Georgia, serif)" }}
                >
                  {game.title}
                </h1>
                {(game.solved || game.givenUp) && (
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide mt-1"
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
              </div>

              {/* 2. Intro */}
              <div className="glass-card rounded-xl px-5 py-4 space-y-2">
                <p className="text-base text-[oklch(0.75_0.01_74)] leading-relaxed italic">
                  {game.intro}
                </p>
                <p className="text-sm text-[oklch(0.45_0_0)] leading-relaxed">
                  Each of the four suspects brought exactly one weapon to one
                  location, and each had exactly one motive. Only one of them is
                  the murderer — and the clues below are enough to prove it.
                </p>
              </div>

              {/* 3 & 4. Tabbed card view */}
              <div className="space-y-4">
                {/* Tab nav — Murdle style */}
                <div className="flex items-center flex-wrap gap-y-1">
                  {(["suspects", "weapons", "locations", "motives"] as CardTab[]).map((tab, i) => (
                    <React.Fragment key={tab}>
                      {i > 0 && (
                        <span className="mx-2 text-[oklch(0.30_0_0)] font-bold select-none">•</span>
                      )}
                      <button
                        onClick={() => setActiveCardTab(tab)}
                        className="text-xs font-black uppercase tracking-[0.18em] pb-0.5 border-b-2 transition-all duration-150"
                        style={
                          activeCardTab === tab
                            ? { borderColor: "#DC143C", color: "#DC143C" }
                            : { borderColor: "transparent", color: "oklch(0.42 0 0)" }
                        }
                      >
                        {tab}
                      </button>
                    </React.Fragment>
                  ))}
                </div>

                {/* 2×2 Murdle-style card grid */}
                {(() => {
                  const suspectEmojis = buildEmojiMap(game.suspects.map(s => s.name), "suspect");
                  const weaponEmojis = buildEmojiMap(game.weapons.map(w => w.name), "weapon");
                  const locationEmojis = buildEmojiMap(game.locations.map(l => l.name), "location");
                  const motiveEmojis = buildEmojiMap(game.motives.map(m => m.name), "motive");
                  return (
                    <div className="grid grid-cols-2 gap-4">
                      {activeCardTab === "suspects" && game.suspects.map((s) => {
                        const hex = SUSPECT_COLORS[s.color] ?? s.color;
                        const emoji = suspectEmojis.get(s.name) ?? "🕵️";
                        return (
                          <div key={s.name} className="flex flex-col items-center rounded-2xl border overflow-hidden" style={{ background: "oklch(0.14 0.015 65 / 90%)", borderColor: hex + "40" }}>
                            <div className="flex-1 flex items-center justify-center pt-8 pb-4">
                              <span className="text-7xl select-none" style={{ filter: `drop-shadow(0 0 16px ${hex}70)` }}>{emoji}</span>
                            </div>
                            <div className="w-full px-4 pb-5 pt-2 text-center space-y-1">
                              <p className="font-black uppercase tracking-wider text-sm leading-tight" style={{ color: hex, fontFamily: "monospace" }}>{s.name}</p>
                              <p className="text-[11px] text-[oklch(0.55_0_0)] leading-snug">{s.description}</p>
                            </div>
                          </div>
                        );
                      })}

                      {activeCardTab === "weapons" && game.weapons.map((w) => (
                        <div key={w.name} className="flex flex-col items-center rounded-2xl border border-[oklch(1_0_0/10%)] overflow-hidden" style={{ background: "oklch(0.14 0.015 65 / 90%)" }}>
                          <div className="flex-1 flex items-end justify-center pt-8 pb-3">
                            <span className="text-6xl select-none">{getItemEmoji(w.name, "weapon", weaponEmojis)}</span>
                          </div>
                          <div className="w-full px-4 pb-5 pt-2 text-center space-y-1">
                            <p className="font-black uppercase tracking-wider text-sm leading-tight text-[oklch(0.90_0.005_74)]" style={{ fontFamily: "monospace" }}>{w.name}</p>
                            <p className="text-[11px] text-[oklch(0.55_0_0)] leading-snug">{w.description}</p>
                          </div>
                        </div>
                      ))}

                      {activeCardTab === "locations" && game.locations.map((l) => (
                        <div key={l.name} className="flex flex-col items-center rounded-2xl border border-[oklch(1_0_0/10%)] overflow-hidden" style={{ background: "oklch(0.14 0.015 65 / 90%)" }}>
                          <div className="flex-1 flex items-end justify-center pt-8 pb-3">
                            <span className="text-6xl select-none">{getItemEmoji(l.name, "location", locationEmojis)}</span>
                          </div>
                          <div className="w-full px-4 pb-5 pt-2 text-center space-y-1">
                            <p className="font-black uppercase tracking-wider text-sm leading-tight text-[oklch(0.90_0.005_74)]" style={{ fontFamily: "monospace" }}>{l.name}</p>
                            <p className="text-[11px] text-[oklch(0.55_0_0)] leading-snug">{l.description}</p>
                          </div>
                        </div>
                      ))}

                      {activeCardTab === "motives" && game.motives.map((m) => (
                        <div key={m.name} className="flex flex-col items-center rounded-2xl border border-[oklch(1_0_0/10%)] overflow-hidden" style={{ background: "oklch(0.14 0.015 65 / 90%)" }}>
                          <div className="flex-1 flex items-end justify-center pt-8 pb-3">
                            <span className="text-6xl select-none">{getItemEmoji(m.name, "motive", motiveEmojis)}</span>
                          </div>
                          <div className="w-full px-4 pb-5 pt-2 text-center space-y-1">
                            <p className="font-black uppercase tracking-wider text-sm leading-tight text-[oklch(0.90_0.005_74)]" style={{ fontFamily: "monospace" }}>{m.name}</p>
                            <p className="text-[11px] text-[oklch(0.55_0_0)] leading-snug">{m.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* 5. Clues & Evidence */}
              <div
                className="rounded-xl border px-5 py-5 space-y-3"
                style={{
                  background: "oklch(0.13 0.015 65 / 60%)",
                  borderColor: "oklch(0.55 0.15 15 / 15%)",
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
                      className="flex gap-3 text-base text-[oklch(0.80_0.005_74)] leading-relaxed"
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
                  background: "oklch(0.13 0.015 65 / 60%)",
                  borderColor: "oklch(0.55 0.15 280 / 15%)",
                }}
              >
                <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-[oklch(0.55_0.10_280)]">
                  Suspect Statements
                </h2>
                <p className="text-xs text-[oklch(0.42_0_0)] italic">
                  Innocent suspects always tell the truth. The killer always lies.
                </p>
                <div className="space-y-4">
                  {game.statements.map((stmt, i) => {
                    const suspect = game.suspects.find(
                      (s) => s.name === stmt.suspect
                    );
                    const hex = suspect
                      ? SUSPECT_COLORS[suspect.color] ?? suspect.color
                      : "oklch(0.70 0 0)";
                    return (
                      <div
                        key={i}
                        className="flex gap-3 items-start"
                      >
                        <span
                          className="shrink-0 text-sm font-bold mt-0.5 uppercase tracking-wide"
                          style={{ color: hex }}
                        >
                          {stmt.suspect}:
                        </span>
                        <p className="text-base text-[oklch(0.75_0.005_74)] leading-relaxed italic">
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
                      className="px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] rounded-lg transition-all duration-200 text-[oklch(0.42_0_0)] border border-[oklch(1_0_0/8%)] hover:text-[oklch(0.65_0_0)] hover:border-[oklch(1_0_0/15%)]"
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
                      <p className="text-xs text-[oklch(0.50_0_0)]">
                        Your accusation:{" "}
                        <span className="text-[oklch(0.70_0_0)]">
                          {game.playerAccusation?.who}
                        </span>{" "}
                        with the{" "}
                        <span className="text-[oklch(0.70_0_0)]">
                          {game.playerAccusation?.how}
                        </span>{" "}
                        in the{" "}
                        <span className="text-[oklch(0.70_0_0)]">
                          {game.playerAccusation?.where}
                        </span>
                        , motivated by{" "}
                        <span className="text-[oklch(0.70_0_0)]">
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
                      <p className="text-xs text-[oklch(0.48_0_0)]">
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
                      background: "oklch(0.09 0.018 65 / 85%)",
                      borderColor: "oklch(0.55 0.10 65 / 20%)",
                    }}
                  >
                    {/* Header */}
                    <div
                      className="flex items-center gap-2 px-5 py-3 border-b"
                      style={{ borderColor: "oklch(0.55 0.10 65 / 15%)" }}
                    >
                      <span className="text-base">🪶</span>
                      <span
                        className="text-[9px] font-bold uppercase tracking-[0.22em]"
                        style={{ color: "oklch(0.55 0.12 65)" }}
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
                                background: "oklch(0.22 0.005 65 / 60%)",
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
                                  color: i === 0 ? "oklch(0.78 0.04 65)" : "oklch(0.60 0.02 65)",
                                  fontStyle: i === paras.length - 1 ? "italic" : "normal",
                                }}
                              >
                                {para}
                              </p>
                            ));
                          })()}
                        </div>
                      ) : (
                        <p className="text-[11px] text-[oklch(0.38_0_0)]">
                          Narrative unavailable.
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => router.push("/murdle")}
                    className="px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] rounded-lg transition-all duration-200 bg-[#DC143C]/10 text-[#DC143C] border border-[#DC143C]/25 hover:bg-[#DC143C]/20"
                  >
                    Play Again
                  </button>
                </div>
              )}
            </div>

            {/* ── RIGHT COLUMN: Sticky Deduction Grid ── */}
            <div style={{ width: 390, flexShrink: 0 }}>
              <div className="lg:sticky lg:top-20">
                <div
                  className="rounded-xl border p-4"
                  style={{
                    background: "oklch(0.10 0.012 65 / 80%)",
                    borderColor: "oklch(1 0 0 / 8%)",
                    backdropFilter: "blur(16px)",
                  }}
                >
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-[oklch(0.42_0_0)] mb-3">
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
    </>
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
      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[oklch(0.45_0_0)]">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={[
          "w-full rounded-lg px-3 py-2.5 text-sm border transition-colors",
          "bg-[oklch(0.10_0.01_65)] border-[oklch(1_0_0/10%)]",
          "text-[oklch(0.85_0.005_74)] focus:outline-none",
          "focus:border-[oklch(0.55_0.15_15/50%)] focus:bg-[oklch(0.12_0.01_65)]",
          "appearance-none cursor-pointer",
        ].join(" ")}
        style={
          value
            ? {
                color:
                  options.find((o) => o.value === value)?.color ??
                  "oklch(0.85 0.005 74)",
              }
            : undefined
        }
      >
        <option value="" className="text-[oklch(0.42_0_0)] bg-[oklch(0.10_0.01_65)]">
          {placeholder}
        </option>
        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            className="bg-[oklch(0.10_0.01_65)] text-[oklch(0.85_0.005_74)]"
          >
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
