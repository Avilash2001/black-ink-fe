"use client";

import React, { useCallback } from "react";
import { MurdleGame } from "@/lib/api/murdle";

type CellState = "" | "x" | "check" | "suspicion";

const CYCLE: CellState[] = ["", "x", "check", "suspicion"];

interface Props {
  game: MurdleGame;
  grid: Record<string, string>;
  onChange: (grid: Record<string, string>) => void;
  disabled?: boolean;
}

// Suspect color map
const SUSPECT_COLORS: Record<string, string> = {
  crimson: "#DC143C",
  blue: "#4169E1",
  gold: "#DAA520",
  magenta: "#FF00FF",
};

function abbr(name: string, len = 4): string {
  return name.slice(0, len).toUpperCase();
}

function CellSymbol({ state }: { state: CellState }) {
  if (state === "check")
    return (
      <span className="text-green-400 font-bold leading-none select-none">
        ✓
      </span>
    );
  if (state === "x")
    return (
      <span className="text-[oklch(0.50_0_0)] font-bold leading-none select-none text-xs">
        ✗
      </span>
    );
  if (state === "suspicion")
    return (
      <span className="text-[oklch(0.65_0.22_27)] font-bold leading-none select-none">
        ?
      </span>
    );
  return null;
}

interface SubGridProps {
  rowLabel: string;
  colLabel: string;
  rows: { name: string; color?: string }[];
  cols: { name: string; color?: string }[];
  rowPrefix: string;
  colPrefix: string;
  grid: Record<string, string>;
  onCell: (key: string) => void;
  disabled?: boolean;
}

