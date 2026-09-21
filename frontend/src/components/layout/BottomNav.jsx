import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Gamepad2, Gift, Wallet, User } from "lucide-react";

const TABS = [
  { to: "/dashboard",  icon: Home,     label: "Home"    },
  { to: "/promotions", icon: Gift,     label: "Offers"  },
  { to: "/wallet",     icon: Wallet,   label: "Wallet"  },
  { to: "/leaderboard",icon: Gamepad2, label: "Ranks"   },
  { to: "/profile",    icon: User,     label: "Profile" },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-heavy border-t border-rim sm:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {TABS.map(({ to, icon: Icon, label }) => {
          const active = pathname === to || (to === "/dashboard" && pathname === "/");
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 transition-colors ${
                active ? "text-gold" : "text-fog hover:text-silver"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2 : 1.5} />
              <span className="font-mono text-[10px]">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
