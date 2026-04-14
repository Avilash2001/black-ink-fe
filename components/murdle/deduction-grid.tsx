"use client";

import React, { useCallback, useMemo, useState } from "react";
import { MurdleGame } from "@/lib/api/murdle";

// "x_auto" = auto-placed by check propagation (grey, lower precedence)
// "x"      = manually placed by user (purple, higher precedence)
type CellState = "" | "x" | "x_auto" | "check" | "suspicion";
const CYCLE: CellState[] = ["", "x", "check", "suspicion"]; // x_auto NOT in cycle
type GridPrefix = "weapon" | "location" | "motive" | "suspect";

interface GridItem { name: string; color?: string; }

const SUSPECT_COLORS: Record<string, string> = {
  crimson: "#DC143C",
  blue: "#4169E1",
  gold: "#DAA520",
  magenta: "#FF00FF",
};

// ── Emoji helpers ─────────────────────────────────────────────────────────────

function getEmojiRaw(name: string, prefix: GridPrefix): string {
  const n = name.toLowerCase();
  if (prefix === "suspect") return "🕵️";
  if (prefix === "weapon") {
    if (
      n.includes("dagger") ||
      n.includes("knife") ||
      n.includes("blade") ||
      n.includes("sword")
    )
      return "🗡️";
    if (
      n.includes("opener") ||
      n.includes("stiletto") ||
      n.includes("lancet") ||
      n.includes("scalpel")
    )
      return "🔪";
    if (
      n.includes("poison") ||
      n.includes("tincture") ||
      n.includes("vial") ||
      n.includes("toxin") ||
      n.includes("elixir")
    )
      return "🧪";
    if (
      n.includes("syringe") ||
      n.includes("injection") ||
      n.includes("needle")
    )
      return "💉";
    if (
      n.includes("gun") ||
      n.includes("pistol") ||
      n.includes("revolver") ||
      n.includes("rifle")
    )
      return "🔫";
    if (
      n.includes("rope") ||
      n.includes("garrote") ||
      n.includes("wire") ||
      n.includes("cord") ||
      n.includes("string")
    )
      return "🪢";
    if (n.includes("chain")) return "🔗";
    if (n.includes("candlestick") || n.includes("candle")) return "🕯️";
    if (n.includes("axe") || n.includes("hatchet") || n.includes("cleaver"))
      return "🪓";
    if (n.includes("wrench") || n.includes("spanner")) return "🔧";
    if (n.includes("lead pipe") || n.includes("pipe")) return "🔩";
    if (
      n.includes("hammer") ||
      n.includes("mallet") ||
      n.includes("club") ||
      n.includes("bludgeon") ||
      n.includes("bat")
    )
      return "🔨";
    if (n.includes("iron bar") || n.includes("iron rod")) return "🪛";
    if (n.includes("arrow") || n.includes("bow")) return "🏹";
    if (n.includes("book") || n.includes("tome")) return "📚";
    if (
      n.includes("crystal") ||
      n.includes("gem") ||
      n.includes("stone") ||
      n.includes("paperweight")
    )
      return "💎";
    if (n.includes("bottle") || n.includes("flask") || n.includes("decanter"))
      return "🍾";
    if (n.includes("vase") || n.includes("urn")) return "🏺";
    if (n.includes("pen") || n.includes("quill")) return "🖊️";
    if (n.includes("scissors") || n.includes("shears")) return "✂️";
    if (
      n.includes("statuette") ||
      n.includes("figurine") ||
      n.includes("statue")
    )
      return "🗿";
    if (n.includes("clock") || n.includes("watch")) return "⌚";
    if (n.includes("brass") || n.includes("bronze")) return "🥉";
    if (n.includes("iron") || n.includes("metal")) return "🪝";
    if (
      n.includes("silk") ||
      n.includes("scarf") ||
      n.includes("cravat") ||
      n.includes("tie")
    )
      return "🧣";
    return "⚔️";
  }
  if (prefix === "location") {
    if (n.includes("library") || n.includes("study") || n.includes("archive"))
      return "📚";
    if (
      n.includes("garden") ||
      n.includes("maze") ||
      n.includes("hedge") ||
      n.includes("greenhouse")
    )
      return "🌿";
    if (n.includes("kitchen") || n.includes("pantry") || n.includes("dining"))
      return "🍽️";
    if (n.includes("observatory") || n.includes("telescope")) return "🔭";
    if (
      n.includes("cellar") ||
      n.includes("wine") ||
      n.includes("basement") ||
      n.includes("vault")
    )
      return "🍷";
    if (
      n.includes("ballroom") ||
      n.includes("salon") ||
      n.includes("grand hall")
    )
      return "🏛️";
    if (n.includes("bedroom") || n.includes("chamber") || n.includes("suite"))
      return "🛏️";
    if (n.includes("lab")) return "🔬";
    if (n.includes("chapel") || n.includes("church") || n.includes("cathedral"))
      return "⛪";
    if (n.includes("tower") || n.includes("turret") || n.includes("roof"))
      return "🗼";
    if (n.includes("golf") || n.includes("course")) return "⛳";
    if (
      n.includes("boat") ||
      n.includes("dock") ||
      n.includes("harbor") ||
      n.includes("pier")
    )
      return "⛵";
    if (n.includes("stable") || n.includes("barn")) return "🐎";
    if (n.includes("gallery") || n.includes("museum")) return "🖼️";
    if (
      n.includes("chateau") ||
      n.includes("castle") ||
      n.includes("manor") ||
      n.includes("fortress")
    )
      return "🏰";
    if (n.includes("forest") || n.includes("woods")) return "🌲";
    if (n.includes("pool") || n.includes("bath")) return "🏊";
    if (n.includes("corridor") || n.includes("hall") || n.includes("passage"))
      return "🚪";
    if (n.includes("clock tower")) return "🕰️";
    return "🏠";
  }
  if (n.includes("jealous") || n.includes("envy") || n.includes("rage"))
    return "💚";
  if (
    n.includes("greed") ||
    n.includes("money") ||
    n.includes("fortune") ||
    n.includes("wealth") ||
    n.includes("inherit")
  )
    return "💰";
  if (
    n.includes("debt") ||
    n.includes("unpaid") ||
    n.includes("owe") ||
    n.includes("bankrupt")
  )
    return "💸";
  if (
    n.includes("revenge") ||
    n.includes("vengeance") ||
    n.includes("vendetta")
  )
    return "⚔️";
  if (
    n.includes("love") ||
    n.includes("affair") ||
    n.includes("romance") ||
    n.includes("passion")
  )
    return "❤️";
  if (n.includes("power") || n.includes("ambition") || n.includes("control"))
    return "👑";
  if (
    n.includes("blackmail") ||
    n.includes("silence") ||
    n.includes("spy") ||
    n.includes("eliminate")
  )
    return "🕵️";
  if (n.includes("secret") || n.includes("expose") || n.includes("conceal"))
    return "🤫";
  if (n.includes("fear") || n.includes("protect") || n.includes("survival"))
    return "🛡️";
  if (n.includes("honor") || n.includes("pride") || n.includes("reputation"))
    return "🏆";
  if (
    n.includes("patent") ||
    n.includes("stolen") ||
    n.includes("theft") ||
    n.includes("steal") ||
    n.includes("invention")
  )
    return "📜";
  return "🎭";
}

