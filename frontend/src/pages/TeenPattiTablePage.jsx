import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Users, Eye, Flag, Trophy, LogOut } from "lucide-react";
import NavBar from "../components/layout/NavBar.jsx";
import BottomNav from "../components/layout/BottomNav.jsx";
import PlayingCard from "../components/teenpatti/PlayingCard.jsx";
import { useTeenPattiSocket } from "../hooks/useTeenPattiSocket.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function TeenPattiTablePage() {
  const { tableId }  = useParams();
  const { user, setCoins } = useAuth(); // ← BUG FIX: setCoins was missing
  const navigate = useNavigate();
  const [hasSeenHand, setHasSeenHand] = useState(false);
  const [sideShowAmount, setSideShowAmount] = useState(10);

  const {
    connected, table, myHand, showdownResult, error,
    startRound, bet, requestShowdown,
    sideShowIncoming, requestSideShow, respondToSideShow,
    leaveTable,
  } = useTeenPattiSocket(tableId, setCoins);

  const mySeatIndex   = table?.seats?.findIndex((s) => s.user === user?._id) ?? -1;
  const isMyTurn      = table?.currentTurnSeatIndex === mySeatIndex;
  const myStake       = table?.seats?.[mySeatIndex]?.currentStake ?? 0;
  const activeCount   = table?.seats?.filter((s) => s.isPlaying).length ?? 0;
  const isHost        = table?.seats?.[0]?.user === user?._id;
  const canStart      = isHost && table?.phase === "waiting" && activeCount >= 2;

  function handleLeave() {
    leaveTable();
    navigate("/games/teenpatti");
  }

  return (
    <div className="min-h-screen w-full bg-void pb-20 sm:pb-0">
      <NavBar />

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="font-display text-lg font-bold text-chalk">
              🃏 Table{" "}
              <span className="font-mono text-gold">#{tableId?.slice(-6)}</span>
            </h1>
            <p className="mt-0.5 font-mono text-xs text-fog">
              {connected ? `${table?.seats?.length ?? 0} players seated` : "Connecting…"}
            </p>
          </div>
          <button
            onClick={handleLeave}
            className="flex items-center gap-1.5 rounded-xl border border-rim bg-elevated px-3 py-2 font-mono text-xs text-silver transition-colors hover:border-loss/30 hover:text-loss"
          >
            <LogOut size={13} />
            Leave
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-xl border border-loss/30 bg-loss/5 px-4 py-2.5">
            <p className="font-mono text-xs text-loss">{error}</p>
          </div>
        )}

        {/* Pot display */}
        <div className="mb-5 flex items-center justify-between rounded-2xl border border-gold/20 bg-gold/5 px-5 py-4">
          <span className="font-mono text-xs uppercase tracking-wider text-fog">Pot</span>
          <span className="font-mono text-3xl font-bold text-gold">
            {(table?.pot ?? 0).toLocaleString()}
          </span>
        </div>

        {/* Seats grid */}
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {table?.seats?.map((seat) => {
            const isMe      = seat.user === user?._id;
            const isTurn    = table.currentTurnSeatIndex === seat.seatIndex;
            return (
              <div
                key={seat.seatIndex}
                className={[
                  "rounded-2xl border p-4 text-center transition-all",
                  isTurn    ? "border-gold/40 bg-gold/6 shadow-[0_0_12px_rgba(245,200,66,0.12)]" : "border-rim bg-elevated",
                  !seat.isPlaying ? "opacity-40" : "",
                ].join(" ")}
              >
                <div
                  className={`mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full font-display text-sm font-bold ${
                    isMe ? "bg-gold text-void" : "bg-raised text-silver"
                  }`}
                >
                  {isMe ? "Y" : seat.seatIndex + 1}
                </div>
                <p className={`font-mono text-xs ${isMe ? "text-gold" : "text-chalk"}`}>
                  {isMe ? "You" : `Seat ${seat.seatIndex + 1}`}
                </p>
                <p className="mt-0.5 font-mono text-[11px] text-fog">
                  {seat.isPlaying ? `${seat.currentStake} in` : "folded"}
                </p>
              </div>
            );
          })}
        </div>

        {/* My hand */}
        {myHand?.length > 0 && (
          <div className="mb-5 rounded-2xl border border-rim bg-elevated p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-sm font-semibold text-chalk">Your Hand</h2>
              {!hasSeenHand && (
                <button
                  onClick={() => setHasSeenHand(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-rim px-3 py-1.5 font-mono text-xs text-silver transition-colors hover:border-gold/30 hover:text-gold"
                >
                  <Eye size={12} />
                  See cards
                </button>
              )}
            </div>
            <div className="flex gap-2">
              {myHand.map((card, i) => (
                <PlayingCard key={i} card={card} hidden={!hasSeenHand} />
              ))}
            </div>
          </div>
        )}

        {/* Showdown result */}
        {showdownResult && (
          <div className="mb-5 rounded-2xl border border-gold/30 bg-gold/6 p-5 text-center">
            <Trophy size={24} className="mx-auto mb-2 text-gold" />
            <p className="font-display text-xl font-bold text-gold">
              {showdownResult.winner === user?._id ? "You won!" : "You lost!"}
            </p>
            {showdownResult.hands?.map((h, i) => (
              <div key={i} className="mt-3 flex items-center justify-center gap-2">
                {h.cards?.map((c, j) => <PlayingCard key={j} card={c} hidden={false} />)}
                <span className="font-mono text-xs text-fog">{h.handName}</span>
              </div>
            ))}
          </div>
        )}

        {/* Side-show incoming */}
        {sideShowIncoming && (
          <div className="mb-5 rounded-2xl border border-info/30 bg-info/6 p-5">
            <p className="font-display text-base font-semibold text-chalk">
              Side show requested!
            </p>
            <p className="mt-0.5 font-mono text-xs text-fog">
              A player wants to compare hands privately.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => respondToSideShow(true)}
                className="rounded-xl bg-win px-5 py-2.5 font-display text-sm font-semibold text-void"
              >
                Accept
              </button>
              <button
                onClick={() => respondToSideShow(false)}
                className="rounded-xl border border-rim bg-elevated px-5 py-2.5 font-display text-sm font-semibold text-chalk"
              >
                Decline
              </button>
            </div>
          </div>
        )}

        {/* Action panel */}
        <div className="rounded-2xl border border-rim bg-elevated p-5">
          <h2 className="mb-4 font-display text-base font-semibold text-chalk">Actions</h2>

          {/* Start round */}
          {canStart && (
            <button
              onClick={startRound}
              className="mb-3 w-full rounded-xl bg-gradient-to-r from-gold to-gold-deep py-3.5 font-display text-sm font-semibold uppercase tracking-wide text-void shadow-[0_0_16px_rgba(245,200,66,0.25)] transition-all hover:shadow-[0_0_26px_rgba(245,200,66,0.42)] active:scale-[0.97]"
            >
              Start Round
            </button>
          )}

          {/* Betting actions (only on your turn) */}
          {isMyTurn && table?.phase === "betting" && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => bet(myStake, false)}
                className="rounded-xl border border-rim bg-raised px-5 py-2.5 font-display text-sm font-semibold text-chalk transition-all hover:border-rim-bright active:scale-[0.97]"
              >
                Chaal
                <span className="ml-1 font-mono text-xs text-fog">
                  ({myStake > 0 ? myStake * (hasSeenHand ? 2 : 1) : table?.minStake})
                </span>
              </button>
              <button
                onClick={() => bet(0, true)}
                className="rounded-xl border border-loss/30 bg-loss/8 px-5 py-2.5 font-display text-sm font-semibold text-loss transition-all hover:bg-loss/15 active:scale-[0.97]"
              >
                <Flag size={13} className="inline mr-1" />
                Fold
              </button>
              <button
                onClick={requestShowdown}
                className="rounded-xl border border-gold/30 bg-gold/8 px-5 py-2.5 font-display text-sm font-semibold text-gold transition-all hover:bg-gold/15 active:scale-[0.97]"
              >
                <Trophy size={13} className="inline mr-1" />
                Show
              </button>
              {!hasSeenHand && (
                <button
                  onClick={() => setHasSeenHand(true)}
                  className="rounded-xl border border-rim bg-raised px-5 py-2.5 font-display text-sm font-semibold text-silver transition-all hover:border-rim-bright hover:text-chalk active:scale-[0.97]"
                >
                  <Eye size={13} className="inline mr-1" />
                  See Hand
                </button>
              )}
              {hasSeenHand && activeCount === 2 && (
                <button
                  onClick={() => requestSideShow(sideShowAmount)}
                  className="rounded-xl border border-info/30 bg-info/8 px-5 py-2.5 font-display text-sm font-semibold text-info transition-all hover:bg-info/15 active:scale-[0.97]"
                >
                  Sideshow
                </button>
              )}
            </div>
          )}

          {!isMyTurn && table?.phase === "betting" && (
            <p className="font-mono text-sm text-fog">Waiting for another player's turn…</p>
          )}

          {table?.phase === "waiting" && !canStart && (
            <p className="font-mono text-sm text-fog">
              {activeCount < 2 ? "Waiting for more players to join…" : "Waiting for host to start…"}
            </p>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}