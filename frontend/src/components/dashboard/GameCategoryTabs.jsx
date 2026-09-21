import React from "react";

const CATEGORIES = [
  { id: "all",         label: "All Games",    available: true  },
  { id: "crash",       label: "Crash",        available: true  },
  { id: "mines",       label: "Mines",        available: true  },
  { id: "dragontiger", label: "Dragon Tiger", available: true  },
  { id: "teenpatti",   label: "Teen Patti",   available: true  },
  { id: "slots",       label: "Slots",        available: false },
  { id: "roulette",    label: "Roulette",     available: false },
  { id: "blackjack",   label: "Blackjack",    available: false },
  { id: "poker",       label: "Poker",        available: false },
];

export default function GameCategoryTabs({ active, onChange }) {
  return (
    <div className="relative">
      {/* Right fade */}
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-10 bg-gradient-to-l from-void to-transparent" />

      <div
        className="flex gap-2 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => cat.available && onChange(cat.id)}
            disabled={!cat.available}
            className={[
              "flex-shrink-0 rounded-xl px-4 py-2 font-display text-sm font-medium transition-all duration-150",
              active === cat.id
                ? "border border-gold/30 bg-gold/8 text-gold"
                : cat.available
                ? "border border-rim bg-elevated text-silver hover:border-rim-bright hover:text-chalk"
                : "cursor-not-allowed border border-rim/40 bg-elevated/40 text-fog/50",
            ].join(" ")}
          >
            {cat.label}
            {!cat.available && (
              <span className="ml-1.5 font-mono text-[9px] uppercase tracking-wider text-fog/40">
                soon
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
