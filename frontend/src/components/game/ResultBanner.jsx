import React from "react";
import { RotateCcw } from "lucide-react";

export default function ResultBanner({ status, lastPayout, stake, onPlayAgain }) {
  const busted = status === "busted";

  return (
    <div
      className={`mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5 ${
        busted ? "border-breach bg-[#0A1626]" : "border-sonar bg-panel"
      }`}
    >
      <div>
        <div
          className={`font-display text-lg font-bold uppercase tracking-wide ${
            busted ? "text-breach" : "text-sonar"
          }`}
        >
          {busted ? "Hull breach" : "Surfaced safely"}
        </div>
        <div className="mt-1 font-mono text-sm text-muted">
          {busted
            ? `Stake of ${stake.toLocaleString()} lost to the depths`
            : `Payout: ${lastPayout?.toLocaleString()} coins`}
        </div>
      </div>

      <button
        onClick={onPlayAgain}
        className="flex items-center gap-2 rounded-xl border border-tile-idle-border bg-abyss-edge px-4 py-2.5 font-display text-sm font-semibold text-ice"
      >
        <RotateCcw size={14} />
        Dive again
      </button>
    </div>
  );
}
