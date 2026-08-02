import React, { useCallback } from "react";
import NavBar from "../components/layout/NavBar.jsx";
import ProvablyFairBadge from "../components/game/ProvablyFairBadge.jsx";
import ControlsPanel from "../components/game/ControlsPanel.jsx";
import GridPanel from "../components/game/GridPanel.jsx";
import DepthGauge from "../components/game/DepthGauge.jsx";
import ResultBanner from "../components/game/ResultBanner.jsx";
import { useMinesGame } from "../hooks/useMinesGame.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function MinesGamePage() {
  const { user, setCoins } = useAuth();

  // Keeps the NavBar's balance display in sync with local gameplay.
  // See useMinesGame.js comments for how this becomes a real server
  // sync once /start, /reveal, /cashout are wired to the backend.
  const handleBalanceChange = useCallback((coins) => setCoins(coins), [setCoins]);

  const game = useMinesGame(user?.coins, handleBalanceChange);
  const isOver = game.status === "busted" || game.status === "cashed_out";

  return (
    <div className="min-h-screen w-full bg-abyss p-4 text-ice sm:p-8">
      <div className="mx-auto max-w-6xl">
        <NavBar />

        <div className="mt-4">
          <ProvablyFairBadge seedHash={game.seedHash} />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr_260px]">
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

        {isOver && (
          <ResultBanner
            status={game.status}
            lastPayout={game.lastPayout}
            stake={game.stake}
            onPlayAgain={game.playAgain}
          />
        )}
      </div>
    </div>
  );
}
