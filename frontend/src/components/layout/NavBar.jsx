import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Crown, Coins, LogOut, ShieldCheck, Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

const NAV_LINKS = [
  { to: "/dashboard",   label: "Home" },
  { to: "/promotions",  label: "Promotions" },
  { to: "/leaderboard", label: "Leaderboard" },
];

export default function NavBar({ backLink }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full glass-heavy border-b border-rim">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">

        {/* ── Logo ────────────────────────────────────────────────────── */}
        <Link
          to={backLink || "/dashboard"}
          className="group flex items-center gap-2.5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-gold-deep shadow-[0_0_12px_rgba(245,200,66,0.35)]">
            <Crown size={18} className="text-void" strokeWidth={2} />
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-chalk transition-colors group-hover:text-gold">
            VaultPlay
          </span>
        </Link>

        {/* ── Desktop nav links ────────────────────────────────────────── */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map(({ to, label }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`rounded-lg px-4 py-2 font-display text-sm font-medium transition-colors ${
                  active
                    ? "bg-gold/8 text-gold"
                    : "text-silver hover:bg-elevated hover:text-chalk"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* ── Right side ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-2">
          {/* Balance pill */}
          <div className="hidden items-center gap-2 rounded-full border border-gold/25 bg-gold/5 px-4 py-1.5 sm:flex">
            <Coins size={14} className="text-gold" />
            <span className="font-mono text-sm font-semibold text-gold">
              {(user?.coins ?? 0).toLocaleString()}
            </span>
          </div>

          {/* Admin link */}
          {user?.role === "admin" && (
            <Link
              to="/admin"
              className="hidden items-center gap-1.5 rounded-xl border border-rim-bright bg-raised px-3 py-2 font-mono text-xs text-silver transition-colors hover:border-gold/30 hover:text-gold sm:flex"
            >
              <ShieldCheck size={13} />
              Admin
            </Link>
          )}

          {/* Profile avatar */}
          <Link
            to="/profile"
            className="hidden items-center gap-2 rounded-xl border border-rim bg-elevated px-3 py-2 font-mono text-xs text-silver transition-colors hover:border-rim-bright hover:text-chalk sm:flex"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-info to-gold text-[10px] font-bold text-void">
              {user?.username?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <span className="hidden md:inline">{user?.username}</span>
          </Link>

          {/* Logout */}
          <button
            onClick={logout}
            title="Log out"
            className="hidden items-center gap-1.5 rounded-xl border border-rim bg-elevated px-3 py-2 font-mono text-xs text-silver transition-colors hover:border-loss/30 hover:text-loss sm:flex"
          >
            <LogOut size={14} />
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-rim bg-elevated text-silver sm:hidden"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ───────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="animate-slide-down border-t border-rim bg-base px-4 py-3 sm:hidden">
          {/* Mobile balance */}
          <div className="mb-3 flex items-center gap-2 rounded-xl border border-gold/25 bg-gold/5 px-4 py-2.5">
            <Coins size={14} className="text-gold" />
            <span className="font-mono text-sm font-semibold text-gold">
              {(user?.coins ?? 0).toLocaleString()}
            </span>
          </div>

          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-3 py-2.5 font-display text-sm text-silver transition-colors hover:bg-elevated hover:text-chalk"
              >
                {label}
              </Link>
            ))}
            <Link
              to="/profile"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-3 py-2.5 font-display text-sm text-silver transition-colors hover:bg-elevated hover:text-chalk"
            >
              Profile
            </Link>
            {user?.role === "admin" && (
              <Link
                to="/admin"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 font-display text-sm text-silver transition-colors hover:bg-elevated hover:text-chalk"
              >
                <ShieldCheck size={14} />
                Admin Panel
              </Link>
            )}
            <button
              onClick={() => { logout(); setMobileOpen(false); }}
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left font-display text-sm text-loss transition-colors hover:bg-loss/5"
            >
              <LogOut size={14} />
              Log out
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}