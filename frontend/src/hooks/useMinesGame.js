import { useState, useMemo, useCallback, useEffect } from "react";
import { GRID_SIZE, payoutMultiplier, START_BALANCE } from "../utils/gameMath.js";
import { mockMinePositions } from "../utils/mockRng.js";

/**
 * Owns all Mines game state. Runs client-side against mockMinePositions()
 * for local demo purposes.
 */
export function useMinesGame(initialBalance = START_BALANCE, onBalanceChange) {
  const [balance, setBalanceRaw] = useState(initialBalance ?? START_BALANCE);

  useEffect(() => {
    if (typeof initialBalance === "number") {
      setBalanceRaw(initialBalance);
    }
  }, [initialBalance]);

  const setBalance = useCallback(
    (updater) => {
      setBalanceRaw((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        return next;
      });
    },
    []
  );

  const [stake, setStake] = useState(10);
  const [mineCount, setMineCount] = useState(3);

  const [status, setStatus] = useState("idle"); // idle | active | busted | cashed_out
  const [revealed, setRevealed] = useState([]);
  const [mines, setMines] = useState(new Set());
  const [hitTile, setHitTile] = useState(null);
  const [lastPayout, setLastPayout] = useState(null);

  // Placeholder — real value comes from the /start response (serverSeedHash)
  const [seedHash] = useState("8f2a61c…e93d");

  const maxSafeReveals = GRID_SIZE - mineCount;

  const currentMultiplier = useMemo(
    () => payoutMultiplier(GRID_SIZE, mineCount, revealed.length),
    [mineCount, revealed.length]
  );
  const potentialPayout = Math.round(stake * currentMultiplier);

  const depthSteps = useMemo(() => {
    const cap = Math.min(maxSafeReveals, 12);
    return Array.from({ length: cap }, (_, i) => {
      const k = i + 1;
      return { k, depth: k * 20, mult: payoutMultiplier(GRID_SIZE, mineCount, k) };
    });
  }, [mineCount, maxSafeReveals]);

  const startGame = useCallback(() => {
    if (stake <= 0 || stake > balance) return;
    const nextBalance = balance - stake;
    setBalanceRaw(nextBalance);
    onBalanceChange?.(nextBalance);
    setMines(mockMinePositions(GRID_SIZE, mineCount));
    setRevealed([]);
    setHitTile(null);
    setLastPayout(null);
    setStatus("active");
  }, [stake, mineCount, balance, onBalanceChange]);

  const revealTile = useCallback(
    (idx) => {
      if (status !== "active" || revealed.includes(idx)) return;

      if (mines.has(idx)) {
        setHitTile(idx);
        setStatus("busted");
        return;
      }

      const next = [...revealed, idx];
      setRevealed(next);

      // Auto-cashout when every safe tile has been cleared
      if (next.length === maxSafeReveals) {
        const payout = Math.round(stake * payoutMultiplier(GRID_SIZE, mineCount, next.length));
        const nextBalance = balance + payout;
        setBalanceRaw(nextBalance);
        onBalanceChange?.(nextBalance);
        setLastPayout(payout);
        setStatus("cashed_out");
      }
    },
    [status, revealed, mines, maxSafeReveals, stake, mineCount, balance, onBalanceChange]
  );

  const cashOut = useCallback(() => {
    if (status !== "active" || revealed.length === 0) return;
    const payout = Math.round(stake * currentMultiplier);
    const nextBalance = balance + payout;
    setBalanceRaw(nextBalance);
    onBalanceChange?.(nextBalance);
    setLastPayout(payout);
    setStatus("cashed_out");
  }, [status, revealed.length, stake, currentMultiplier, balance, onBalanceChange]);

  const playAgain = useCallback(() => {
    setStatus("idle");
    setRevealed([]);
    setMines(new Set());
    setHitTile(null);
    setLastPayout(null);
  }, []);

  return {
    balance,
    stake,
    setStake,
    mineCount,
    setMineCount,
    status,
    revealed,
    mines,
    hitTile,
    lastPayout,
    seedHash,
    maxSafeReveals,
    currentMultiplier,
    potentialPayout,
    depthSteps,
    startGame,
    revealTile,
    cashOut,
    playAgain,
  };
}
