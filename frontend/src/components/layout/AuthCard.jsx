import React from "react";
import { Radar } from "lucide-react";

export default function AuthCard({ title, subtitle, children }) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-abyss p-4">
      <div className="sonar-sweep animate-sweep-rotate absolute inset-0 opacity-40" aria-hidden="true" />

      <div className="relative w-full max-w-sm rounded-2xl border border-panel-border bg-panel p-6">
        <div className="mb-6 flex flex-col items-center text-center">
          <Radar className="animate-radar-pulse mb-3 text-sonar" size={32} strokeWidth={1.75} />
          <h1 className="font-display text-xl font-bold uppercase tracking-wide text-ice">
            {title}
          </h1>
          {subtitle && <p className="mt-1 font-mono text-xs text-muted">{subtitle}</p>}
        </div>

        {children}
      </div>
    </div>
  );
}
