import React from "react";

const SUIT_SYMBOLS = { S: "♠", H: "♥", D: "♦", C: "♣" };
const RED_SUITS = ["H", "D"];

const SIZES = {
  md: { box: "h-20 w-14", rank: "text-lg", suit: "text-xl" },
  lg: {
    box: "h-36 w-24 sm:h-48 sm:w-32",
    rank: "text-3xl sm:text-4xl",
    suit: "text-4xl sm:text-5xl",
  },
  xl: {
    box: "h-44 w-32 sm:h-60 sm:w-40",
    rank: "text-4xl sm:text-5xl",
    suit: "text-5xl sm:text-6xl",
  },
};

export default function PlayingCard({ card, hidden, size = "md" }) {
  const s = SIZES[size] ?? SIZES.md;

  // Card back: dark with a gold frame and a gold diamond
  if (hidden || !card) {
    return (
      <div
        className={`relative flex ${s.box} shrink-0 items-center justify-center rounded-lg border border-gold/60 bg-gradient-to-br from-[#2A2108] via-[#15110A] to-[#2A2108] shadow-[0_0_10px_rgba(245,200,66,0.15)]`}
      >
        <div className="pointer-events-none absolute inset-1 rounded-md border border-gold/30" />
        <span className={`${s.suit} leading-none text-gold/70`}>♦</span>
      </div>
    );
  }

  // Card face: warm cream with a gold frame
  const isRed = RED_SUITS.includes(card.suit);
  const color = isRed ? "text-loss" : "text-void";

  return (
    <div
      className={`relative flex ${s.box} shrink-0 flex-col items-center justify-center rounded-lg border border-gold bg-gradient-to-br from-[#FFFBEA] to-[#F6E7B0] shadow-[0_0_14px_rgba(245,200,66,0.3)]`}
    >
      <div className="pointer-events-none absolute inset-1 rounded-md border border-gold/40" />
      <span className={`font-mono font-bold leading-none ${s.rank} ${color}`}>{card.rank}</span>
      <span className={`leading-none ${s.suit} ${color}`}>{SUIT_SYMBOLS[card.suit]}</span>
    </div>
  );
}