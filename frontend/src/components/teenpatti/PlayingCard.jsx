import React from "react";

const SUIT_SYMBOLS = { S: "♠", H: "♥", D: "♦", C: "♣" };
const RED_SUITS = ["H", "D"];

const SIZES = {
  md: { box: "h-20 w-14", rank: "text-lg", suit: "text-xl", dot: "h-2 w-2" },
  lg: {
    box: "h-36 w-24 sm:h-48 sm:w-32",
    rank: "text-3xl sm:text-4xl",
    suit: "text-4xl sm:text-5xl",
    dot: "h-3 w-3",
  },
  xl: {
    box: "h-44 w-32 sm:h-60 sm:w-40",
    rank: "text-4xl sm:text-5xl",
    suit: "text-5xl sm:text-6xl",
    dot: "h-4 w-4",
  },
};

export default function PlayingCard({ card, hidden, size = "md" }) {
  const s = SIZES[size] ?? SIZES.md;

  if (hidden || !card) {
    return (
      <div
        className={`flex ${s.box} shrink-0 items-center justify-center rounded-lg border border-tile-idle-border bg-tile-idle`}
      >
        <div className={`${s.dot} rounded-full bg-tile-idle-border`} />
      </div>
    );
  }

  const isRed = RED_SUITS.includes(card.suit);
  const color = isRed ? "text-sonar-deep" : "text-abyss";

  return (
    <div
      className={`flex ${s.box} shrink-0 flex-col items-center justify-center rounded-lg border border-glow bg-ice`}
    >
      <span className={`font-mono font-bold ${s.rank} ${color}`}>{card.rank}</span>
      <span className={`${s.suit} ${color}`}>{SUIT_SYMBOLS[card.suit]}</span>
    </div>
  );
}