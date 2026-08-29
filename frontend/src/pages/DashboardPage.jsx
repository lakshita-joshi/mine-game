import React from "react";
import { Link } from "react-router-dom";
import { Gem, CircleDot, Lock, Rocket, Spade, Users } from "lucide-react";
import NavBar from "../components/layout/NavBar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import DailyBonusCard from "../components/dashboard/DailyBonusCard.jsx";

// Static catalogue for now. Once more games exist, this can move to
// GET /api/games so it's server-driven instead of hardcoded here.
const GAMES = [
  {
    slug: "mines",
    name: "Mines",
    description: "Reveal safe tiles across a 5x5 grid, avoid the mines, cash out anytime.",
    icon: Gem,
    status: "available",
  },
  {
    slug: "crash",
    name: "Crash",
    description: "Watch the multiplier climb — cash out before it crashes.",
    icon: Rocket,
    status: "available",
  },
  {
    slug: "teenpatti",
    name: "Teen Patti",
    description: "Classic 3-card betting game — blind or seen, fold or showdown.",
    icon: Users,
    status: "available",
  },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen w-full bg-abyss p-4 text-ice sm:p-8">
      <div className="mx-auto max-w-6xl">
        <NavBar />

        <div className="mt-8">
          <h1 className="font-display text-2xl font-bold text-ice">
            Welcome back, {user?.username}
          </h1>
          <p className="mt-1 font-mono text-sm text-muted">Pick a game to start playing.</p>
        </div>

        <div className="mt-6 max-w-xs">
          <DailyBonusCard />
        </div>
        

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GAMES.map((game) => (
            <GameCard key={game.slug} game={game} />
          ))}
        </div>
      </div>
    </div>
  );
}

function GameCard({ game }) {
  const Icon = game.icon;
  const available = game.status === "available";

  const content = (
    <div
      className={`flex h-full flex-col justify-between rounded-2xl border p-5 transition-colors ${
        available
          ? "border-panel-border bg-panel hover:border-sonar"
          : "border-panel-border bg-panel opacity-60"
      }`}
    >
      <div>
        <div className="flex items-center justify-between">
          <Icon size={28} className={available ? "text-sonar" : "text-muted-dim"} strokeWidth={1.75} />
          {!available && <Lock size={16} className="text-muted-dim" />}
        </div>
        <h2 className="mt-3 font-display text-lg font-bold text-ice">{game.name}</h2>
        <p className="mt-1 font-mono text-xs text-muted">{game.description}</p>
      </div>

      <div className="mt-4">
        {available ? (
          <span className="font-mono text-xs font-semibold uppercase tracking-wide text-sonar">
            Play now →
          </span>
        ) : (
          <span className="font-mono text-xs uppercase tracking-wide text-muted-dim">
            Coming soon
          </span>
        )}
      </div>
    </div>
  );

  if (!available) return content;

  return <Link to={`/games/${game.slug}`}>{content}</Link>;
}
