import React from "react";
import NavBar from "../components/layout/NavBar.jsx";
import BottomNav from "../components/layout/BottomNav.jsx";
import { ChevronRight, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const MENU_ITEMS = [
  { icon: "🔒", label: "Security & Password" },
  { icon: "🔔", label: "Notifications" },
  { icon: "🎮", label: "Game History" },
  { icon: "🏆", label: "Achievements" },
  { icon: "🆘", label: "Help & Support" },
];

export default function ProfilePage() {
  const { user, logout } = useAuth();

  const initial = user?.username?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <div className="min-h-screen w-full bg-void pb-20 sm:pb-0">
      <NavBar />

      <main className="mx-auto max-w-md px-4 py-6 sm:px-6">
        {/* Avatar + name */}
        <div className="mb-6 flex flex-col items-center gap-3 rounded-2xl border border-rim bg-elevated py-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gold to-info font-display text-4xl font-bold text-void shadow-[0_0_30px_rgba(245,200,66,0.35)]">
            {initial}
          </div>
          <div className="text-center">
            <p className="font-display text-xl font-bold text-chalk">{user?.username}</p>
            <p className="font-mono text-xs text-fog">{user?.email}</p>
          </div>
          <div className="mt-1 rounded-full border border-gold/20 bg-gold/8 px-3 py-0.5 font-mono text-xs text-gold">
            {user?.role === "admin" ? "👑 Admin" : "🎮 Player"}
          </div>
        </div>

        {/* Stats row */}
        <div className="mb-5 grid grid-cols-3 gap-3">
          {[
            { label: "Balance",  value: (user?.coins ?? 0).toLocaleString(), color: "text-gold" },
            { label: "Games",    value: "—",    color: "text-chalk" },
            { label: "Win Rate", value: "—",    color: "text-win"  },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-rim bg-elevated px-3 py-4 text-center">
              <p className={`font-mono text-base font-bold ${s.color}`}>{s.value}</p>
              <p className="mt-0.5 font-mono text-[10px] text-fog">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Menu */}
        <div className="flex flex-col gap-1 rounded-2xl border border-rim bg-elevated overflow-hidden">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.label}
              className="flex items-center justify-between px-5 py-4 text-left text-silver transition-colors hover:bg-raised hover:text-chalk"
            >
              <div className="flex items-center gap-3">
                <span>{item.icon}</span>
                <span className="font-display text-sm">{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[9px] uppercase tracking-wider text-fog/60">soon</span>
                <ChevronRight size={13} className="text-fog" />
              </div>
            </button>
          ))}
          <div className="border-t border-rim" />
          <button
            onClick={logout}
            className="flex items-center gap-3 px-5 py-4 text-left text-loss transition-colors hover:bg-loss/5"
          >
            <LogOut size={16} />
            <span className="font-display text-sm font-semibold">Sign out</span>
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
