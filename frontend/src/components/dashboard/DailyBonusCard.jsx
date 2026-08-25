import React, { useState } from "react";
import { Gift, Flame } from "lucide-react";
import { walletApi } from "../../api/minesApi.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function DailyBonusCard() {
  const { setCoins } = useAuth();
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

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
    <div className="rounded-2xl border border-panel-border bg-panel p-5">
      <div className="flex items-center gap-2">
        <Gift size={18} className="text-sonar" strokeWidth={1.75} />
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-ice">
          Daily bonus
        </h3>
      </div>

      {status === "claimed" ? (
        <div className="mt-3">
          <p className="font-mono text-lg font-bold text-sonar">+{result.bonus} coins</p>
          <p className="mt-1 flex items-center gap-1 font-mono text-xs text-muted">
            <Flame size={12} className="text-sonar" />
            {result.newStreak} day streak
          </p>
        </div>
      ) : (
        <>
          <p className="mt-2 font-mono text-xs text-muted">
            Claim once every 24 hours. Keep your streak alive for bigger bonuses, up to 7 days.
          </p>
          {error && <p className="mt-2 font-mono text-xs text-breach">{error}</p>}
          <button
            onClick={handleClaim}
            disabled={status === "claiming"}
            className={`mt-3 w-full rounded-xl py-2.5 font-display text-xs font-semibold uppercase tracking-wide transition-transform active:scale-95 ${
              status === "claiming"
                ? "cursor-not-allowed bg-tile-idle text-muted-dim"
                : "cursor-pointer bg-gradient-to-b from-sonar to-sonar-deep text-[#03101F]"
            }`}
          >
            {status === "claiming" ? "Claiming…" : "Claim bonus"}
          </button>
        </>
      )}
    </div>
  );
}