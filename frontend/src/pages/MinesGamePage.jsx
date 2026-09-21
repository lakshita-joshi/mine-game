import React, { useCallback } from "react";
import NavBar from "../components/layout/NavBar.jsx";
import BottomNav from "../components/layout/BottomNav.jsx";
import ProvablyFairBadge from "../components/game/ProvablyFairBadge.jsx";
import ControlsPanel from "../components/game/ControlsPanel.jsx";
import GridPanel from "../components/game/GridPanel.jsx";
import DepthGauge from "../components/game/DepthGauge.jsx";
import ResultBanner from "../components/game/ResultBanner.jsx";
import { useMinesGame } from "../hooks/useMinesGame.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function MinesGamePage() {
  const { user, setCoins } = useAuth();
  const handleBalanceChange = useCallback((coins) => setCoins(coins), [setCoins]);
  const game  = useMinesGame(user?.coins, handleBalanceChange);
  const isOver = game.status === "busted" || game.status === "cashed_out";

  return (
    <div className="min-h-screen w-full bg-void pb-20 sm:pb-0">
      <NavBar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-chalk">💎 Mines</h1>
            <p className="mt-0.5 font-mono text-xs text-fog">
              Reveal safe tiles, cash out before hitting a mine
            </p>
          </div>
          <ProvablyFairBadge seedHash={game.seedHash} />
        </div>

        {/* Three-column game layout */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr_260px]">
          <ControlsPanel
            stake={game.stake}
            setStake={game.setStake}
            mineCount={game.mineCount}
            setMineCount={game.setMineCount}
            balance={game.balance}
            status={game.status}
            onStart={game.startGame}
          />
          <GridPanel
            revealed={game.revealed}
            mines={game.mines}
            hitTile={game.hitTile}
            status={game.status}
            onReveal={game.revealTile}
          />
          <DepthGauge
            depthSteps={game.depthSteps}
            currentStep={game.revealed.length}
            status={game.status}
            potentialPayout={game.potentialPayout}
            currentMultiplier={game.currentMultiplier}
            onCashOut={game.cashOut}
            revealedCount={game.revealed.length}
          />
        </div>

        {/* Result banner */}
        {isOver && (
          <ResultBanner
            status={game.status}
            lastPayout={game.lastPayout}
            stake={game.stake}
            onPlayAgain={game.playAgain}
          />
        )}
      </main>

      <BottomNav />
    </div>
  );
}