const WEAPON_FALLBACKS = [
  "⚔️",
  "🔪",
  "🗡️",
  "🪃",
  "🪖",
  "🧨",
  "💣",
  "🪤",
  "🔩",
  "🪛",
];
const LOCATION_FALLBACKS = [
  "🏠",
  "🏡",
  "🏚️",
  "🏗️",
  "🗺️",
  "🧭",
  "🌉",
  "🏟️",
  "🏪",
  "🏫",
];
const MOTIVE_FALLBACKS = [
  "🎭",
  "🎪",
  "🎯",
  "🎲",
  "🎰",
  "🃏",
  "🎴",
  "🎬",
  "🎩",
  "🎸",
];
const SUSPECT_FALLBACKS = [
  "🕵️",
  "👤",
  "🧑",
  "👩",
  "🧔",
  "👳",
  "🎩",
  "🦹",
  "🧛",
  "🧟",
];

function buildEmojiMap(
  names: string[],
  prefix: GridPrefix,
): Map<string, string> {
  const map = new Map<string, string>();
  const used = new Set<string>();
  const fallbacks =
    prefix === "weapon"
      ? WEAPON_FALLBACKS
      : prefix === "location"
        ? LOCATION_FALLBACKS
        : prefix === "suspect"
          ? SUSPECT_FALLBACKS
          : MOTIVE_FALLBACKS;
  let fi = 0;
  for (const name of names) {
    let e = getEmojiRaw(name, prefix);
    if (used.has(e)) {
      while (fi < fallbacks.length && used.has(fallbacks[fi])) fi++;
      e = fi < fallbacks.length ? fallbacks[fi++] : "❓";
    }
    used.add(e);
    map.set(name, e);
  }
  return map;
}