function SubGrid({
  rowLabel,
  colLabel,
  rows,
  cols,
  rowPrefix,
  colPrefix,
  grid,
  onCell,
  disabled,
}: SubGridProps) {
  const CELL = 22;
  const ROW_HEADER = 52;
  const COL_HEADER = 44;

  return (
    <div className="flex flex-col">
      {/* Sub-grid label row */}
      <div
        className="text-[9px] font-bold uppercase tracking-[0.15em] text-[oklch(0.45_0_0)] mb-1 text-center"
        style={{ marginLeft: ROW_HEADER }}
      >
        {colLabel}
      </div>

      <div className="flex">
        {/* Row label (vertical, rotated) */}
        <div
          className="flex items-center justify-center"
          style={{ width: 14, minHeight: rows.length * CELL + COL_HEADER }}
        >
          <span
            className="text-[9px] font-bold uppercase tracking-[0.15em] text-[oklch(0.45_0_0)] whitespace-nowrap"
            style={{
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
            }}
          >
            {rowLabel}
          </span>
        </div>

        <div className="flex flex-col" style={{ marginLeft: 4 }}>
          {/* Column headers */}
          <div className="flex" style={{ marginLeft: ROW_HEADER }}>
            {cols.map((col) => (
              <div
                key={col.name}
                className="flex items-end justify-center overflow-hidden"
                style={{ width: CELL, height: COL_HEADER }}
              >
                <span
                  className="text-[8px] font-semibold tracking-wide whitespace-nowrap origin-bottom-left"
                  style={{
                    writingMode: "vertical-rl",
                    transform: "rotate(180deg)",
                    color: col.color
                      ? SUSPECT_COLORS[col.color] ?? col.color
                      : "oklch(0.60 0 0)",
                    maxHeight: COL_HEADER,
                    overflow: "hidden",
                  }}
                >
                  {abbr(col.name, 6)}
                </span>
              </div>
            ))}
          </div>

          {/* Rows */}
          {rows.map((row) => (
            <div key={row.name} className="flex items-center">
              {/* Row header */}
              <div
                className="flex items-center justify-end pr-2 shrink-0"
                style={{ width: ROW_HEADER }}
              >
                <span
                  className="text-[8px] font-semibold tracking-wide truncate text-right"
                  style={{
                    color: row.color
                      ? SUSPECT_COLORS[row.color] ?? row.color
                      : "oklch(0.60 0 0)",
                    maxWidth: ROW_HEADER - 8,
                  }}
                >
                  {abbr(row.name, 6)}
                </span>
              </div>

              {/* Cells */}
              {cols.map((col) => {
                const key = `${rowPrefix}_${row.name}_${colPrefix}_${col.name}`;
                const state = (grid[key] ?? "") as CellState;
                return (
                  <button
                    key={col.name}
                    onClick={() => !disabled && onCell(key)}
                    disabled={disabled}
                    className={[
                      "flex items-center justify-center border-r border-b border-[oklch(1_0_0/8%)] transition-colors duration-100",
                      "hover:bg-[oklch(1_0_0/6%)]",
                      state === "check"
                        ? "bg-[oklch(0.30_0.08_145/30%)]"
                        : state === "x"
                          ? "bg-transparent"
                          : state === "suspicion"
                            ? "bg-[oklch(0.45_0.15_27/20%)]"
                            : "bg-[oklch(1_0_0/2%)]",
                      disabled ? "cursor-default" : "cursor-pointer",
                    ].join(" ")}
                    style={{ width: CELL, height: CELL }}
                    title={`${row.name} / ${col.name}`}
                  >
                    <CellSymbol state={state} />
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Parse a cell key into its components.
// Key format: `{rowPrefix}_{rowItem}_{colPrefix}_{colItem}`
// Prefixes are always one of: weapon | location | motive | suspect
function parseKey(key: string) {
  const prefixes = ["weapon", "location", "motive", "suspect"];
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

export default function DeductionGrid({
  game,
  grid,
  onChange,
  disabled,
}: Props) {
  const categoryItems: Record<string, string[]> = {
    weapon: game.weapons.map((w) => w.name),
    location: game.locations.map((l) => l.name),
    motive: game.motives.map((m) => m.name),
    suspect: game.suspects.map((s) => s.name),
  };

  const handleCell = useCallback(
    (key: string) => {
      const current = (grid[key] ?? "") as CellState;
      const idx = CYCLE.indexOf(current);
      const next = CYCLE[(idx + 1) % CYCLE.length];
      const newGrid = { ...grid };

      if (next === "") {
        delete newGrid[key];
      } else {
        newGrid[key] = next;
      }

      // Auto-propagate: when a cell is confirmed (✓), mark every other
      // cell in the same row and column of that sub-grid as ✗.
      if (next === "check") {
        const parts = parseKey(key);
        if (parts) {
          const { rowPrefix, rowItem, colPrefix, colItem } = parts;

          // Same row — all other colItems get ✗
          for (const item of categoryItems[colPrefix] ?? []) {
            if (item === colItem) continue;
            const k = `${rowPrefix}_${rowItem}_${colPrefix}_${item}`;
            if ((newGrid[k] ?? "") !== "check") newGrid[k] = "x";
          }

          // Same column — all other rowItems get ✗
          for (const item of categoryItems[rowPrefix] ?? []) {
            if (item === rowItem) continue;
            const k = `${rowPrefix}_${item}_${colPrefix}_${colItem}`;
            if ((newGrid[k] ?? "") !== "check") newGrid[k] = "x";
          }
        }
      }

      onChange(newGrid);
    },
    [grid, onChange, categoryItems]
  );

  const suspects = game.suspects;
  const weapons = game.weapons;
  const locations = game.locations;
  const motives = game.motives;

  // Add color info for suspects in the grid
  const suspectsWithColor = suspects.map((s) => ({
    name: s.name,
    color: s.color,
  }));

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-0">
        {/* Legend */}
        <div className="flex items-center gap-4 mb-4 flex-wrap">
          <span className="text-[9px] text-[oklch(0.40_0_0)] uppercase tracking-[0.15em] font-semibold">
            Legend:
          </span>
          <span className="flex items-center gap-1 text-[10px] text-green-400">
            <span className="font-bold">✓</span>
            <span className="text-[oklch(0.45_0_0)]">Confirmed</span>
          </span>
          <span className="flex items-center gap-1 text-[10px] text-[oklch(0.50_0_0)]">
            <span className="font-bold">✗</span>
            <span className="text-[oklch(0.45_0_0)]">Eliminated</span>
          </span>
          <span className="flex items-center gap-1 text-[10px] text-[oklch(0.65_0.22_27)]">
            <span className="font-bold">?</span>
            <span className="text-[oklch(0.45_0_0)]">Suspicious</span>
          </span>
          <span className="text-[9px] text-[oklch(0.35_0_0)] ml-auto">
            Click to cycle
          </span>
        </div>

        {/* Grid layout: 2 columns × 3 rows of sub-grids */}
        <div className="flex flex-col gap-6">
          {/* Row 1: Weapons vs Suspects | Weapons vs Locations */}
          <div className="flex gap-6 flex-wrap">
            <SubGrid
              rowLabel="Weapons"
              colLabel="Suspects"
              rows={weapons}
              cols={suspectsWithColor}
              rowPrefix="weapon"
              colPrefix="suspect"
              grid={grid}
              onCell={handleCell}
              disabled={disabled}
            />
            <SubGrid
              rowLabel="Weapons"
              colLabel="Locations"
              rows={weapons}
              cols={locations}
              rowPrefix="weapon"
              colPrefix="location"
              grid={grid}
              onCell={handleCell}
              disabled={disabled}
            />
          </div>

          {/* Row 2: Weapons vs Motives | Locations vs Suspects */}
          <div className="flex gap-6 flex-wrap">
            <SubGrid
              rowLabel="Weapons"
              colLabel="Motives"
              rows={weapons}
              cols={motives}
              rowPrefix="weapon"
              colPrefix="motive"
              grid={grid}
              onCell={handleCell}
              disabled={disabled}
            />
            <SubGrid
              rowLabel="Locations"
              colLabel="Suspects"
              rows={locations}
              cols={suspectsWithColor}
              rowPrefix="location"
              colPrefix="suspect"
              grid={grid}
              onCell={handleCell}
              disabled={disabled}
            />
          </div>

          {/* Row 3: Locations vs Motives | Motives vs Suspects */}
          <div className="flex gap-6 flex-wrap">
            <SubGrid
              rowLabel="Locations"
              colLabel="Motives"
              rows={locations}
              cols={motives}
              rowPrefix="location"
              colPrefix="motive"
              grid={grid}
              onCell={handleCell}
              disabled={disabled}
            />
            <SubGrid
              rowLabel="Motives"
              colLabel="Suspects"
              rows={motives}
              cols={suspectsWithColor}
              rowPrefix="motive"
              colPrefix="suspect"
              grid={grid}
              onCell={handleCell}
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
