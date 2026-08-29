import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Plus } from "lucide-react";
import NavBar from "../components/layout/NavBar.jsx";
import { tableApi } from "../api/minesApi.js";

export default function TeenPattiLobbyPage() {
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [tableName, setTableName] = useState("");
  const [minStake, setMinStake] = useState(10);

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
    const interval = setInterval(load, 5000); // simple polling refresh
    return () => clearInterval(interval);
  }, [load]);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      const res = await tableApi.create({ tableName, minStake: Number(minStake), maxSeats: 6 });
      navigate(`/games/teenpatti/${res.table._id}`);
    } catch (err) {
      setError(err.message || "Failed to create table");
    }
  }

  return (
    <div className="min-h-screen w-full bg-abyss p-4 text-ice sm:p-8">
      <div className="mx-auto max-w-2xl">
        <NavBar />

        <div className="mt-6 flex items-center justify-between">
          <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-ice">
            <Users size={24} className="text-sonar" />
            Teen Patti Tables
          </h1>
          <button
            onClick={() => setShowCreate((s) => !s)}
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-b from-sonar to-sonar-deep px-4 py-2 font-mono text-xs font-semibold text-[#03101F]"
          >
            <Plus size={14} />
            New table
          </button>
        </div>

        {showCreate && (
          <form
            onSubmit={handleCreate}
            className="mt-4 flex flex-wrap items-end gap-3 rounded-2xl border border-panel-border bg-panel p-4"
          >
            <label className="flex flex-col gap-1">
              <span className="font-mono text-xs text-muted">Table name</span>
              <input
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                required
                className="rounded-lg border border-tile-idle-border bg-abyss-edge px-3 py-2 font-mono text-sm text-ice outline-none"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-mono text-xs text-muted">Min stake</span>
              <input
                type="number"
                value={minStake}
                onChange={(e) => setMinStake(e.target.value)}
                min={1}
                className="w-24 rounded-lg border border-tile-idle-border bg-abyss-edge px-3 py-2 font-mono text-sm text-ice outline-none"
              />
            </label>
            <button
              type="submit"
              className="rounded-lg bg-sonar px-4 py-2 font-mono text-xs font-semibold text-[#03101F]"
            >
              Create & join
            </button>
          </form>
        )}

        {error && (
          <p className="mt-4 rounded-lg border border-breach bg-[#0A1626] px-4 py-3 font-mono text-sm text-breach">
            {error}
          </p>
        )}

        <div className="mt-4 flex flex-col gap-2">
          {loading ? (
            <p className="font-mono text-sm text-muted">Loading tables…</p>
          ) : tables.length === 0 ? (
            <p className="rounded-2xl border border-panel-border bg-panel p-6 text-center font-mono text-sm text-muted-dim">
              No open tables — create one to start playing.
            </p>
          ) : (
            tables.map((t) => (
              <button
                key={t._id}
                onClick={() => navigate(`/games/teenpatti/${t._id}`)}
                className="flex items-center justify-between rounded-2xl border border-panel-border bg-panel p-4 text-left transition-colors hover:border-sonar"
              >
                <div>
                  <p className="font-display text-sm font-bold text-ice">{t.tableName}</p>
                  <p className="mt-1 font-mono text-xs text-muted">
                    Min stake: {t.minStake} · {t.seatedCount}/{t.maxSeats} seated
                  </p>
                </div>
                <span className="font-mono text-xs uppercase text-sonar">Join →</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}