import React, { useState } from "react";
import { Gift, Flame, Zap } from "lucide-react";
import { walletApi } from "../../api/minesApi.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function DailyBonusCard() {
  const { setCoins } = useAuth();
  const [status, setStatus]   = useState("idle"); // idle | claiming | claimed | error
  const [result, setResult]   = useState(null);
  const [error,  setError]    = useState("");

  async function handleClaim() {
    setStatus("claiming");
    setError("");
    try {
      const res = await walletApi.claimDaily();
      setResult(res);
      setCoins(res.coins);
      setStatus("claimed");
    } catch (err) {
      setError(err.message || "Could not claim bonus");
      setStatus("error");
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-r from-gold/5 to-transparent">
      {/* Ambient glow */}
      <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-gold/10 blur-2xl" />

      <div className="relative flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center">
        {/* Left: icon + info */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-gold/20 bg-gold/10">
            <Gift size={18} className="text-gold" />
          </div>
          <div>
            <h3 className="font-display text-sm font-semibold text-chalk">Daily Bonus</h3>
            {status === "claimed" ? (
              <div className="mt-0.5 flex items-center gap-2">
                <p className="font-mono text-sm font-bold text-gold">+{result.bonus} coins</p>
                <div className="flex items-center gap-1 rounded-full border border-gold/20 bg-gold/10 px-2 py-0.5">
                  <Flame size={10} className="text-gold" />
                  <span className="font-mono text-[10px] text-gold">{result.newStreak}d streak</span>
                </div>
              </div>
            ) : (
              <p className="mt-0.5 font-mono text-xs text-fog">
                Claim once every 24 h · up to 7-day streak
              </p>
            )}
          </div>
        </div>

        {/* Right: CTA */}
        {status !== "claimed" && (
          <button
            onClick={handleClaim}
            disabled={status === "claiming"}
            className={[
              "flex flex-shrink-0 items-center gap-1.5 rounded-xl px-4 py-2.5 font-display text-sm font-semibold transition-all",
              status === "claiming"
                ? "cursor-not-allowed bg-elevated text-fog"
                : "bg-gradient-to-r from-gold to-gold-deep text-void shadow-[0_0_12px_rgba(245,200,66,0.2)] hover:shadow-[0_0_22px_rgba(245,200,66,0.38)]",
            ].join(" ")}
          >
            <Zap size={14} />
            {status === "claiming" ? "Claiming…" : "Claim"}
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="px-5 pb-4">
          <p className="font-mono text-xs text-loss">{error}</p>
        </div>
      )}
    </div>
  );
}