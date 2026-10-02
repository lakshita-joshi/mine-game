import React, { useState } from "react";
import NavBar from "../components/layout/NavBar.jsx";
import BottomNav from "../components/layout/BottomNav.jsx";
import Badge from "../components/ui/Badge.jsx";
import { useCrashSocket } from "../hooks/useCrashSocket.js";
import { useAuth } from "../context/AuthContext.jsx";

function CrashHistory({ history }) {
  if (!history?.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {history.slice(-14).map((val, i) => {
        const x = parseFloat(val);
        const color =
          x >= 2
            ? "border-win/30 bg-win/8 text-win"
            : x >= 1.5
            ? "border-gold/30 bg-gold/8 text-gold"
            : "border-loss/30 bg-loss/8 text-loss";
        return (
          <span
            key={i}
            className={`rounded-lg border px-2.5 py-1 font-mono text-xs font-semibold ${color}`}
          >
            {x.toFixed(2)}×
          </span>
        );
      })}
    </div>
  );
}

export default function CrashGamePage() {
  const { user, setCoins } = useAuth();
  const [stake, setStake] = useState(10);
  const [showSeed, setShowSeed] = useState(false);

  const {
    connected,
    phase,
    multiplier,
    liveMultiplier,
    crashResult,
    myBet,
    hasBet,
    myCashout,
    history,
    serverSeedHash,
    error,
    placeBet,
    cashOut,
  } = useCrashSocket(setCoins);

  const currentMultiplier =
    phase === "crashed" && crashResult?.crashPoint
      ? crashResult.crashPoint
      : multiplier ?? liveMultiplier ?? 1.0;

  const isRunning = phase === "running";
  const isBetting = phase === "betting";
  const canBet = isBetting && !hasBet;
  const canPlaceBet = canBet && stake > 0 && stake <= (user?.coins ?? 0);

  const multColor =
    phase === "crashed"
      ? "text-loss"
      : isRunning
      ? "text-win"
      : "text-chalk";

  return (
    <div className="min-h-screen w-full bg-void pb-20 sm:pb-0">
      <NavBar />

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-chalk">🚀 Crash</h1>
            <p className="mt-0.5 font-mono text-xs text-fog">
              Cash out before the rocket crashes
            </p>
          </div>
          <Badge variant={connected ? "live" : "coming"} pulse={connected}>
            {connected ? "Live" : "Connecting"}
          </Badge>
        </div>

        {/* Multiplier display */}
        <div className="relative mb-5 flex min-h-[200px] items-center justify-center overflow-hidden rounded-2xl border border-rim bg-elevated sm:min-h-[260px]">
          {/* Ambient glow behind multiplier */}
          <div
            className={`absolute inset-0 transition-opacity duration-700 ${
              isRunning ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-win/5 blur-3xl" />
          </div>

          {phase === "crashed" && <div className="absolute inset-0 bg-loss/5" />}

          <div className="relative text-center">
            <div
              className={`font-display text-7xl font-bold sm:text-8xl ${multColor} transition-colors`}
              style={{
                textShadow: isRunning
                  ? "0 0 40px rgba(34,197,94,0.4)"
                  : phase === "crashed"
                  ? "0 0 40px rgba(239,68,68,0.3)"
                  : "none",
              }}
            >
              {currentMultiplier.toFixed(2)}×
            </div>
            <div className="mt-2 font-mono text-sm uppercase tracking-widest text-fog">
              {phase === "connecting" && "Connecting to game server…"}
              {isBetting && (hasBet ? "Bet placed! Waiting for launch…" : "Place your bets…")}
              {isRunning && (myCashout ? `Cashed out at ${myCashout.multiplier.toFixed(2)}×!` : "🚀 Rocket is flying!")}
              {phase === "crashed" &&
                (crashResult
                  ? `💥 Crashed at ${crashResult.crashPoint.toFixed(2)}×!`
                  : "💥 Crashed!")}
            </div>
          </div>
        </div>

        {/* History row */}
        <div className="mb-5">
          <p className="mb-2 font-mono text-xs uppercase tracking-wider text-fog">
            Recent rounds
          </p>
          <CrashHistory history={history} />
        </div>

        {/* Bet controls */}
        <div className="rounded-2xl border border-rim bg-elevated p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <div className="mb-1.5 flex items-center justify-between">
                <label className="font-mono text-xs uppercase tracking-wider text-fog">
                  Bet Amount
                </label>
                <span className="font-mono text-xs text-fog">
                  Balance:{" "}
                  <span className="font-semibold text-gold">
                    {(user?.coins ?? 0).toLocaleString()}
                  </span>
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={stake}
                  min={1}
                  max={user?.coins ?? 0}
                  disabled={hasBet}
                  onChange={(e) => setStake(Math.max(1, Number(e.target.value) || 0))}
                  className="w-full rounded-xl border border-rim bg-base px-4 py-3 font-mono text-sm font-semibold text-chalk outline-none transition-colors focus-visible:border-gold/60 focus-visible:ring-1 focus-visible:ring-gold/20 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    ["½", 0.5],
                    ["2×", 2],
                  ].map(([label, factor]) => (
                    <button
                      key={label}
                      type="button"
                      disabled={hasBet}
                      onClick={() =>
                        setStake((s) =>
                          Math.max(1, Math.min(user?.coins ?? s, Math.round(s * factor)))
                        )
                      }
                      className="rounded-xl border border-rim bg-base px-3 font-mono text-xs text-silver transition-colors hover:border-gold/30 hover:text-gold disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action button */}
            {!hasBet ? (
              <button
                type="button"
                onClick={() => placeBet(stake)}
                disabled={!canPlaceBet}
                className={[
                  "flex-shrink-0 rounded-xl px-8 py-3.5 font-display text-sm font-semibold uppercase tracking-wide transition-all active:scale-[0.97]",
                  canPlaceBet
                    ? "cursor-pointer bg-gradient-to-r from-gold to-gold-deep text-void shadow-[0_0_16px_rgba(245,200,66,0.25)] hover:shadow-[0_0_26px_rgba(245,200,66,0.42)]"
                    : "cursor-not-allowed bg-raised text-fog",
                ].join(" ")}
              >
                {isBetting
                  ? "Place Bet"
                  : isRunning
                  ? "Round in Progress"
                  : "Wait for Next Round"}
              </button>
            ) : (
              <button
                type="button"
                onClick={cashOut}
                disabled={!isRunning || Boolean(myCashout)}
                className={[
                  "flex-shrink-0 rounded-xl px-8 py-3.5 font-display text-sm font-semibold uppercase tracking-wide transition-all active:scale-[0.97]",
                  isRunning && !myCashout
                    ? "animate-pulse-gold cursor-pointer bg-gradient-to-r from-win to-win-deep text-void shadow-[0_0_16px_rgba(34,197,94,0.25)] hover:shadow-[0_0_26px_rgba(34,197,94,0.42)]"
                    : "cursor-not-allowed bg-raised text-fog",
                ].join(" ")}
              >
                {myCashout
                  ? `Cashed Out (+${myCashout.payout})`
                  : isRunning
                  ? `Cash Out (${currentMultiplier.toFixed(2)}×)`
                  : "Bet Placed"}
              </button>
            )}
          </div>

          {error && (
            <p className="mt-3 rounded-xl border border-loss/30 bg-loss/8 px-4 py-2.5 font-mono text-xs text-loss">
              {error}
            </p>
          )}

          {/* Provably fair seed hash */}
          {serverSeedHash && (
            <div className="mt-4 flex items-center gap-2 border-t border-rim pt-4">
              <span className="font-mono text-xs text-fog">Server seed hash:</span>
              <button
                type="button"
                onClick={() => setShowSeed((s) => !s)}
                className="font-mono text-xs text-fog transition-colors hover:text-silver"
              >
                {showSeed ? serverSeedHash : `${serverSeedHash.slice(0, 16)}…`}
              </button>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}