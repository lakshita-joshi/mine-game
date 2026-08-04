import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Activity, Coins, TrendingUp, UserPlus, Layers } from "lucide-react";
import NavBar from "../../components/layout/NavBar.jsx";
import { adminApi } from "../../api/minesApi.js";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, sessionsRes] = await Promise.all([
          adminApi.getStats(),
          adminApi.listSessions({ limit: 10 }),
        ]);
        setStats(statsRes);
        setSessions(sessionsRes.sessions);
      } catch (err) {
        setError(err.message || "Failed to load admin data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen w-full bg-abyss p-4 text-ice sm:p-8">
      <div className="mx-auto max-w-6xl">
        <NavBar backLink="/admin" />

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-2xl font-bold text-ice">Admin overview</h1>
          <Link
            to="/admin/users"
            className="rounded-full border border-panel-border bg-panel px-4 py-2 font-mono text-xs text-sonar hover:border-sonar"
          >
            Manage users →
          </Link>
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-breach bg-[#0A1626] px-4 py-3 font-mono text-sm text-breach">
            {error}
          </p>
        )}

        {loading ? (
          <p className="mt-6 font-mono text-sm text-muted">Loading stats…</p>
        ) : (
          stats && (
            <>
              <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard icon={Users} label="Total users" value={stats.totalUsers.toLocaleString()} />
                <StatCard
                  icon={UserPlus}
                  label="New users (7d)"
                  value={stats.newUsersLast7d.toLocaleString()}
                />
                <StatCard icon={Layers} label="Total sessions" value={stats.totalSessions.toLocaleString()} />
                <StatCard
                  icon={Activity}
                  label="Active right now"
                  value={stats.activeSessions.toLocaleString()}
                />
                <StatCard
                  icon={Coins}
                  label="Total staked"
                  value={stats.totalStaked.toLocaleString()}
                />
                <StatCard
                  icon={Coins}
                  label="Total paid out"
                  value={stats.totalPayout.toLocaleString()}
                />
                <StatCard
                  icon={TrendingUp}
                  label="House profit"
                  value={stats.houseProfit.toLocaleString()}
                  highlight
                />
              </div>

              <div className="mt-8">
                <h2 className="font-mono text-xs uppercase tracking-wide text-muted">
                  Recent sessions
                </h2>
                <div className="mt-3 overflow-x-auto rounded-2xl border border-panel-border bg-panel">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="border-b border-panel-border text-muted">
                        <th className="px-4 py-3 font-medium">User</th>
                        <th className="px-4 py-3 font-medium">Game</th>
                        <th className="px-4 py-3 font-medium">Stake</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Payout</th>
                        <th className="px-4 py-3 font-medium">When</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map((s) => (
                        <tr key={s._id} className="border-b border-panel-border last:border-0">
                          <td className="px-4 py-3 text-ice">{s.user?.username ?? "deleted user"}</td>
                          <td className="px-4 py-3 text-muted">{s.gameType}</td>
                          <td className="px-4 py-3 text-ice">{s.stake.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <StatusPill status={s.status} />
                          </td>
                          <td className="px-4 py-3 text-ice">{s.payout.toLocaleString()}</td>
                          <td className="px-4 py-3 text-muted-dim">
                            {new Date(s.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                      {sessions.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-6 text-center text-muted-dim">
                            No sessions yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, highlight }) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlight ? "border-sonar bg-sonar/10" : "border-panel-border bg-panel"
      }`}
    >
      <Icon size={18} className={highlight ? "text-sonar" : "text-muted"} strokeWidth={1.75} />
      <div className="mt-3 font-mono text-lg font-bold text-ice">{value}</div>
      <div className="mt-1 font-mono text-[11px] uppercase tracking-wide text-muted">{label}</div>
    </div>
  );
}

export function StatusPill({ status }) {
  const styles = {
    active: "text-sonar border-sonar",
    cashed_out: "text-ice border-ice",
    busted: "text-breach border-breach",
  };
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[11px] ${styles[status] ?? "text-muted border-panel-border"}`}>
      {status}
    </span>
  );
}