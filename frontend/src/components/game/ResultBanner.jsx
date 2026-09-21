import React from "react";
import { RotateCcw, TrendingUp, X } from "lucide-react";

export default function ResultBanner({ status, lastPayout, stake, onPlayAgain }) {
  const busted = status === "busted";

  return (
    <div
      className={[
        "mt-6 overflow-hidden rounded-2xl border p-5",
        busted ? "border-loss/30 bg-loss/5" : "border-win/30 bg-win/5",
      ].join(" ")}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Result info */}
        <div className="flex items-center gap-3">
          <div
            className={[
              "flex h-10 w-10 items-center justify-center rounded-xl",
              busted ? "bg-loss/15" : "bg-win/15",
            ].join(" ")}
          >
            {busted
              ? <X size={18} className="text-loss" />
              : <TrendingUp size={18} className="text-win" />}
          </div>
          <div>
            <div
              className={[
                "font-display text-base font-bold uppercase tracking-wide",
                busted ? "text-loss" : "text-win",
              ].join(" ")}
            >
              {busted ? "Busted!" : "Cashed Out!"}
            </div>
            <div className="mt-0.5 font-mono text-sm text-silver">
              {busted
                ? `Lost ${stake.toLocaleString()} coins`
                : `Won ${lastPayout?.toLocaleString()} coins`}
            </div>
          </div>
        </div>

        {/* Play again */}
        <button
          onClick={onPlayAgain}
          className="flex items-center gap-2 rounded-xl border border-rim bg-elevated px-5 py-2.5 font-display text-sm font-semibold text-chalk transition-all hover:border-gold/30 hover:text-gold active:scale-[0.97]"
        >
          <RotateCcw size={14} />
          Play Again
        </button>
      </div>
    </div>
  );
}
