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

function SuspectIcon({ color }: { color: string }) {
  const hex = SUSPECT_COLORS[color] ?? color;
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="18" cy="13" r="7" fill={hex} opacity="0.85" />
      <path
        d="M4 34c0-7.732 6.268-14 14-14s14 6.268 14 14"
        stroke={hex}
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}

function CategorySection({
  title,
  items,
}: {
  title: string;
  items: { name: string; description: string }[];
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[oklch(0.45_0_0)]">
        {title}
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => (
          <div
            key={item.name}
            className="glass-card rounded-lg px-3 py-2.5 space-y-0.5"
          >
            <div className="text-xs font-semibold text-[oklch(0.85_0.005_74)] tracking-wide">
              {item.name}
            </div>
            <div className="text-[11px] text-[oklch(0.48_0_0)] leading-snug">
              {item.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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
        <p className="text-[10px] uppercase tracking-[0.2em] text-[oklch(0.50_0_0)] mb-1">
          The Murderer
        </p>
        <p
          className="text-2xl font-bold uppercase tracking-wide"
          style={{ color: murdererColor }}
        >
          {solution.murderer}
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[oklch(0.40_0_0)]">
          Full Assignments
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[oklch(1_0_0/8%)]">
                <th className="text-left py-2 pr-3 text-[oklch(0.40_0_0)] font-semibold tracking-wide uppercase text-[10px]">
                  Suspect
                </th>
                <th className="text-left py-2 pr-3 text-[oklch(0.40_0_0)] font-semibold tracking-wide uppercase text-[10px]">
                  Weapon
                </th>
                <th className="text-left py-2 pr-3 text-[oklch(0.40_0_0)] font-semibold tracking-wide uppercase text-[10px]">
                  Location
                </th>
                <th className="text-left py-2 text-[oklch(0.40_0_0)] font-semibold tracking-wide uppercase text-[10px]">
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
                  className="text-[10px] font-bold uppercase tracking-[0.35em]"
                  style={{
                    color: "#DC143C",
                    textShadow: "0 0 20px oklch(0.45 0.22 15 / 0.4)",
                  }}
                >
                  INKQUEST
                </p>
                <h1
                  className="text-2xl md:text-3xl font-bold uppercase tracking-[0.04em] leading-tight text-[oklch(0.92_0.005_74)]"
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
                <p className="text-sm text-[oklch(0.75_0.01_74)] leading-relaxed italic">
                  {game.intro}
                </p>
                <p className="text-xs text-[oklch(0.42_0_0)] leading-relaxed">
                  Each of the four suspects brought exactly one weapon to one
                  location, and each had exactly one motive. Only one of them is
                  the murderer — and the clues below are enough to prove it.
                </p>
              </div>

              {/* 3. Suspect cards */}
              <div className="space-y-3">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[oklch(0.45_0_0)]">
                  Suspects
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {game.suspects.map((suspect) => {
                    const hex =
                      SUSPECT_COLORS[suspect.color] ?? suspect.color;
                    return (
                      <div
                        key={suspect.name}
                        className="rounded-xl px-4 py-4 space-y-2 border transition-colors"
                        style={{
                          background: `${hex}08`,
                          borderColor: `${hex}25`,
                        }}
                      >
                        <div className="flex items-center gap-2.5">
                          <SuspectIcon color={suspect.color} />
                          <span
                            className="font-bold text-sm uppercase tracking-wide"
                            style={{ color: hex }}
                          >
                            {suspect.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-[oklch(0.52_0_0)] leading-snug">
                          {suspect.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. Weapons / Locations / Motives */}
              <CategorySection title="Weapons" items={game.weapons} />
              <CategorySection title="Locations" items={game.locations} />
              <CategorySection title="Motives" items={game.motives} />

              {/* 5. Clues & Evidence */}
              <div
                className="rounded-xl border px-5 py-5 space-y-3"
                style={{
                  background: "oklch(0.13 0.015 65 / 60%)",
                  borderColor: "oklch(0.55 0.15 15 / 15%)",
                }}
              >
                <h2
                  className="text-xs font-bold uppercase tracking-[0.25em]"
                  style={{ color: "#DC143C" }}
                >
                  Clues &amp; Evidence
                </h2>
                <ul className="space-y-2">
                  {game.clues.map((clue, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-sm text-[oklch(0.78_0.005_74)] leading-relaxed"
                    >
                      <span
                        className="shrink-0 font-bold text-xs mt-0.5"
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
                <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-[oklch(0.55_0.10_280)]">
                  Suspect Statements
                </h2>
                <p className="text-[10px] text-[oklch(0.38_0_0)] italic">
                  Innocent suspects always tell the truth. The killer always
                  lies.
                </p>
                <div className="space-y-3">
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
                          className="shrink-0 text-xs font-bold mt-0.5 uppercase tracking-wide"
                          style={{ color: hex }}
                        >
                          {stmt.suspect}:
                        </span>
                        <p className="text-sm text-[oklch(0.72_0.005_74)] leading-relaxed italic">
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
                    className="text-xs font-bold uppercase tracking-[0.25em]"
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
            <div className="lg:w-auto lg:shrink-0">
              <div className="lg:sticky lg:top-20">
                <div
                  className="rounded-xl border p-4 space-y-3"
                  style={{
                    background: "oklch(0.10 0.012 65 / 80%)",
                    borderColor: "oklch(1 0 0 / 8%)",
                    backdropFilter: "blur(16px)",
                  }}
                >
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-[oklch(0.42_0_0)]">
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
