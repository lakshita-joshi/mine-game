import React from "react";
import Tile from "./Tile.jsx";
import { GRID_SIZE, GRID_COLS } from "../../utils/gameMath.js";

export default function GridPanel({ revealed, mines, hitTile, status, onReveal }) {
  const busted = status === "busted";

  return (
    <div className="relative order-1 overflow-hidden rounded-2xl border border-panel-border bg-panel p-5 lg:order-2">
      <div className="sonar-sweep animate-sweep-rotate" aria-hidden="true" />

      <div
        className="relative mx-auto grid gap-2"
        style={{ gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`, maxWidth: 420 }}
      >
        {Array.from({ length: GRID_SIZE }, (_, idx) => {
          const isRevealed = revealed.includes(idx);
          const isMine = mines.has(idx);
          const isHit = hitTile === idx;
          const showAsMine = busted && isMine;

          return (
            <Tile
              key={idx}
              idx={idx}
              isRevealed={isRevealed}
              showAsMine={showAsMine}
              isHit={isHit}
              disabled={status !== "active" || isRevealed}
              onClick={() => onReveal(idx)}
            />
          );
        })}
      </div>
    </div>
  );
}
