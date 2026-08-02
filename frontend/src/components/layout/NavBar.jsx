import React from "react";
import { Link } from "react-router-dom";
import { Radar, LogOut, Coins } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

export default function NavBar({ backLink }) {
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-panel-border bg-panel px-5 py-4">
      <Link to={backLink || "/dashboard"} className="flex items-center gap-3">
        <Radar className="text-sonar" size={26} strokeWidth={1.75} />
        <div className="font-display text-lg font-bold uppercase tracking-wide text-ice">
          Mines Casino
        </div>
      </Link>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border border-panel-border bg-abyss-edge px-4 py-1.5">
          <Coins size={16} className="text-sonar" />
          <span className="font-mono text-sm font-semibold text-ice">
            {(user?.coins ?? 0).toLocaleString()}
          </span>
        </div>

        <span className="hidden font-mono text-sm text-muted sm:inline">{user?.username}</span>

        <button
          onClick={logout}
          className="flex items-center gap-2 rounded-full border border-panel-border bg-abyss-edge px-3 py-1.5 text-xs text-muted transition-colors hover:text-ice"
        >
          <LogOut size={14} />
          Log out
        </button>
      </div>
    </div>
  );
}
