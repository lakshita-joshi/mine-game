import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Users, Eye, Flag, Trophy } from "lucide-react";
import NavBar from "../components/layout/NavBar.jsx";
import PlayingCard from "../components/teenpatti/PlayingCard.jsx";
import { useTeenPattiSocket } from "../hooks/useTeenPattiSocket.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function TeenPattiTablePage() {
  const { tableId } = useParams();
  const { user } = useAuth();
  const [hasSeenHand, setHasSeenHand] = useState(false);
  const { connected, table, myHand, showdownResult, error, startRound, bet, requestShowdown, sideShowIncoming, requestSideShow, respondToSideShow } =
  useTeenPattiSocket(tableId);

  const mySeatIndex = table?.seats?.findIndex((s) => s.user === user?._id) ?? -1;
  const isMyTurn = table?.currentTurnSeatIndex === mySeatIndex;
  const activeCount = table?.seats?.filter((s) => s.isPlaying).length ?? 0;

  function handleSeeHand() {
    setHasSeenHand(true);
  }

  return (
    <div className="min-h-screen w-full bg-abyss p-4 text-ice sm:p-8">
      <div className="mx-auto max-w-3xl">
        <NavBar />

        <div className="mt-6 rounded-2xl border border-panel-border bg-panel p-6">
          <div className="flex items-center justify-between">
            <h1 className="flex items-center gap-2 font-display text-xl font-bold text-ice">
              <Users size={20} className="text-sonar" />
              Table {tableId?.slice(-6)}
            </h1>
            <span className="font-mono text-xs text-muted">
              {connected ? `${table?.seats?.length ?? 0} seated` : "connecting…"}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl border border-tile-idle-border bg-abyss-edge px-4 py-3">
            <span className="font-mono text-xs uppercase tracking-wide text-muted">Pot</span>
            <span className="font-mono text-2xl font-bold text-sonar">{table?.pot ?? 0}</span>
          </div>

          {error && (
            <p className="mt-3 rounded-lg border border-breach bg-[#0A1626] px-3 py-2 font-mono text-xs text-breach">
              {error}
            </p>
          )}

          {/* Seats */}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {table?.seats?.map((seat) => (
              <div
                key={seat.seatIndex}
                className={`rounded-xl border p-3 text-center ${
                  table.currentTurnSeatIndex === seat.seatIndex
                    ? "border-sonar bg-sonar/10"
                    : "border-panel-border"
                } ${!seat.isPlaying ? "opacity-40" : ""}`}
              >
                <p className="font-mono text-xs text-ice">
                  {seat.user === user?._id ? "You" : `Seat ${seat.seatIndex + 1}`}
                </p>
                <p className="mt-1 font-mono text-[11px] text-muted">
                  {seat.isPlaying ? `${seat.currentStake} in` : "folded"}
                </p>
              </div>
            ))}
            </div>

            {/* My hand */}
            {myHand && (
                <div className="mt-6">
                <p className="mb-2 font-mono text-xs uppercase tracking-wide text-muted">Your hand</p>
                <div className="flex gap-2">
                    {myHand.map((card, i) => (
                    <PlayingCard key={i} card={card} hidden={!hasSeenHand} />
                    ))}
                </div>
                {!hasSeenHand && (
                    <button
                    onClick={handleSeeHand}
                    className="mt-3 flex items-center gap-1.5 rounded-full border border-panel-border px-3 py-1.5 font-mono text-xs text-muted hover:border-sonar hover:text-ice"
                    >
                    <Eye size={14} />
                    Look at my cards (doubles next bet)
                    </button>
                )}
                </div>
            )}

            {/* Controls */}
            <div className="mt-6 flex flex-wrap gap-2">
                {table?.status === "waiting" || table?.status === "finished" ? (
                <button
                    onClick={startRound}
                    className="rounded-xl bg-gradient-to-b from-sonar to-sonar-deep px-5 py-2.5 font-display text-sm font-semibold uppercase text-[#03101F]"
                >
                    Start round
                </button>
                ) : (
                <>
                    <button
                    onClick={() => bet("bet", hasSeenHand)}
                    disabled={!isMyTurn}
                    className="rounded-xl bg-gradient-to-b from-sonar to-sonar-deep px-5 py-2.5 font-display text-sm font-semibold uppercase text-[#03101F] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                    {hasSeenHand ? "Bet (seen)" : "Bet (blind)"}
                    </button>
                    <button
                    onClick={() => bet("fold")}
                    disabled={!isMyTurn}
                    className="flex items-center gap-1.5 rounded-xl border border-breach px-5 py-2.5 font-display text-sm font-semibold uppercase text-breach disabled:cursor-not-allowed disabled:opacity-40"
                    >
                    <Flag size={14} />
                    Fold
                    </button>
                    {activeCount === 2 && (
                    <button
                        onClick={requestShowdown}
                        className="flex items-center gap-1.5 rounded-xl border border-ice px-5 py-2.5 font-display text-sm font-semibold uppercase text-ice"
                    >
                        <Trophy size={14} />
                        Showdown
                    </button>
                    )}
                    {hasSeenHand && activeCount > 2 && (
                        <button
                            onClick={requestSideShow}
                            className="rounded-xl border border-glow px-5 py-2.5 font-display text-sm font-semibold uppercase text-glow"
                        >
                            Side-show
                        </button>
                    )}
                </>
                )}
            </div>

            {!isMyTurn && table?.status === "betting" && (
                <p className="mt-3 font-mono text-xs text-muted-dim">Waiting for another player's turn…</p>
            )}

            {sideShowIncoming && (
            <div className="mt-4 rounded-xl border border-sonar bg-sonar/10 p-4">
                <p className="font-mono text-sm text-ice">A player wants to compare hands with you.</p>
                <div className="mt-2 flex gap-2">
                <button
                    onClick={() => respondToSideShow(sideShowIncoming.requesterId, true)}
                    className="rounded-full bg-sonar px-4 py-1.5 font-mono text-xs font-semibold text-[#03101F]"
                >
                    Accept
                </button>
                <button
                    onClick={() => respondToSideShow(sideShowIncoming.requesterId, false)}
                    className="rounded-full border border-panel-border px-4 py-1.5 font-mono text-xs text-muted"
                >
                    Decline
                </button>
                </div>
            </div>
            )}
        </div>

        {showdownResult && (
          <div className="mt-4 rounded-2xl border border-sonar bg-sonar/10 p-5">
            <p className="font-display text-sm font-bold uppercase text-sonar">Showdown</p>
            <p className="mt-1 font-mono text-xs text-ice">
              Winner: {showdownResult.winnerId === user?._id ? "You" : `Player ${showdownResult.winnerId.slice(-6)}`}
            </p>
            <div className="mt-3 flex flex-wrap gap-4">
              {showdownResult.hands.map((h) => (
                <div key={h.userId}>
                  <p className="mb-1 font-mono text-[11px] text-muted">
                    {h.userId === user?._id ? "You" : h.userId.slice(-6)}
                  </p>
                  <div className="flex gap-1">
                    {h.hand ? h.hand.map((c, i) => <PlayingCard key={i} card={c} />) : (
                      <p className="font-mono text-xs text-muted-dim">folded</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 font-mono text-[11px] text-muted-dim">
              Server seed revealed: {showdownResult.serverSeed.slice(0, 16)}…
            </p>
          </div>
        )}
      </div>
    </div>
  );
}