import React, { useEffect, useState, useCallback } from "react";
import { Ban, ShieldCheck, Search } from "lucide-react";
import NavBar from "../../components/layout/NavBar.jsx";
import { adminApi } from "../../api/minesApi.js";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const limit = 15;

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.listUsers({ search, page, limit });
      setUsers(res.users);
      setTotal(res.total);
    } catch (err) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleToggleBan(user) {
    try {
      await adminApi.updateUser(user._id, { isBanned: !user.isBanned });
      load();
    } catch (err) {
      setError(err.message || "Failed to update user");
    }
  }

  async function handleAdjustCoins(user) {
    const input = window.prompt(
      `Adjust coins for ${user.username} (current: ${user.coins}).\nEnter a positive or negative amount to add/subtract:`
    );
    if (input === null) return;
    const delta = Number(input);
    if (!Number.isFinite(delta) || delta === 0) return;

    try {
      await adminApi.updateUser(user._id, { coinsDelta: delta });
      load();
    } catch (err) {
      setError(err.message || "Failed to adjust coins");
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="min-h-screen w-full bg-abyss p-4 text-ice sm:p-8">
      <div className="mx-auto max-w-6xl">
        <NavBar backLink="/admin" />

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-2xl font-bold text-ice">Users</h1>

          <div className="flex items-center gap-2 rounded-full border border-panel-border bg-panel px-3 py-2">
            <Search size={14} className="text-muted" />
            <input
              type="text"
              placeholder="Search username or email"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              className="w-56 bg-transparent font-mono text-xs text-ice outline-none placeholder:text-muted-dim"
            />
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-breach bg-[#0A1626] px-4 py-3 font-mono text-sm text-breach">
            {error}
          </p>
        )}

        <div className="mt-4 overflow-x-auto rounded-2xl border border-panel-border bg-panel">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-panel-border text-muted">
                <th className="px-4 py-3 font-medium">Username</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Coins</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-panel-border last:border-0">
                  <td className="px-4 py-3 text-ice">{u.username}</td>
                  <td className="px-4 py-3 text-muted">{u.email}</td>
                  <td className="px-4 py-3 text-ice">{u.coins.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[11px] ${
                        u.role === "admin" ? "border-sonar text-sonar" : "border-panel-border text-muted"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.isBanned ? (
                      <span className="rounded-full border border-breach px-2 py-0.5 text-[11px] text-breach">
                        banned
                      </span>
                    ) : (
                      <span className="rounded-full border border-panel-border px-2 py-0.5 text-[11px] text-muted">
                        active
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-dim">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAdjustCoins(u)}
                        className="rounded-full border border-panel-border px-2.5 py-1 text-[11px] text-muted hover:border-sonar hover:text-ice"
                      >
                        Adjust coins
                      </button>
                      <button
                        onClick={() => handleToggleBan(u)}
                        className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] ${
                          u.isBanned
                            ? "border-sonar text-sonar hover:bg-sonar/10"
                            : "border-breach text-breach hover:bg-[#0A1626]"
                        }`}
                      >
                        {u.isBanned ? <ShieldCheck size={12} /> : <Ban size={12} />}
                        {u.isBanned ? "Unban" : "Ban"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-muted-dim">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between font-mono text-xs text-muted">
          <span>
            Page {page} of {totalPages} · {total} users
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-full border border-panel-border px-3 py-1 disabled:opacity-40"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-full border border-panel-border px-3 py-1 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}