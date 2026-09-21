import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Plus, RefreshCw, ChevronRight } from "lucide-react";
import NavBar from "../components/layout/NavBar.jsx";
import BottomNav from "../components/layout/BottomNav.jsx";
import { SkeletonCard } from "../components/ui/Skeleton.jsx";
import { tableApi } from "../api/minesApi.js";

export default function TeenPattiLobbyPage() {
  const navigate = useNavigate();
  const [tables,     setTables]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [tableName,  setTableName]  = useState("");
  const [minStake,   setMinStake]   = useState(10);
  const [creating,   setCreating]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await tableApi.list();
      setTables(res.tables);
    } catch (err) {
      setError(err.message || "Failed to load tables");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await tableApi.create({ tableName, minStake: Number(minStake), maxSeats: 6 });
      navigate(`/games/teenpatti/${res.table._id}`);
    } catch (err) {
      setError(err.message || "Failed to create table");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-void pb-20 sm:pb-0">
      <NavBar />

      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-chalk">🃏 Teen Patti</h1>
            <p className="mt-0.5 font-mono text-xs text-fog">Join a live table or create your own</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-rim bg-elevated text-silver transition-colors hover:border-rim-bright hover:text-chalk"
            >
              <RefreshCw size={15} />
            </button>
            <button
              onClick={() => setShowCreate((s) => !s)}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-gold to-gold-deep px-4 py-2.5 font-display text-sm font-semibold text-void shadow-[0_0_12px_rgba(245,200,66,0.2)] transition-all hover:shadow-[0_0_22px_rgba(245,200,66,0.38)]"
            >
              <Plus size={14} />
              New Table
            </button>
          </div>
        </div>

        {/* Create table form */}
        {showCreate && (
          <form
            onSubmit={handleCreate}
            className="animate-slide-down mb-5 rounded-2xl border border-gold/20 bg-elevated p-5"
          >
            <h2 className="mb-4 font-display text-base font-semibold text-chalk">Create Table</h2>
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="font-mono text-xs uppercase tracking-wider text-fog">Table name</span>
                <input
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  required
                  placeholder="My table"
                  className="rounded-xl border border-rim bg-base px-3 py-2.5 font-mono text-sm text-chalk outline-none transition-colors focus-visible:border-gold/60"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="font-mono text-xs uppercase tracking-wider text-fog">Min stake</span>
                <input
                  type="number"
                  value={minStake}
                  onChange={(e) => setMinStake(e.target.value)}
                  min={1}
                  className="w-28 rounded-xl border border-rim bg-base px-3 py-2.5 font-mono text-sm text-chalk outline-none transition-colors focus-visible:border-gold/60"
                />
              </label>
              <button
                type="submit"
                disabled={creating}
                className={[
                  "rounded-xl px-5 py-2.5 font-display text-sm font-semibold uppercase tracking-wide transition-all",
                  creating
                    ? "cursor-not-allowed bg-raised text-fog"
                    : "cursor-pointer bg-gradient-to-r from-gold to-gold-deep text-void",
                ].join(" ")}
              >
                {creating ? "Creating…" : "Create & Join"}
              </button>
            </div>
          </form>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-xl border border-loss/30 bg-loss/5 px-4 py-3">
            <p className="font-mono text-xs text-loss">{error}</p>
          </div>
        )}

        {/* Table list */}
        <div className="flex flex-col gap-3">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : tables.length === 0 ? (
            <div className="rounded-2xl border border-rim bg-elevated p-10 text-center">
              <p className="font-display text-base font-semibold text-silver">No open tables</p>
              <p className="mt-1.5 font-mono text-xs text-fog">
                Create one above to start playing.
              </p>
            </div>
          ) : (
            tables.map((t) => (
              <button
                key={t._id}
                onClick={() => navigate(`/games/teenpatti/${t._id}`)}
                className="group flex items-center justify-between rounded-2xl border border-rim bg-elevated p-4 text-left transition-all hover:border-gold/30 hover:-translate-y-0.5 hover:shadow-[0_0_16px_rgba(245,200,66,0.07)]"
              >
                <div>
                  <p className="font-display text-sm font-semibold text-chalk">{t.tableName}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 font-mono text-xs text-fog">
                    <Users size={11} />
                    {t.seatedCount}/{t.maxSeats} seated · min {t.minStake} coins
                  </p>
                </div>
                <span className="flex items-center gap-1 font-mono text-xs text-gold transition-colors group-hover:text-gold-deep">
                  Join <ChevronRight size={13} />
                </span>
              </button>
            ))
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}