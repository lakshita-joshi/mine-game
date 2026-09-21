import React from "react";
import { ShieldCheck } from "lucide-react";

export default function ProvablyFairBadge({ seedHash }) {
  return (
    <div className="flex w-fit items-center gap-2 rounded-xl border border-win/20 bg-win/5 px-3 py-2">
      <ShieldCheck size={14} className="flex-shrink-0 text-win" />
      <span className="font-mono text-xs text-win">Provably Fair</span>
      {seedHash && (
        <span className="font-mono text-xs text-fog">· {seedHash.slice(0, 12)}…</span>
      )}
    </div>
  );
}
