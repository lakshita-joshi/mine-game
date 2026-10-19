import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Eye, Flag, Trophy, LogOut } from "lucide-react";
import NavBar from "../components/layout/NavBar.jsx";
import BottomNav from "../components/layout/BottomNav.jsx";
import PlayingCard from "../components/teenpatti/PlayingCard.jsx";
import { useTeenPattiSocket } from "../hooks/useTeenPattiSocket.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function TeenPattiTablePage() {
  const { tableId } = useParams();
  const { user, setCoins } = useAuth();
  const navigate = useNavigate();
  const [hasSeenHand, setHasSeenHand] = useState(false);

  const {
    connected, table, myHand, showdownResult, roundResult, error,
    startRound, bet, requestShowdown, seeHand,
    sideShowIncoming, sideShowPending, sideShowOutcome,
    requestSideShow, respondToSideShow,
    leaveTable,
  } = useTeenPattiSocket(tableId, setCoins);

  // Reset "seen" state whenever a new round begins
  useEffect(() => {
    if (table?.status === "betting") {
      setHasSeenHand(false);
    }
  }, [table?.status, table?.roundNumber]);

  const seats       = table?.seats ?? [];
  const seatCount   = seats.length;
  const mySeatIndex = seats.findIndex((s) => s.user === user?._id);
  const isMyTurn    = mySeatIndex !== -1 && table?.currentTurnSeatIndex === mySeatIndex;
  const activeCount = seats.filter((s) => s.isPlaying).length;
  const isHost      = seats[0]?.user === user?._id;
  const betting     = table?.status === "betting";
  const canStart    =
    isHost && (table?.status === "waiting" || table?.status === "finished") && seatCount >= 2;

  // Must match the server: minStake, doubled once you've seen your hand
  const chaalAmount = (table?.minStake ?? 0) * (hasSeenHand ? 2 : 1);

  // See cards only while a round is live
  const canSeeCards = betting && myHand?.length > 0 && !hasSeenHand;

  // The server side-shows with the previous active seat (by array position)
  const prevActiveSeat = (() => {
    if (mySeatIndex === -1 || seatCount < 2) return null;
    let i = (mySeatIndex - 1 + seatCount) % seatCount;
    for (let n = 0; n < seatCount; n++) {
      if (i !== mySeatIndex && seats[i].isPlaying) return seats[i];
      i = (i - 1 + seatCount) % seatCount;
    }
    return null;
  })();
  const canSideShow = hasSeenHand && !!prevActiveSeat?.hasSeenHand;

  const showdownWinnerId = showdownResult?.winnerId ?? showdownResult?.winner;
  const iWonRound = String(roundResult?.winnerId) === String(user?._id);

  function handleSeeHand() {
    setHasSeenHand(true);
    seeHand(); // tell the server too, so side-show and 2x stake work
  }

  function handleLeave() {
    leaveTable();
    navigate("/games/teenpatti");
  }

  return (
    <div className="min-h-screen w-full bg-void pb-20 sm:pb-0">
      <NavBar />

      <main className="mx-auto max-w-6xl px-3 py-3 sm:px-6">
        {/* Header: title, pot, leave */}
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate font-display text-base font-bold text-chalk">
              🃏 Table <span className="font-mono text-gold">#{tableId?.slice(-6)}</span>
            </h1>
            <p className="font-mono text-[11px] text-fog">
              {connected ? `${seatCount} players seated` : "Connecting…"}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="rounded-xl border border-gold/20 bg-gold/5 px-3 py-1 text-right">
              <span className="block font-mono text-[10px] uppercase leading-none tracking-wider text-fog">
                Pot
              </span>
              <span className="font-mono text-lg font-bold leading-tight text-gold">
                {(table?.pot ?? 0).toLocaleString()}
              </span>
            </div>
            <button
              onClick={handleLeave}
              className="flex items-center gap-1.5 rounded-xl border border-rim bg-elevated px-2.5 py-2 font-mono text-xs text-silver transition-colors hover:border-loss/30 hover:text-loss"
            >
              <LogOut size={13} />
              Leave
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-3 rounded-xl border border-loss/30 bg-loss/5 px-3 py-2">
            <p className="font-mono text-xs text-loss">{error}</p>
          </div>
        )}

        <div className="grid gap-3 lg:grid-cols-[1fr_260px]">
          {/* CENTER: actions first, then results and hand */}
          <section className="flex flex-col gap-3">
            {/* Actions (top, so Start Round is always on screen) */}
            <div className="rounded-2xl border border-rim bg-elevated p-3">
              {canStart && (
                <button
                  onClick={startRound}
                  className="w-full rounded-xl bg-gradient-to-r from-gold to-gold-deep py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-void shadow-[0_0_16px_rgba(245,200,66,0.25)] transition-all hover:shadow-[0_0_26px_rgba(245,200,66,0.42)] active:scale-[0.97]"
                >
                  Start Round
                </button>
              )}

              {isMyTurn && betting && (
                <>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => bet("bet", hasSeenHand)}
                      className="rounded-xl border border-rim bg-raised px-4 py-2 font-display text-sm font-semibold text-chalk transition-all hover:border-rim-bright active:scale-[0.97]"
                    >
                      Chaal
                      <span className="ml-1 font-mono text-xs text-fog">({chaalAmount})</span>
                    </button>
                    <button
                      onClick={() => bet("fold", hasSeenHand)}
                      className="rounded-xl border border-loss/30 bg-loss/10 px-4 py-2 font-display text-sm font-semibold text-loss transition-all hover:bg-loss/15 active:scale-[0.97]"
                    >
                      <Flag size={13} className="mr-1 inline" />
                      Fold
                    </button>
                    <button
                      onClick={requestShowdown}
                      className="rounded-xl border border-gold/30 bg-gold/10 px-4 py-2 font-display text-sm font-semibold text-gold transition-all hover:bg-gold/15 active:scale-[0.97]"
                    >
                      <Trophy size={13} className="mr-1 inline" />
                      Show
                    </button>
                    {canSideShow && (
                      <button
                        onClick={requestSideShow}
                        disabled={sideShowPending}
                        className="rounded-xl border border-info/30 bg-info/10 px-4 py-2 font-display text-sm font-semibold text-info transition-all hover:bg-info/15 active:scale-[0.97] disabled:opacity-50"
                      >
                        {sideShowPending ? "Waiting for reply…" : "Sideshow"}
                      </button>
                    )}
                  </div>
                  {hasSeenHand && prevActiveSeat && !prevActiveSeat.hasSeenHand && (
                    <p className="mt-2 font-mono text-[11px] text-fog">
                      Sideshow needs the previous player to have seen their cards.
                    </p>
                  )}
                </>
              )}

              {!isMyTurn && betting && (
                <p className="font-mono text-sm text-fog">Waiting for another player's turn…</p>
              )}

              {(table?.status === "waiting" || table?.status === "finished") && !canStart && (
                <p className="font-mono text-sm text-fog">
                  {seatCount < 2
                    ? "Waiting for more players to join…"
                    : table?.status === "finished"
                    ? "Round over. Waiting for the host to start the next round…"
                    : "Waiting for host to start…"}
                </p>
              )}

              {!table && <p className="font-mono text-sm text-fog">Loading table…</p>}
            </div>

            {/* Fold-win result */}
            {roundResult && !showdownResult && (
              <div className="flex items-center justify-center gap-3 rounded-2xl border border-gold/30 bg-gold/5 px-4 py-3">
                <Trophy size={20} className="shrink-0 text-gold" />
                <div className="text-left">
                  <p className="font-display text-base font-bold text-gold">
                    {iWonRound ? "You won!" : "You lost!"}
                  </p>
                  <p className="font-mono text-[11px] text-fog">
                    {iWonRound
                      ? `Everyone else folded. You win ${roundResult.amount}.`
                      : "Everyone else folded."}
                  </p>
                </div>
              </div>
            )}

            {/* Showdown result */}
            {showdownResult && (
              <div className="rounded-2xl border border-gold/30 bg-gold/5 p-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Trophy size={18} className="text-gold" />
                  <p className="font-display text-base font-bold text-gold">
                    {String(showdownWinnerId) === String(user?._id) ? "You won!" : "You lost!"}
                  </p>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                  {showdownResult.hands?.map((h, i) => {
                    const cards = h.cards ?? h.hand;
                    if (!cards) return null;
                    return (
                      <div key={i} className="flex items-center gap-1.5">
                        {cards.map((c, j) => (
                          <PlayingCard key={j} card={c} hidden={false} size="md" />
                        ))}
                        {h.handName && (
                          <span className="font-mono text-[11px] text-fog">{h.handName}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Side-show outcome (requester) */}
            {sideShowOutcome && (
              <div className="rounded-2xl border border-info/30 bg-info/5 px-4 py-2.5">
                <p className="font-mono text-xs text-chalk">
                  {!sideShowOutcome.accepted
                    ? "Side show declined."
                    : sideShowOutcome.loserId === user?._id
                    ? "Side show accepted: you had the lower hand and folded."
                    : "Side show accepted: a player folded."}
                </p>
              </div>
            )}

            {/* Side-show incoming (target) */}
            {sideShowIncoming && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-info/30 bg-info/5 px-4 py-3">
                <div>
                  <p className="font-display text-sm font-semibold text-chalk">Side show requested!</p>
                  <p className="font-mono text-[11px] text-fog">
                    A player wants to compare hands privately.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => respondToSideShow(sideShowIncoming.requesterId, true)}
                    className="rounded-xl bg-win px-4 py-2 font-display text-sm font-semibold text-void"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => respondToSideShow(sideShowIncoming.requesterId, false)}
                    className="rounded-xl border border-rim bg-elevated px-4 py-2 font-display text-sm font-semibold text-chalk"
                  >
                    Decline
                  </button>
                </div>
              </div>
            )}

            {/* Hand */}
            <div className="relative overflow-hidden rounded-2xl border border-rim bg-elevated px-3 py-3">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0A1A10]/60 via-[#0D1117] to-[#0A100A]/60" />
              <div className="relative flex flex-col items-center">
                <div className="mb-2 flex w-full items-center justify-between">
                  <p className="font-mono text-[11px] uppercase tracking-widest text-fog">Your hand</p>
                  {canSeeCards ? (
                    <button
                      onClick={handleSeeHand}
                      className="flex items-center gap-1.5 rounded-lg border border-rim bg-raised px-3 py-1.5 font-mono text-xs text-silver transition-colors hover:border-gold/30 hover:text-gold"
                    >
                      <Eye size={13} />
                      See cards
                    </button>
                  ) : !myHand?.length ? (
                    <span className="font-mono text-[11px] text-fog">Cards appear when the round starts</span>
                  ) : null}
                </div>

                <div className="flex justify-center gap-3 sm:gap-5">
                  {(myHand?.length ? myHand : [null, null, null]).map((card, i) => (
                    <PlayingCard key={i} card={card} hidden={!card || !hasSeenHand} size="lg" />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* SIDE: players */}
          <aside>
            <div className="rounded-2xl border border-rim bg-elevated p-3">
              <h2 className="mb-2 font-mono text-[11px] uppercase tracking-wider text-fog">Players</h2>
              <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
                {seats.map((seat) => {
                  const isMe = seat.user === user?._id;
                  const isTurn = table.currentTurnSeatIndex === seat.seatIndex && betting;
                  return (
                    <div
                      key={seat.seatIndex}
                      className={[
                        "flex items-center gap-2 rounded-xl border px-2 py-1.5 transition-all",
                        isTurn ? "border-gold/40 bg-gold/5" : "border-rim",
                        !seat.isPlaying ? "opacity-40" : "",
                      ].join(" ")}
                    >
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-xs font-bold ${
                          isMe ? "bg-gold text-void" : "bg-raised text-silver"
                        }`}
                      >
                        {(seat.username ?? String(seat.seatIndex + 1)).charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`truncate font-mono text-xs ${isMe ? "text-gold" : "text-chalk"}`}>
                          {isMe ? "You" : seat.username ?? `Seat ${seat.seatIndex + 1}`}
                        </p>
                        <p className="font-mono text-[10px] text-fog">
                          {seat.isPlaying ? `${seat.currentStake} in` : "folded"}
                        </p>
                      </div>
                      {isTurn && (
                        <span className="font-mono text-[10px] uppercase text-gold">turn</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}