// ── Cell symbol ───────────────────────────────────────────────────────────────

function CellSymbol({ state, size }: { state: CellState; size: number }) {
  const fs = Math.max(10, size * 0.45);
  if (state === "check")
    return <span style={{ color: "#22c55e", fontWeight: 800, fontSize: fs, lineHeight: 1, userSelect: "none" }}>✓</span>;
  // User-placed x — purple, bold
  if (state === "x")
    return <span style={{ color: "#a855f7", fontWeight: 800, fontSize: fs, lineHeight: 1, userSelect: "none" }}>✗</span>;
  // Auto-placed x from check propagation — dim grey
  if (state === "x_auto")
    return <span style={{ color: "var(--text-lo)", fontWeight: 700, fontSize: fs, lineHeight: 1, userSelect: "none" }}>✗</span>;
  if (state === "suspicion")
    return <span style={{ color: "#f97316", fontWeight: 800, fontSize: fs, lineHeight: 1, userSelect: "none" }}>?</span>;
  return null;
}

function makeKey(rp: GridPrefix, ri: string, cp: GridPrefix, ci: string) {
  return `${rp}_${ri}_${cp}_${ci}`;
}

function parseKey(key: string): {
  rowPrefix: GridPrefix;
  rowItem: string;
  colPrefix: GridPrefix;
  colItem: string;
} | null {
  const prefixes: GridPrefix[] = ["weapon", "location", "motive", "suspect"];
  for (const rp of prefixes) {
    if (!key.startsWith(rp + "_")) continue;
    const afterRow = key.slice(rp.length + 1);
    for (const cp of prefixes) {
      if (cp === rp) continue;
      const delim = "_" + cp + "_";
      const idx = afterRow.indexOf(delim);
      if (idx !== -1) {
        return {
          rowPrefix: rp,
          rowItem: afterRow.slice(0, idx),
          colPrefix: cp,
          colItem: afterRow.slice(idx + delim.length),
        };
      }
    }
  }
  return null;
}

interface TooltipInfo {
  name: string;
  emoji: string;
  color?: string;
  label: string;
}

interface Props {
  game: MurdleGame;
  grid: Record<string, string>;
  onChange: (grid: Record<string, string>) => void;
  disabled?: boolean;
}

