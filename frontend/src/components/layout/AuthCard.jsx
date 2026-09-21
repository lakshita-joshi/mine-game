import React from "react";
import { Crown } from "lucide-react";
import { Link } from "react-router-dom";

export default function AuthCard({ title, subtitle, children }) {
  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-void">

      {/* ── Left decorative panel (desktop only) ────────────────────── */}
      <div className="relative hidden items-center justify-center overflow-hidden lg:flex lg:w-1/2">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D1117] via-[#12100A] to-[#0A0B12]" />

        {/* Ambient glows */}
        <div className="absolute top-1/4 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-gold/6 blur-3xl" />
        <div className="absolute bottom-1/3 left-1/3 h-48 w-48 rounded-full bg-info/5 blur-3xl" />

        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(245,200,66,0.9) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-xs px-12 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-gold to-gold-deep shadow-[0_0_40px_rgba(245,200,66,0.4)]">
            <Crown size={36} className="text-void" strokeWidth={2} />
          </div>
          <h1 className="mb-3 font-display text-4xl font-bold text-chalk">
            Vault<span className="text-gold">Play</span>
          </h1>
          <p className="text-base text-silver">
            The premium gaming platform where every bet counts.
          </p>

          <div className="mt-10 flex flex-col gap-3 text-left">
            {[
              { icon: "🎰", title: "Premium Games",   desc: "Crash, Mines, Dragon Tiger & more" },
              { icon: "🔒", title: "Provably Fair",   desc: "Every result is cryptographically verified" },
              { icon: "⚡", title: "Instant Payouts", desc: "Withdraw your winnings immediately" },
            ].map((f) => (
              <div
                key={f.title}
                className="flex items-start gap-3 rounded-xl border border-rim bg-elevated/50 px-4 py-3"
              >
                <span className="text-xl">{f.icon}</span>
                <div>
                  <p className="font-display text-sm font-semibold text-chalk">{f.title}</p>
                  <p className="font-mono text-xs text-fog">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: Auth form ─────────────────────────────────────────── */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        {/* Mobile background glow */}
        <div className="absolute inset-0 lg:hidden">
          <div className="absolute top-1/4 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-gold/5 blur-3xl" />
        </div>

        <div className="relative w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-gold-deep shadow-[0_0_16px_rgba(245,200,66,0.4)]">
              <Crown size={20} className="text-void" strokeWidth={2} />
            </div>
            <span className="font-display text-2xl font-bold text-chalk">
              Vault<span className="text-gold">Play</span>
            </span>
          </div>

          <div className="rounded-2xl border border-rim bg-elevated p-8">
            <div className="mb-6">
              <h2 className="font-display text-2xl font-bold text-chalk">{title}</h2>
              {subtitle && (
                <p className="mt-1 font-mono text-sm text-fog">{subtitle}</p>
              )}
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
