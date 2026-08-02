import React from "react";
import { ShieldCheck } from "lucide-react";

export default function ProvablyFairBadge({ seedHash }) {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border border-panel-border bg-abyss-edge px-3 py-1.5 font-mono text-xs text-muted"
      title="Server seed commitment — verifiable once the round ends"
    >
      <ShieldCheck size={14} className="text-sonar" />
      <span>{seedHash}</span>
    </div>
  );
}
