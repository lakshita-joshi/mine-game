import React from "react";
import { Minus, Plus, Anchor } from "lucide-react";

export default function ControlsPanel({
  stake,
  setStake,
  mineCount,
  setMineCount,
  balance,
  status,
  onStart,
}) {
  const disabled = status === "active";
  const canStart = !disabled && stake > 0 && stake <= balance;

  return (
    <div className="order-2 flex flex-col gap-5 rounded-2xl border border-panel-border bg-panel p-5 lg:order-1">
      <div>
        <label className="font-mono text-xs uppercase tracking-wide text-muted">Stake</label>
        <div className="mt-2 flex items-center gap-2">
          <StepButton
            disabled={disabled}
            onClick={() => setStake((s) => Math.max(1, s - 5))}
            icon={<Minus size={14} />}
          />
          <input
            type="number"
            value={stake}
            min={1}
            max={balance}
            disabled={disabled}
            onChange={(e) => setStake(Math.max(1, Number(e.target.value) || 0))}
            className="w-full rounded-lg border border-tile-idle-border bg-abyss-edge py-2 text-center font-mono text-sm text-ice outline-none focus-visible:border-sonar"
          />
          <StepButton
            disabled={disabled}
            onClick={() => setStake((s) => Math.min(balance, s + 5))}
            icon={<Plus size={14} />}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="font-mono text-xs uppercase tracking-wide text-muted">Mines</label>
          <span className="font-mono text-sm font-semibold text-ice">{mineCount}</span>
        </div>
        <input
          type="range"
          min={1}
          max={24}
          step={1}
          value={mineCount}
          disabled={disabled}
          onChange={(e) => setMineCount(Number(e.target.value))}
          className="mt-2 w-full"
        />
        <div className="mt-1 flex justify-between text-[11px] text-muted-dim">
          <span>1</span>
          <span>24</span>
        </div>
      </div>

      <button
        onClick={onStart}
        disabled={!canStart}
        className={`w-full rounded-xl py-3 font-display text-sm font-semibold uppercase tracking-wide transition-transform active:scale-95 ${
          canStart
            ? "bg-gradient-to-b from-sonar to-sonar-deep text-[#03101F] cursor-pointer"
            : "bg-tile-idle text-muted-dim cursor-not-allowed"
        }`}
      >
        {disabled ? "Dive in progress" : "Start dive"}
      </button>

      <div className="flex items-center gap-2 border-t border-panel-border pt-4 text-xs text-muted">
        <Anchor size={14} className="text-sonar-deep" />
        <span>Safe tiles left this dive: {25 - mineCount}</span>
      </div>
    </div>
  );
}

function StepButton({ disabled, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex h-10 w-8 items-center justify-center rounded-lg border border-tile-idle-border ${
        disabled ? "bg-tile-idle text-muted-dim cursor-not-allowed" : "bg-abyss-edge text-ice"
      }`}
    >
      {icon}
    </button>
  );
}
