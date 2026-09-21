import React from "react";
import { Link } from "react-router-dom";
import { Heart, Play, Users } from "lucide-react";
import Badge from "../ui/Badge.jsx";

export default function GameCard({ game }) {
  const { slug, name, description, emoji, category, badge, players, available } = game;

  const inner = (
    <div
      className={[
        "group relative overflow-hidden rounded-2xl border border-rim bg-elevated",
        "transition-all duration-300",
        available
          ? "cursor-pointer hover:-translate-y-0.5 hover:border-gold/30 hover:shadow-[0_0_24px_rgba(245,200,66,0.09)]"
          : "cursor-not-allowed opacity-55",
      ].join(" ")}
    >
      {/* ── Thumbnail ──────────────────────────────────────────────── */}
      <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-raised to-base">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-info/10 opacity-20" />

        {/* Game emoji */}
        <span className="select-none text-6xl transition-transform duration-300 group-hover:scale-110">
          {emoji}
        </span>

        {/* Badge */}
        {badge && (
          <div className="absolute left-3 top-3">
            <Badge variant={badge.type} pulse={badge.type === "live"}>
              {badge.label}
            </Badge>
          </div>
        )}

        {/* Favourite */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border border-rim bg-base/70 text-fog backdrop-blur-sm transition-colors hover:border-gold/30 hover:text-gold"
        >
          <Heart size={12} />
        </button>

        {/* Play overlay */}
        {available && (
          <div className="absolute inset-0 flex items-center justify-center bg-void/70 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold shadow-[0_0_24px_rgba(245,200,66,0.55)]">
              <Play size={20} className="ml-0.5 text-void" fill="currentColor" />
            </div>
          </div>
        )}
      </div>

      {/* ── Info ───────────────────────────────────────────────────── */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-base font-semibold text-chalk">{name}</h3>
            <p className="mt-0.5 font-mono text-xs text-gold">{category}</p>
          </div>
          {players && (
            <div className="flex flex-shrink-0 items-center gap-1 rounded-full border border-rim bg-base px-2 py-1">
              <Users size={11} className="text-fog" />
              <span className="font-mono text-[10px] text-fog">{players}</span>
            </div>
          )}
        </div>
        <p className="mt-2 line-clamp-2 font-mono text-xs text-fog">{description}</p>

        {!available && (
          <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-fog/60">
            Coming Soon
          </p>
        )}
      </div>
    </div>
  );

  if (!available) return inner;
  return <Link to={`/games/${slug}`}>{inner}</Link>;
}
