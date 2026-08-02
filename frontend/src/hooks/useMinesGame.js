import { useState, useMemo, useCallback } from "react";
import { GRID_SIZE, payoutMultiplier, START_BALANCE } from "../utils/gameMath.js";
import { mockMinePositions } from "../utils/mockRng.js";

/**
 * Owns all Mines game state. Currently runs entirely client-side
 * against mockMinePositions() for local demo purposes — the coin
 * balance here is a LOCAL COPY seeded from the authenticated user's
 * real balance, not synced back to the server on every move.
 *
 * TO WIRE UP THE REAL BACKEND:
 *   - startGame      -> call minesApi.start(), store the returned
 *                       sessionId, drop mockMinePositions entirely
 *   - revealTile      -> call minesApi.reveal({ sessionId, tileIndex })
 *                       and branch on response.safe instead of
 *                       checking the local `mines` Set
 *   - cashOut        -> call minesApi.cashOut({ sessionId }), then
 *                       call useAuth().setCoins(response.newBalance)
 *                       so the nav bar balance stays in sync
 *   - startGame       -> after a successful start, also call
 *                       setCoins(balance - stake) via useAuth()
 */
export function useMinesGame(initialBalance = START_BALANCE, onBalanceChange) {
  const [balance, setBalanceRaw] = useState(initialBalance);

  // Wrap setBalance so every change also notifies the auth context,
  // keeping the nav bar's displayed balance in sync with gameplay.
  const setBalance = useCallback(
    (updater) => {
      setBalanceRaw((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        onBalanceChange?.(next);
        return next;
      });
    },
    [onBalanceChange]
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
    setBalance((b) => b - stake);
    setMines(mockMinePositions(GRID_SIZE, mineCount));
    setRevealed([]);
    setHitTile(null);
    setLastPayout(null);
    setStatus("active");
  }, [stake, mineCount, balance]);

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
        setBalance((b) => b + payout);
        setLastPayout(payout);
        setStatus("cashed_out");
      }
    },
    [status, revealed, mines, maxSafeReveals, stake, mineCount]
  );

  const cashOut = useCallback(() => {
    if (status !== "active" || revealed.length === 0) return;
    const payout = Math.round(stake * currentMultiplier);
    setBalance((b) => b + payout);
    setLastPayout(payout);
    setStatus("cashed_out");
  }, [status, revealed.length, stake, currentMultiplier]);

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
