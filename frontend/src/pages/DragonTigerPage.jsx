import React, { useState } from "react";
import NavBar from "../components/layout/NavBar.jsx";
import BottomNav from "../components/layout/BottomNav.jsx";
import Badge from "../components/ui/Badge.jsx";
import PlayingCard from "../components/teenpatti/PlayingCard.jsx";
import { dragonTigerApi } from "../api/minesApi.js";
import { useAuth } from "../context/AuthContext.jsx";

const BETS = ["dragon", "tiger", "tie"];
const OUTCOMES = {
  dragon: { label: "🐉 Dragon Wins!", color: "text-gold" },
  tiger:  { label: "🐯 Tiger Wins!",  color: "text-info" },
  tie:    { label: "🤝 Tie!",         color: "text-win"  },
};

export default function DragonTigerPage() {
  const { user, setCoins } = useAuth();

  const [betAmounts, setBetAmounts] = useState({ dragon: 10, tiger: 10, tie: 10 });
  const [phase,   setPhase]   = useState("idle");   // idle | dealing | result
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState("");

  async function handleDeal() {
    setError("");
    const totalBet = Object.values(betAmounts).reduce((a, b) => a + b, 0);
    if (totalBet <= 0 || totalBet > (user?.coins ?? 0)) {
      setError("Insufficient balance");
      return;
    }
    setPhase("dealing");
    setResult(null);
    try {
      const clientSeed = Math.random().toString(36).slice(2);
      const data = await dragonTigerApi.play({ ...betAmounts, clientSeed });
      setResult(data);
      if (data.newBalance !== undefined) setCoins(data.newBalance);
      setPhase("result");
    } catch (err) {
      setError(err.message || "Deal failed");
      setPhase("idle");
    }
  }

  function handlePlayAgain() {
    setPhase("idle");
    setResult(null);
  }

  const outcome = result ? OUTCOMES[result.winner] : null;

  return (
    <div className="min-h-screen w-full bg-void pb-20 sm:pb-0">
      <NavBar />

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-chalk">🐉 Dragon Tiger</h1>
            <p className="mt-0.5 font-mono text-xs text-fog">One card each — higher card wins</p>
          </div>
          <Badge variant="live" pulse>Live</Badge>
        </div>

        {/* Card table */}
        <div className="relative overflow-hidden rounded-2xl border border-rim bg-elevated">
          {/* Felt gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0A1A10]/60 via-[#0D1117] to-[#0A100A]/60" />       

          {/* Cards area */}
          <div className="relative flex flex-col items-center gap-8 py-10 sm:flex-row sm:justify-center sm:gap-20">
            {/* Dragon side */}
            <div className="flex flex-col items-center gap-3">
              <span className="font-mono text-xs uppercase tracking-widest text-fog">Dragon</span>
              <PlayingCard card={result?.dragonCard} hidden={phase !== "result"} />
              {result?.dragonCard && (
                <span className="font-mono text-xs text-gold">
                  {result.dragonCard.rank}{result.dragonCard.suit}
                </span>
              )}
            </div>

            {/* VS badge */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-rim bg-raised font-display text-xs font-bold text-silver">
              VS
            </div>

            {/* Tiger side */}
            <div className="flex flex-col items-center gap-3">
              <span className="font-mono text-xs uppercase tracking-widest text-fog">Tiger</span>
              <PlayingCard card={result?.tigerCard} hidden={phase !== "result"} />
              {result?.tigerCard && (
                <span className="font-mono text-xs text-info">
                  {result.tigerCard.rank}{result.tigerCard.suit}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bet controls */}
        <div className="mt-5 rounded-2xl border border-rim bg-elevated p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-chalk">Place Your Bets</h2>
            <span className="font-mono text-xs text-fog">
              Balance:{" "}
              <span className="text-gold">{(user?.coins ?? 0).toLocaleString()}</span>
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {BETS.map((side) => (
              <div key={side} className="flex flex-col gap-1.5">
                <label className="font-mono text-xs capitalize tracking-wider text-fog">
                  {side === "tie" ? "🤝 Tie (8×)" : side === "dragon" ? "🐉 Dragon" : "🐯 Tiger"}
                </label>
                <input
                  type="number"
                  value={betAmounts[side]}
                  min={0}
                  disabled={phase === "dealing"}
                  onChange={(e) =>
                    setBetAmounts((prev) => ({
                      ...prev,
                      [side]: Math.max(0, Number(e.target.value) || 0),
                    }))
                  }
                  className="w-full rounded-xl border border-rim bg-base px-3 py-2.5 text-center font-mono text-sm font-semibold text-chalk outline-none transition-colors focus-visible:border-gold/60 focus-visible:ring-1 focus-visible:ring-gold/20 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            ))}
          </div>

          {error && (
            <div className="mt-3 rounded-xl border border-loss/30 bg-loss/5 px-4 py-2.5">
              <p className="font-mono text-xs text-loss">{error}</p>
            </div>
          )}

          <button
            onClick={handleDeal}
            disabled={phase === "dealing"}
            className={[
              "mt-4 w-full rounded-xl py-3.5 font-display text-sm font-semibold uppercase tracking-wide transition-all active:scale-[0.97]",
              phase === "dealing"
                ? "cursor-not-allowed bg-raised text-fog"
                : "cursor-pointer bg-gradient-to-r from-gold to-gold-deep text-void shadow-[0_0_16px_rgba(245,200,66,0.25)] hover:shadow-[0_0_26px_rgba(245,200,66,0.42)]",
            ].join(" ")}
          >
            {phase === "dealing" ? "Dealing…" : "Deal Cards"}
          </button>
        </div>
      </main>

      <BottomNav />
      {/* Result panel — shown at the bottom after a deal resolves */}
        {phase === "result" && outcome && (
          <div className="mt-5 rounded-2xl border border-rim bg-elevated p-6 text-center">
            <p className={`font-display text-3xl font-bold ${outcome.color}`}>
              {outcome.label}
            </p>
            {result.payout > 0 ? (
              <p className="mt-2 font-mono text-xl font-bold text-win">
                +{result.payout.toLocaleString()} coins!
              </p>
            ) : (
              <p className="mt-2 font-mono text-base text-fog">Better luck next time</p>
            )}
            <button
              onClick={handlePlayAgain}
              className="mt-5 rounded-xl border border-rim bg-elevated px-6 py-2.5 font-display text-sm font-semibold text-chalk transition-all hover:border-gold/30 hover:text-gold"
            >
              Play Again
            </button>
          </div>
        )}

        <BottomNav />
    </div>
  );
}