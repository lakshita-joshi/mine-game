import React from "react";
import NavBar from "../components/layout/NavBar.jsx";
import BottomNav from "../components/layout/BottomNav.jsx";
import Badge from "../components/ui/Badge.jsx";

const PROMOS = [
  {
    emoji: "🎁",
    title: "Welcome Bonus",
    desc: "Get 1,000 free coins when you join VaultPlay.",
    badge: { variant: "new", label: "New" },
    eligible: true,
    cta: "Claim",
    expiry: "Never",
  },
  {
    emoji: "🔥",
    title: "Daily Bonus Streak",
    desc: "Log in every day and multiply your daily reward up to 7×.",
    badge: { variant: "hot", label: "Hot" },
    eligible: true,
    cta: "Claim",
    expiry: "Daily",
  },
  {
    emoji: "🏆",
    title: "Weekend Tournament",
    desc: "Compete in the weekend crash tournament for top prizes.",
    badge: { variant: "coming", label: "Soon" },
    eligible: false,
    cta: "Remind me",
    expiry: "Coming soon",
  },
  {
    emoji: "💎",
    title: "VIP Rakeback",
    desc: "High-volume players earn a percentage of every bet back.",
    badge: { variant: "coming", label: "Soon" },
    eligible: false,
    cta: "Learn more",
    expiry: "Coming soon",
  },
];

export default function PromotionsPage() {
  return (
    <div className="min-h-screen w-full bg-void pb-20 sm:pb-0">
      <NavBar />

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <div className="mb-5">
          <h1 className="font-display text-2xl font-bold text-chalk">Promotions</h1>
          <p className="mt-0.5 font-mono text-xs text-fog">
            Bonuses, tournaments, and rewards
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {PROMOS.map((p) => (
            <div
              key={p.title}
              className={`relative overflow-hidden rounded-2xl border bg-elevated p-5 ${
                p.eligible ? "border-gold/20" : "border-rim opacity-60"
              }`}
            >
              {p.eligible && (
                <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-gold/6 blur-2xl" />
              )}
              <div className="relative">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <span className="text-3xl">{p.emoji}</span>
                  <Badge variant={p.badge.variant}>{p.badge.label}</Badge>
                </div>
                <h2 className="font-display text-base font-semibold text-chalk">{p.title}</h2>
                <p className="mt-1.5 font-mono text-xs text-fog">{p.desc}</p>

                <div className="mt-4 flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-fog/60">
                    Expires: {p.expiry}
                  </span>
                  <button
                    disabled={!p.eligible}
                    className={[
                      "rounded-xl px-4 py-2 font-display text-xs font-semibold transition-all",
                      p.eligible
                        ? "bg-gradient-to-r from-gold to-gold-deep text-void shadow-[0_0_10px_rgba(245,200,66,0.2)]"
                        : "cursor-not-allowed border border-rim text-fog",
                    ].join(" ")}
                  >
                    {p.cta}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
