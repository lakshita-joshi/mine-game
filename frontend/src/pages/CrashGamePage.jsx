import React, { useState } from "react";
import { Rocket, ShieldCheck } from "lucide-react";
import NavBar from "../components/layout/NavBar.jsx";
import { useCrashSocket } from "../hooks/useCrashSocket.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function CrashGamePage() {
  const [stake, setStake] = useState(10);
  const {
    connected, phase, serverSeedHash, liveMultiplier,
    crashResult, myBet, myCashout, error, placeBet, cashOut,
  } = useCrashSocket();

  function handleCashOut() {
    cashOut();
  }

  return (
    <div className="min-h-screen w-full bg-abyss p-4 text-ice sm:p-8">
      <div className="mx-auto max-w-3xl">
        <NavBar />

        <div className="mt-6 rounded-2xl border border-panel-border bg-panel p-8 text-center">
          <div className="mb-2 flex items-center justify-center gap-2 font-mono text-xs text-muted">
            <ShieldCheck size={14} className="text-sonar" />
            {serverSeedHash ? `${serverSeedHash.slice(0, 12)}…` : "connecting…"}
          </div>

          <div
            className={`font-mono text-6xl font-bold ${
              phase === "crashed" ? "text-breach" : "text-sonar"
            }`}
          >
            {phase === "crashed" ? `${crashResult?.crashPoint.toFixed(2)}x` : `${liveMultiplier.toFixed(2)}x`}
          </div>

          <div className="mt-2 font-mono text-xs uppercase tracking-wide text-muted">
            {!connected && "Connecting…"}
            {connected && phase === "betting" && "Place your bet — round starting soon"}
            {connected && phase === "running" && "Cash out before it crashes"}
            {connected && phase === "crashed" && "Crashed — next round starting"}
          </div>

          {phase === "crashed" && crashResult && (
            <p className="mt-3 font-mono text-[11px] text-muted-dim">
              Server seed revealed: {crashResult.serverSeed.slice(0, 16)}…
            </p>
          )}
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-breach bg-[#0A1626] px-4 py-3 font-mono text-sm text-breach">
            {error}
          </p>
        )}

        <div className="mt-4 rounded-2xl border border-panel-border bg-panel p-5">
          {phase === "betting" && !myBet && (
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={stake}
                min={1}
                onChange={(e) => setStake(Math.max(1, Number(e.target.value) || 0))}
                className="w-32 rounded-lg border border-tile-idle-border bg-abyss-edge px-3 py-2 text-center font-mono text-sm text-ice outline-none focus-visible:border-sonar"
              />
              <button
                onClick={() => placeBet(stake)}
                className="flex-1 rounded-xl bg-gradient-to-b from-sonar to-sonar-deep py-3 font-display text-sm font-semibold uppercase tracking-wide text-[#03101F]"
              >
                <Rocket size={16} className="mr-2 inline" />
                Place bet
              </button>
            </div>
          )}

          {phase === "betting" && myBet && (
            <p className="text-center font-mono text-sm text-muted">
              Bet placed — {stake} coins. Waiting for round to start…
            </p>
          )}

          {phase === "running" && myBet && !myCashout && (
            <button
              onClick={handleCashOut}
              className="w-full rounded-xl bg-ice py-3 font-display text-sm font-semibold uppercase tracking-wide text-[#03101F]"
            >
              Cash out at {liveMultiplier.toFixed(2)}x
            </button>
          )}

          {phase === "running" && myBet && myCashout && (
            <p className="text-center font-mono text-sm text-sonar">
              Cashed out at {myCashout.multiplier.toFixed(2)}x — +{myCashout.payout} coins
            </p>
          )}

          {phase === "running" && !myBet && (
            <p className="text-center font-mono text-sm text-muted-dim">
              Round already running — wait for the next one.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}