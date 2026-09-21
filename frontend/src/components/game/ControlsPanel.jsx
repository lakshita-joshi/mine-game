import React from "react";
import { Minus, Plus, TrendingUp } from "lucide-react";

const QUICK_BETS = [
  { label: "½",   action: (s, bal) => Math.max(1, Math.round(s * 0.5)) },
  { label: "2×",  action: (s, bal) => Math.min(bal, Math.round(s * 2))  },
  { label: "Min", action: (s, bal) => 1                                  },
  { label: "Max", action: (s, bal) => bal                                },
];

export default function ControlsPanel({
  stake, setStake,
  mineCount, setMineCount,
  balance, status, onStart,
}) {
  const disabled = status === "active";
  const canStart = !disabled && stake > 0 && stake <= balance;

  function applyQuick(btn) {
    if (!disabled) setStake(btn.action(stake, balance));
  }

  return (
    <div className="order-2 flex flex-col gap-5 rounded-2xl border border-rim bg-elevated p-5 lg:order-1">

      {/* Balance display */}
      <div className="flex items-center justify-between rounded-xl border border-rim bg-base px-4 py-2.5">
        <span className="font-mono text-xs text-fog">Balance</span>
        <span className="font-mono text-sm font-semibold text-chalk">
          {balance.toLocaleString()}{" "}
          <span className="text-gold">coins</span>
        </span>
      </div>

      {/* Stake */}
      <div>
        <label className="font-mono text-xs uppercase tracking-wider text-fog">Bet Amount</label>
        <div className="mt-2 flex items-center gap-2">
          <button
            disabled={disabled}
            onClick={() => setStake((s) => Math.max(1, s - 5))}
            className="flex h-10 w-9 items-center justify-center rounded-xl border border-rim bg-base text-silver transition-colors hover:border-rim-bright hover:text-chalk disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus size={14} />
          </button>
          <input
            type="number"
            value={stake}
            min={1}
            max={balance}
            disabled={disabled}
            onChange={(e) =>
              setStake(Math.max(1, Math.min(balance, Number(e.target.value) || 0)))
            }
            className="w-full rounded-xl border border-rim bg-base py-2.5 text-center font-mono text-sm font-semibold text-chalk outline-none transition-colors focus-visible:border-gold/60 focus-visible:ring-1 focus-visible:ring-gold/20 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <button
            disabled={disabled}
            onClick={() => setStake((s) => Math.min(balance, s + 5))}
            className="flex h-10 w-9 items-center justify-center rounded-xl border border-rim bg-base text-silver transition-colors hover:border-rim-bright hover:text-chalk disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Quick-bet buttons */}
        <div className="mt-2 grid grid-cols-4 gap-1.5">
          {QUICK_BETS.map((btn) => (
            <button
              key={btn.label}
              onClick={() => applyQuick(btn)}
              disabled={disabled}
              className="rounded-lg border border-rim bg-base py-1.5 font-mono text-xs text-silver transition-colors hover:border-gold/30 hover:text-gold disabled:cursor-not-allowed disabled:opacity-40"
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mine count */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="font-mono text-xs uppercase tracking-wider text-fog">Mines</label>
          <div className="flex items-center gap-1 rounded-full border border-rim bg-base px-2.5 py-0.5">
            <span className="font-mono text-sm font-bold text-chalk">{mineCount}</span>
            <span className="font-mono text-xs text-fog">/24</span>
          </div>
        </div>
        <input
          type="range"
          min={1}
          max={24}
          step={1}
          value={mineCount}
          disabled={disabled}
          onChange={(e) => setMineCount(Number(e.target.value))}
          className="w-full"
        />
        <div className="mt-1.5 flex justify-between font-mono text-[10px] text-fog">
          <span>Low Risk</span>
          <span>High Risk</span>
        </div>
      </div>

      {/* Safe tiles info */}
      <div className="flex items-center justify-between rounded-xl border border-rim bg-base px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <TrendingUp size={13} className="text-gold" />
          <span className="font-mono text-xs text-fog">Safe tiles</span>
        </div>
        <span className="font-mono text-sm font-semibold text-chalk">{25 - mineCount}</span>
      </div>

      {/* Start button */}
      <button
        onClick={onStart}
        disabled={!canStart}
        className={[
          "w-full rounded-xl py-3.5 font-display text-sm font-semibold uppercase tracking-wide transition-all active:scale-[0.97]",
          canStart
            ? "cursor-pointer bg-gradient-to-r from-gold to-gold-deep text-void shadow-[0_0_16px_rgba(245,200,66,0.25)] hover:shadow-[0_0_26px_rgba(245,200,66,0.42)]"
            : "cursor-not-allowed bg-raised text-fog",
        ].join(" ")}
      >
        {disabled ? "Game in Progress" : "Start Game"}
      </button>
    </div>
  );
}
