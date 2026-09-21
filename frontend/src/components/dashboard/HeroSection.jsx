import React from "react";
import { Link } from "react-router-dom";
import { Zap, ChevronRight } from "lucide-react";

export default function HeroSection({ username }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-rim">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0D1A10] via-[#0D1117] to-[#12100A]" />
      <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-gold/6 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-info/5 blur-3xl" />

      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(245,200,66,1) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Corner emoji badges */}
      <div className="absolute right-4 top-4 hidden gap-1.5 sm:flex">
        {["🎰", "🃏", "🎲"].map((e, i) => (
          <div
            key={i}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-rim bg-elevated/60 text-lg backdrop-blur-sm"
          >
            {e}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative px-6 py-10 sm:px-10 sm:py-14">
        {/* Live tag */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/8 px-3 py-1">
          <span className="h-1.5 w-1.5 animate-ping rounded-full bg-gold" />
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-gold">
            Live Games Available
          </span>
        </div>

        <h1 className="max-w-lg font-display text-3xl font-bold leading-tight text-chalk sm:text-4xl lg:text-5xl">
          {username ? (
            <>
              Welcome back,{" "}
              <span className="text-gold">{username}</span>!
            </>
          ) : (
            <>
              The Ultimate{" "}
              <span className="text-gold">Gaming</span>{" "}
              Experience
            </>
          )}
        </h1>

        <p className="mt-3 max-w-md text-base text-silver">
          Place your bets, beat the odds. Provably fair games with instant payouts.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            to="/games/crash"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold to-gold-deep px-6 py-3 font-display text-sm font-semibold text-void shadow-[0_0_20px_rgba(245,200,66,0.3)] transition-all hover:shadow-[0_0_32px_rgba(245,200,66,0.48)] active:scale-95"
          >
            <Zap size={16} />
            Play Now
          </Link>
          <Link
            to="/dashboard#games"
            className="flex items-center gap-1.5 rounded-xl border border-rim-bright bg-elevated/70 px-6 py-3 font-display text-sm font-semibold text-chalk backdrop-blur-sm transition-all hover:border-gold/30 hover:text-gold"
          >
            Explore Games
            <ChevronRight size={15} />
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-8 flex flex-wrap gap-6">
          {[
            { label: "Games Available", value: "4+" },
            { label: "Provably Fair",   value: "100%" },
            { label: "Instant Payouts", value: "Always" },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-display text-xl font-bold text-gold">{s.value}</p>
              <p className="font-mono text-xs text-fog">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
