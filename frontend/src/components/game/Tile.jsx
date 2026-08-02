import React from "react";
import { Gem, Zap } from "lucide-react";

export default function Tile({ idx, isRevealed, showAsMine, isHit, disabled, onClick }) {
  const flipped = isRevealed || showAsMine;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={
        isRevealed
          ? `Tile ${idx + 1}, safe`
          : showAsMine
          ? `Tile ${idx + 1}, mine`
          : `Tile ${idx + 1}, hidden`
      }
      className={`tile-flip relative aspect-square rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-sonar ${
        disabled && !flipped ? "cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      <div
        className="tile-inner"
        style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >
        {/* Front — hidden state */}
        <div className="tile-face flex items-center justify-center rounded-lg border border-tile-idle-border bg-tile-idle">
          <div className="h-2 w-2 rounded-full bg-tile-idle-border" />
        </div>

        {/* Back — revealed state */}
        <div
          className={`tile-face tile-face-back flex items-center justify-center rounded-lg border ${
            showAsMine ? "border-breach bg-[#0A1626]" : "border-glow bg-sonar-deep"
          }`}
          style={{
            boxShadow: isHit
              ? "0 0 18px 2px #DCEEFF"
              : isRevealed
              ? "0 0 10px 0 rgba(95,180,255,0.35)"
              : "none",
          }}
        >
          {showAsMine ? (
            <Zap size={18} strokeWidth={2} className="text-breach" />
          ) : (
            <Gem size={18} strokeWidth={1.75} className="text-ice" />
          )}
        </div>
      </div>
    </button>
  );
}
