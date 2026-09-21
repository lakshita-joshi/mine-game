import React from "react";
import { TrendingUp } from "lucide-react";

export default function DepthGauge({
  depthSteps,
  currentStep,
  status,
  potentialPayout,
  currentMultiplier,
  onCashOut,
  revealedCount,
}) {
  const canCashOut = status === "active" && revealedCount > 0;

  return (
    <div className="order-3 flex flex-col rounded-2xl border border-rim bg-elevated p-5">
      {/* Header */}
      <div className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-fog">
        <TrendingUp size={12} className="text-gold" />
        Multiplier Ladder
      </div>

      {/* Steps */}
      <div className="flex max-h-[260px] flex-col gap-1 overflow-y-auto pr-1">
        {depthSteps.map((step) => {
          const isCurrent = step.k === currentStep && status === "active";
          const isPast    = step.k <= currentStep;
          return (
            <div
              key={step.k}
              className={[
                "flex items-center justify-between rounded-xl px-3 py-2 transition-all",
                isCurrent
                  ? "border border-gold/40 bg-gold/8 shadow-[0_0_8px_rgba(245,200,66,0.12)]"
                  : isPast
                  ? "border border-win/15 bg-win/5"
                  : "border border-transparent",
              ].join(" ")}
            >
              <span className={`font-mono text-xs ${isPast ? "text-chalk" : "text-fog"}`}>
                {step.k} tile{step.k > 1 ? "s" : ""}
              </span>
              <span
                className={[
                  "font-mono text-sm font-semibold",
                  isCurrent ? "text-gold" : isPast ? "text-win" : "text-fog",
                ].join(" ")}
              >
                {step.mult.toFixed(2)}×
              </span>
            </div>
          );
        })}
      </div>

      {/* Summary + cash out */}
      <div className="mt-4 space-y-2 border-t border-rim pt-4">
        <div className="flex items-center justify-between rounded-xl border border-rim bg-base px-4 py-2.5">
          <span className="font-mono text-xs text-fog">Multiplier</span>
          <span className="font-mono text-lg font-bold text-chalk">
            {currentMultiplier.toFixed(2)}×
          </span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-gold/20 bg-gold/5 px-4 py-2.5">
          <span className="font-mono text-xs text-fog">Payout</span>
          <span className="font-mono text-lg font-bold text-gold">
            {potentialPayout.toLocaleString()}
          </span>
        </div>

        <button
          onClick={onCashOut}
          disabled={!canCashOut}
          className={[
            "w-full rounded-xl py-3.5 font-display text-sm font-semibold uppercase tracking-wide transition-all active:scale-[0.97]",
            canCashOut
              ? "cursor-pointer bg-gradient-to-r from-win to-win-deep text-void shadow-[0_0_16px_rgba(34,197,94,0.25)] hover:shadow-[0_0_26px_rgba(34,197,94,0.42)]"
              : "cursor-not-allowed bg-raised text-fog",
          ].join(" ")}
        >
          Cash Out
        </button>
      </div>
    </div>
  );
}
