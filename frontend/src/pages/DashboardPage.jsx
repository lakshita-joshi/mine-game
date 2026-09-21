import React, { useState } from "react";
import NavBar from "../components/layout/NavBar.jsx";
import BottomNav from "../components/layout/BottomNav.jsx";
import HeroSection from "../components/dashboard/HeroSection.jsx";
import GameCategoryTabs from "../components/dashboard/GameCategoryTabs.jsx";
import GameCard from "../components/dashboard/GameCard.jsx";
import DailyBonusCard from "../components/dashboard/DailyBonusCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const GAMES = [
  {
    slug: "crash",
    name: "Crash",
    description: "Watch the multiplier climb — cash out before it crashes!",
    emoji: "🚀",
    category: "Crash",
    badge: { type: "hot", label: "Hot" },
    players: "142",
    available: true,
    tags: ["crash"],
  },
  {
    slug: "mines",
    name: "Mines",
    description: "Reveal safe tiles across a 5×5 grid, avoid the mines, cash out anytime.",
    emoji: "💎",
    category: "Mines",
    badge: { type: "popular", label: "Popular" },
    players: "89",
    available: true,
    tags: ["mines"],
  },
  {
    slug: "dragontiger",
    name: "Dragon Tiger",
    description: "One card each. Higher card wins. Simple, fast, thrilling.",
    emoji: "🐉",
    category: "Live",
    badge: { type: "live", label: "Live" },
    players: "67",
    available: true,
    tags: ["dragontiger"],
  },
  {
    slug: "teenpatti",
    name: "Teen Patti",
    description: "Classic 3-card betting game — blind or seen, fold or showdown.",
    emoji: "🃏",
    category: "Cards",
    badge: { type: "new", label: "New" },
    players: "34",
    available: true,
    tags: ["teenpatti"],
  },
  {
    slug: "slots",
    name: "Slots",
    description: "Spin the reels and hit the jackpot.",
    emoji: "🎰",
    category: "Slots",
    badge: null,
    players: null,
    available: false,
    tags: ["slots"],
  },
  {
    slug: "roulette",
    name: "Roulette",
    description: "Place your bets, spin the wheel.",
    emoji: "🎡",
    category: "Table",
    badge: null,
    players: null,
    available: false,
    tags: ["roulette"],
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered =
    activeCategory === "all"
      ? GAMES
      : GAMES.filter((g) => g.tags.includes(activeCategory));

  return (
    <div className="min-h-screen w-full bg-void pb-20 sm:pb-0">
      <NavBar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Hero */}
        <HeroSection username={user?.username} />

        {/* Daily bonus strip */}
        <div className="mt-5">
          <DailyBonusCard />
        </div>

        {/* Games section */}
        <section id="games" className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-chalk">Games</h2>
            <span className="font-mono text-xs text-fog">
              {filtered.filter((g) => g.available).length} available
            </span>
          </div>

          <GameCategoryTabs active={activeCategory} onChange={setActiveCategory} />

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((game) => (
              <GameCard key={game.slug} game={game} />
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
