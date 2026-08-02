import React from "react";

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
    <div className="order-3 flex flex-col rounded-2xl border border-panel-border bg-panel p-5">
      <div className="mb-3 font-mono text-xs uppercase tracking-wide text-muted">
        Depth gauge
      </div>

      <div className="flex max-h-[260px] flex-col gap-1 overflow-y-auto pr-1">
        {depthSteps.map((step) => {
          const isCurrent = step.k === currentStep && status === "active";
          const isPast = step.k <= currentStep;
          return (
            <div
              key={step.k}
              className={`flex items-center justify-between rounded-lg px-3 py-1.5 transition-colors ${
                isCurrent ? "border border-sonar bg-sonar/10" : "border border-transparent"
              }`}
            >
              <span className={`font-mono text-xs ${isPast ? "text-ice" : "text-muted-dim"}`}>
                {step.depth}m
              </span>
              <span
                className={`font-mono text-sm ${
                  isCurrent ? "font-bold text-sonar" : isPast ? "font-medium text-ice" : "font-medium text-muted-dim"
                }`}
              >
                {step.mult.toFixed(2)}x
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 border-t border-panel-border pt-4">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-muted">Multiplier</span>
          <span className="font-mono text-lg font-bold text-ice">
            {currentMultiplier.toFixed(2)}x
          </span>
        </div>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-xs text-muted">Payout</span>
          <span className="font-mono text-lg font-bold text-sonar">
            {potentialPayout.toLocaleString()}
          </span>
        </div>

        <button
          onClick={onCashOut}
          disabled={!canCashOut}
          className={`mt-4 w-full rounded-xl py-3 font-display text-sm font-semibold uppercase tracking-wide transition-transform active:scale-95 ${
            canCashOut
              ? "cursor-pointer bg-ice text-[#03101F]"
              : "cursor-not-allowed bg-tile-idle text-muted-dim"
          }`}
        >
          Surface & cash out
        </button>
      </div>
    </div>
  );
}
