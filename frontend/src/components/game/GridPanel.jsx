import React from "react";
import Tile from "./Tile.jsx";
import { GRID_SIZE, GRID_COLS } from "../../utils/gameMath.js";

export default function GridPanel({ revealed, mines, hitTile, status, onReveal }) {
  const busted = status === "busted";
  const active  = status === "active";

  return (
    <div className="relative order-1 overflow-hidden rounded-2xl border border-rim bg-elevated p-5 lg:order-2">
      {/* Gold ambient sweep while game is active */}
      {active && <div className="gold-sweep" aria-hidden="true" />}

      {/* Tile grid */}
      <div
        className="relative mx-auto grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
          maxWidth: 440,
        }}
      >
        {Array.from({ length: GRID_SIZE }, (_, idx) => {
          const isRevealed  = revealed.includes(idx);
          const isMine      = mines.has(idx);
          const isHit       = hitTile === idx;
          const showAsMine  = busted && isMine;

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

      {/* Idle overlay */}
      {status === "idle" && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-void/65 backdrop-blur-sm">
          <p className="px-4 text-center font-display text-sm font-semibold text-fog">
            Configure your bet and press{" "}
            <span className="text-gold">Start Game</span> to play
          </p>
        </div>
      )}
    </div>
  );
}