export default function DeductionGrid({
  game,
  grid,
  onChange,
  disabled,
}: Props) {
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);

  //
  // ── Layout constants ─────────────────────────────────────────────────────
  //
  // Grid has 12 col items (4 suspects + 4 motives + 4 locations)
  // and 12 row items (4 weapons + 4 locations + 4 motives).
  // We add: category-strip col (left), emoji-header col (left),
  //         category-label row (top), emoji-header row (top).
  //
  // Cell size is chosen so the whole grid is ~square and compact.
  //
  const CELL = 26; // px — one data cell
  const EMO_HDR = 28; // px — emoji header column/row
  const CAT_LBL = 14; // px — category strip / label
  const SEP = 2; // px — thick separator between groups
  const N_SEPS = 2; // two separators in col axis (suspects|motives|locations)
  // two separators in row axis (weapons|locations|motives)

  const totalColItems = colGroupDefs(game).reduce(
    (s, g) => s + g.items.length,
    0,
  );
  const totalRowItems = rowGroupDefs(game).reduce(
    (s, g) => s + g.items.length,
    0,
  );

  // Build emoji maps
  const emojiMaps = useMemo(
    () => ({
      suspect: buildEmojiMap(
        game.suspects.map((s) => s.name),
        "suspect",
      ),
      weapon: buildEmojiMap(
        game.weapons.map((w) => w.name),
        "weapon",
      ),
      location: buildEmojiMap(
        game.locations.map((l) => l.name),
        "location",
      ),
      motive: buildEmojiMap(
        game.motives.map((m) => m.name),
        "motive",
      ),
    }),
    [game],
  );

  const categoryItems: Record<GridPrefix, string[]> = useMemo(
    () => ({
      weapon: game.weapons.map((w) => w.name),
      location: game.locations.map((l) => l.name),
      motive: game.motives.map((m) => m.name),
      suspect: game.suspects.map((s) => s.name),
    }),
    [game],
  );

  const handleCell = useCallback(
    (key: string) => {
      const raw = (grid[key] ?? "") as CellState;
      // Auto-placed cells are locked — user cannot cycle them
      if (raw === "x_auto") return;
      const current = raw;
      const next = CYCLE[(CYCLE.indexOf(current) + 1) % CYCLE.length];
      const newGrid = { ...grid };
      if (next === "") {
        delete newGrid[key];
      } else {
        newGrid[key] = next;
      }

      const parts = parseKey(key);
      if (parts) {
        const { rowPrefix, rowItem, colPrefix, colItem } = parts;

        if (next === "check") {
          // Auto-mark siblings as x_auto — don't overwrite check, user-x, or suspicion (?)
          const noOverwrite = new Set(["check", "x", "suspicion"]);
          for (const item of categoryItems[colPrefix] ?? []) {
            if (item !== colItem) {
              const k = makeKey(rowPrefix, rowItem, colPrefix, item);
              if (!noOverwrite.has(newGrid[k] ?? "")) newGrid[k] = "x_auto";
            }
          }
          for (const item of categoryItems[rowPrefix] ?? []) {
            if (item !== rowItem) {
              const k = makeKey(rowPrefix, item, colPrefix, colItem);
              if (!noOverwrite.has(newGrid[k] ?? "")) newGrid[k] = "x_auto";
            }
          }
        } else if (raw === "check") {
          // Cycling away from check — only clear x_auto, preserve user-placed x
          for (const item of categoryItems[colPrefix] ?? []) {
            if (item !== colItem) {
              const k = makeKey(rowPrefix, rowItem, colPrefix, item);
              if (newGrid[k] === "x_auto") delete newGrid[k];
            }
          }
          for (const item of categoryItems[rowPrefix] ?? []) {
            if (item !== rowItem) {
              const k = makeKey(rowPrefix, item, colPrefix, colItem);
              if (newGrid[k] === "x_auto") delete newGrid[k];
            }
          }
        }
      }

      onChange(newGrid);
    },
    [grid, onChange, categoryItems],
  );

  const rowGroups = rowGroupDefs(game);
  const colGroups = colGroupDefs(game);

  const isBlank = (rp: GridPrefix, cp: GridPrefix) =>
    rp === cp || (rp === "motive" && cp === "location");

  // Fixed computed sizes
  const gridW = CAT_LBL + EMO_HDR + totalColItems * CELL + N_SEPS * SEP;
  const gridH = CAT_LBL + EMO_HDR + totalRowItems * CELL + N_SEPS * SEP;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Hover toolbar */}
      <div
        style={{
          height: 28,
          display: "flex",
          alignItems: "center",
          gap: 7,
          marginBottom: 6,
          padding: "0 4px",
          borderRadius: 6,
          background: tooltip ? "var(--bd)" : "transparent",
          transition: "background 0.15s",
          overflow: "hidden",
        }}
      >
        {tooltip ? (
          <>
            <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>
              {tooltip.emoji}
            </span>
            <span
              style={{
                fontSize: 8,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--text-lo)",
                flexShrink: 0,
              }}
            >
              {tooltip.label}
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: tooltip.color ?? "var(--text-hi)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {tooltip.name}
            </span>
          </>
        ) : (
          <span
            style={{
              fontSize: 8,
              color: "var(--text-lo)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Hover item to see name
          </span>
        )}
        {/* Click to cycle + Reset live in toolbar row on the right */}
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {!tooltip && (
            <span style={{ fontSize: 8, color: "var(--text-lo)" }}>
              Click to cycle
            </span>
          )}
          {!disabled && Object.keys(grid).some((k) => grid[k]) && (
            <button
              onClick={() => onChange({})}
              title="Reset grid"
              style={{
                fontSize: 8,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--text-lo)",
                border: "1px solid var(--bd-strong)",
                borderRadius: 4,
                padding: "2px 6px",
                background: "transparent",
                cursor: "pointer",
                lineHeight: 1.4,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#DC143C"; e.currentTarget.style.borderColor = "rgba(220,20,60,0.4)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-lo)"; e.currentTarget.style.borderColor = "var(--bd-strong)"; }}
            >
              Reset
            </button>
          )}
        </span>
      </div>

      {/* Legend — symbols only, fits in one line */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontSize: 8,
            color: "var(--text-lo)",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            fontWeight: 600,
          }}
        >
          Legend:
        </span>
        {[
          ["✓", "#22c55e", "Confirmed"],
          ["✗", "#a855f7", "Eliminated"],
          ["✗", "var(--text-lo)", "Auto-elim"],
          ["?", "#f97316", "Suspicious"],
        ].map(([sym, col, lbl]) => (
          <span
            key={lbl}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              fontSize: 9,
            }}
          >
            <span style={{ color: col, fontWeight: 800 }}>{sym}</span>
            <span style={{ color: "var(--text-lo)" }}>{lbl}</span>
          </span>
        ))}
      </div>

      {/* Grid — fixed pixel size, no overflow */}
      <div style={{ width: gridW, height: gridH, flexShrink: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", width: gridW }}>
          {/* ── Row 1: Column category group labels ── */}
          <div
            style={{
              display: "flex",
              height: CAT_LBL,
              marginLeft: CAT_LBL + EMO_HDR,
            }}
          >
            {colGroups.map((cg, cgi) => (
              <div
                key={cg.prefix}
                style={{
                  width: cg.items.length * CELL + (cgi > 0 ? SEP : 0),
                  paddingLeft: cgi > 0 ? SEP : 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    fontSize: 6.5,
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "var(--text-lo)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {cg.label}
                </span>
              </div>
            ))}
          </div>

          {/* ── Row 2: Column emoji headers ── */}
          <div
            style={{
              display: "flex",
              height: EMO_HDR,
              marginLeft: CAT_LBL + EMO_HDR,
            }}
          >
            {colGroups.map((cg, cgi) => (
              <div
                key={cg.prefix}
                style={{
                  display: "flex",
                  marginLeft: cgi > 0 ? SEP : 0,
                  borderLeft:
                    cgi > 0
                      ? `${SEP}px solid var(--bd-strong)`
                      : undefined,
                }}
              >
                {cg.items.map((item, ci) => {
                  const color = item.color
                    ? (SUSPECT_COLORS[item.color] ?? item.color)
                    : undefined;
                  const emoji = emojiMaps[cg.prefix].get(item.name) ?? "?";
                  return (
                    <div
                      key={item.name}
                      title={item.name}
                      onMouseEnter={() =>
                        setTooltip({
                          name: item.name,
                          emoji,
                          color,
                          label: cg.label.slice(0, -1),
                        })
                      }
                      onMouseLeave={() => setTooltip(null)}
                      style={{
                        width: CELL,
                        height: EMO_HDR,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "default",
                        borderLeft:
                          ci > 0
                            ? "1px solid var(--bd)"
                            : undefined,
                      }}
                    >
                      <span style={{ fontSize: CELL * 0.6, lineHeight: 1 }}>
                        {emoji}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* ── Row groups ── */}
          {rowGroups.map((rg, rgi) => (
            <div
              key={rg.prefix}
              style={{
                display: "flex",
                marginTop: rgi > 0 ? SEP : 0,
                borderTop:
                  rgi > 0 ? `${SEP}px solid var(--bd-strong)` : undefined,
              }}
            >
              {/* Category label strip */}
              <div
                style={{
                  width: CAT_LBL,
                  height: rg.items.length * CELL,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontSize: 6,
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--text-lo)",
                    writingMode: "vertical-rl",
                    transform: "rotate(180deg)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {rg.label}
                </span>
              </div>

              {/* Row items */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                {rg.items.map((rowItem, ri) => {
                  const rowColor = rowItem.color
                    ? (SUSPECT_COLORS[rowItem.color] ?? rowItem.color)
                    : undefined;
                  const rowEmoji =
                    emojiMaps[rg.prefix].get(rowItem.name) ?? "?";
                  return (
                    <div
                      key={rowItem.name}
                      style={{
                        display: "flex",
                        height: CELL,
                        borderTop:
                          ri > 0
                            ? "1px solid var(--bd)"
                            : undefined,
                      }}
                    >
                      {/* Row emoji header */}
                      <div
                        title={rowItem.name}
                        onMouseEnter={() =>
                          setTooltip({
                            name: rowItem.name,
                            emoji: rowEmoji,
                            color: rowColor,
                            label: rg.label.slice(0, -1),
                          })
                        }
                        onMouseLeave={() => setTooltip(null)}
                        style={{
                          width: EMO_HDR,
                          height: CELL,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          cursor: "default",
                        }}
                      >
                        <span style={{ fontSize: CELL * 0.6, lineHeight: 1 }}>
                          {rowEmoji}
                        </span>
                      </div>

                      {/* Cells per col group */}
                      {colGroups.map((cg, cgi) => {
                        const blank = isBlank(rg.prefix, cg.prefix);
                        return (
                          <div
                            key={cg.prefix}
                            style={{
                              display: "flex",
                              marginLeft: cgi > 0 ? SEP : 0,
                              borderLeft:
                                cgi > 0
                                  ? `${SEP}px solid var(--bd-strong)`
                                  : undefined,
                            }}
                          >
                            {blank ? (
                              <div
                                style={{
                                  width: cg.items.length * CELL,
                                  height: CELL,
                                  background: "var(--cell-blank)",
                                }}
                              />
                            ) : (
                              cg.items.map((colItem, ci) => {
                                const key = makeKey(
                                  rg.prefix,
                                  rowItem.name,
                                  cg.prefix,
                                  colItem.name,
                                );
                                const state = (grid[key] ?? "") as CellState;
                                const bg =
                                  state === "check"
                                    ? "rgba(34,197,94,0.15)"
                                    : state === "x"
                                      ? "rgba(168,85,247,0.12)"
                                      : state === "suspicion"
                                        ? "rgba(249,115,22,0.12)"
                                        : "transparent";
                                return (
                                  <button
                                    key={colItem.name}
                                    onClick={() => !disabled && handleCell(key)}
                                    disabled={disabled}
                                    title={`${rowItem.name} / ${colItem.name}`}
                                    onMouseEnter={(e) => {
                                      if (!disabled)
                                        (
                                          e.currentTarget as HTMLButtonElement
                                        ).style.background =
                                          state === "check"
                                            ? "rgba(34,197,94,0.26)"
                                            : state === "suspicion"
                                              ? "rgba(249,115,22,0.22)"
                                              : "var(--bd)";
                                    }}
                                    onMouseLeave={(e) => {
                                      (
                                        e.currentTarget as HTMLButtonElement
                                      ).style.background = bg;
                                    }}
                                    style={{
                                      width: CELL,
                                      height: CELL,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      background: bg,
                                      border: "none",
                                      borderLeft:
                                        ci > 0
                                          ? "1px solid var(--bd)"
                                          : undefined,
                                      cursor: disabled || state === "x_auto" ? "default" : "pointer",
                                      outline: "none",
                                      transition: "background 0.1s",
                                      flexShrink: 0,
                                    }}
                                  >
                                    <CellSymbol state={state} size={CELL} />
                                  </button>
                                );
                              })
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

type GroupDef = { prefix: GridPrefix; items: GridItem[]; label: string };

function rowGroupDefs(game: MurdleGame): GroupDef[] {
  return [
    { prefix: "weapon",   items: game.weapons   as GridItem[], label: "WEAPONS"   },
    { prefix: "location", items: game.locations as GridItem[], label: "LOCATIONS" },
    { prefix: "motive",   items: game.motives   as GridItem[], label: "MOTIVES"   },
  ];
}

function colGroupDefs(game: MurdleGame): GroupDef[] {
  return [
    { prefix: "suspect",  items: game.suspects.map(s => ({ name: s.name, color: s.color })), label: "SUSPECTS"  },
    { prefix: "motive",   items: game.motives   as GridItem[], label: "MOTIVES"   },
    { prefix: "location", items: game.locations as GridItem[], label: "LOCATIONS" },
  ];
}
