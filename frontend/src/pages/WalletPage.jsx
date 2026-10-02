import React from "react";
import NavBar from "../components/layout/NavBar.jsx";
import BottomNav from "../components/layout/BottomNav.jsx";
import { Clock } from "lucide-react";
import Skeleton from "../components/ui/Skeleton.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function WalletPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen w-full bg-void pb-20 sm:pb-0">
      <NavBar />

      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <h1 className="mb-5 font-display text-2xl font-bold text-chalk">Wallet</h1>

        {/* Balance card */}
        <div className="relative mb-5 overflow-hidden rounded-2xl border border-gold/25 bg-gradient-to-br from-[#12100A] to-[#0D1117] p-6">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-gold/8 blur-3xl" />
          <p className="font-mono text-xs uppercase tracking-wider text-fog">Total Balance</p>
          <p className="mt-1 font-display text-5xl font-bold text-gold">
            {(user?.coins ?? 0).toLocaleString()}
          </p>
          <p className="mt-0.5 font-mono text-xs text-fog">coins</p>
        </div>

        {/* Transaction history skeleton */}
        <div>
          <div className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-fog">
            <Clock size={12} />
            Transaction History
          </div>
          <div className="flex flex-col gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-rim bg-elevated p-4">
                <Skeleton className="h-10 w-10 flex-shrink-0" rounded="rounded-xl" />
                <div className="flex-1">
                  <Skeleton className="mb-1.5 h-3 w-1/2" rounded="rounded-md" />
                  <Skeleton className="h-2.5 w-1/3" rounded="rounded-md" />
                </div>
                <Skeleton className="h-4 w-16" rounded="rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
