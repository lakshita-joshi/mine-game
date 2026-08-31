import React from "react";

const SUIT_SYMBOLS = { S: "♠", H: "♥", D: "♦", C: "♣" };
const RED_SUITS = ["H", "D"];

export default function PlayingCard({ card, hidden }) {
  if (hidden || !card) {
    return (
      <div className="flex h-20 w-14 items-center justify-center rounded-lg border border-tile-idle-border bg-tile-idle">
        <div className="h-2 w-2 rounded-full bg-tile-idle-border" />
      </div>
    );
  }

  const isRed = RED_SUITS.includes(card.suit);

  return (
    <div className="flex h-20 w-14 flex-col items-center justify-center rounded-lg border border-glow bg-ice">
      <span className={`font-mono text-lg font-bold ${isRed ? "text-sonar-deep" : "text-abyss"}`}>
          {card.rank}
      </span>
      <span className={`text-xl ${isRed ? "text-sonar-deep" : "text-abyss"}`}>
        {SUIT_SYMBOLS[card.suit]}
      </span>
    </div>
  );
}