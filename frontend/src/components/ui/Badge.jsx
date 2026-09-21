import React from "react";

const VARIANTS = {
  hot:     "border-loss/25 bg-loss/10 text-loss",
  new:     "border-info/25 bg-info/10 text-info",
  live:    "border-loss/25 bg-loss/10 text-loss",
  popular: "border-gold/25 bg-gold/10 text-gold",
  win:     "border-win/25 bg-win/10 text-win",
  coming:  "border-fog/20 bg-fog/10 text-fog",
};

export default function Badge({ variant = "popular", children, pulse = false }) {
  const isLive = variant === "live" || pulse;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${
        VARIANTS[variant] || VARIANTS.popular
      }`}
    >
      {isLive && (
        <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-loss opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-loss" />
        </span>
      )}
      {children}
    </span>
  );
}
