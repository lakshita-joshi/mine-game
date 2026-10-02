import React, { useEffect, useState } from "react";
import NavBar from "../components/layout/NavBar.jsx";
import BottomNav from "../components/layout/BottomNav.jsx";

export default function LeaderboardPage() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/leaderboard`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to load leaderboard");
        const data = await res.json();
        setPlayers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  return (
    <div className="min-h-screen w-full bg-void pb-20 sm:pb-0">
      <NavBar />

      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <div className="mb-5">
          <h1 className="font-display text-2xl font-bold text-chalk">Leaderboard</h1>
          <p className="mt-0.5 font-mono text-xs text-fog">Top players this week</p>
        </div>

        {loading && (
          <p className="font-mono text-xs text-fog">Loading leaderboard…</p>
        )}

        {!loading && error && (
          <p className="font-mono text-xs text-red-400">{error}</p>
        )}

        {!loading && !error && players.length === 0 && (
          <p className="font-mono text-xs text-fog">No ranked players yet.</p>
        )}

        {!loading && !error && players.length > 0 && (
          <>
            {/* Top 3 podium */}
            <div className="mb-5 grid grid-cols-3 gap-3">
              {players.slice(0, 3).map((p) => (
                <div
                  key={p.rank}
                  className={`flex flex-col items-center rounded-2xl border p-4 text-center ${
                    p.rank === 1
                      ? "border-gold/40 bg-gold/6"
                      : "border-rim bg-elevated"
                  }`}
                >
                  <span className="text-2xl">{p.badge}</span>
                  <p className="mt-2 font-display text-sm font-semibold text-chalk">{p.name}</p>
                  <p className="mt-0.5 font-mono text-xs text-gold">{p.score.toLocaleString()}</p>
                </div>
              ))}
            </div>

            {/* Full table */}
            <div className="rounded-2xl border border-rim overflow-hidden">
              <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-rim bg-raised px-5 py-3 font-mono text-[10px] uppercase tracking-wider text-fog">
                <span>Rank</span>
                <span>Player</span>
                <span>Score</span>
              </div>
              {players.map((p) => (
                <div
                  key={p.rank}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-rim px-5 py-4 last:border-b-0 transition-colors hover:bg-elevated"
                >
                  <span className={`w-8 font-mono text-sm font-bold ${p.rank <= 3 ? "text-gold" : "text-fog"}`}>
                    {p.badge || p.rank}
                  </span>
                  <span className="font-display text-sm font-semibold text-chalk">{p.name}</span>
                  <span className="font-mono text-sm text-silver">{p.score.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}