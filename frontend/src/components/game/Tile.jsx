import React from "react";
import { Gem, Zap } from "lucide-react";

export default function Tile({ idx, isRevealed, showAsMine, isHit, disabled, onClick }) {
  const flipped = isRevealed || showAsMine;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={
        isRevealed   ? `Tile ${idx + 1}, safe`
        : showAsMine ? `Tile ${idx + 1}, mine`
        :              `Tile ${idx + 1}, hidden`
      }
      className={[
        "tile-flip relative aspect-square rounded-xl",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold",
        !disabled && !flipped ? "hover:scale-[1.05] transition-transform duration-100" : "",
        disabled && !flipped   ? "cursor-not-allowed" : "cursor-pointer",
      ].join(" ")}
    >
      <div
        className="tile-inner"
        style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >
        {/* Front — hidden */}
        <div
          className={[
            "tile-face flex items-center justify-center rounded-xl border transition-colors",
            !disabled && !flipped
              ? "border-rim bg-raised hover:border-gold/30"
              : "border-rim bg-raised",
          ].join(" ")}
        >
          <div className="h-2 w-2 rounded-full bg-rim" />
        </div>

        {/* Back — revealed */}
        <div
          className={[
            "tile-face tile-face-back flex items-center justify-center rounded-xl border",
            showAsMine ? "border-loss/40 bg-loss/10" : "border-win/30 bg-win/8",
          ].join(" ")}
          style={{
            boxShadow: isHit
              ? "0 0 22px 2px rgba(239,68,68,0.35)"
              : isRevealed
              ? "0 0 12px 0 rgba(34,197,94,0.22)"
              : "none",
          }}
        >
          {showAsMine ? (
            <Zap size={18} strokeWidth={2} className="text-loss" />
          ) : (
            <Gem size={18} strokeWidth={1.75} className="text-win" />
          )}
        </div>
      </div>
    </button>
  );
}
