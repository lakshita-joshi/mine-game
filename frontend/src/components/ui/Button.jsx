import React from "react";

const VARIANTS = {
  primary:
    "bg-gradient-to-r from-gold to-gold-deep text-void shadow-[0_0_16px_rgba(245,200,66,0.2)] hover:shadow-[0_0_28px_rgba(245,200,66,0.38)]",
  secondary:
    "border border-rim-bright bg-raised text-chalk hover:border-gold/40 hover:text-gold",
  ghost:
    "text-silver hover:text-chalk hover:bg-elevated",
  danger:
    "border border-loss/30 bg-loss/8 text-loss hover:bg-loss/18",
  win:
    "bg-gradient-to-r from-win to-win-deep text-void shadow-[0_0_16px_rgba(34,197,94,0.2)] hover:shadow-[0_0_28px_rgba(34,197,94,0.38)]",
};

const SIZES = {
  sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
  md: "px-5 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-7 py-3.5 text-sm rounded-xl gap-2",
};

export default function Button({
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  onClick,
  type = "button",
  className = "",
  children,
  fullWidth = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={[
        "inline-flex items-center justify-center font-display font-semibold uppercase tracking-wide",
        "transition-all duration-150 active:scale-[0.97]",
        VARIANTS[variant],
        SIZES[size],
        disabled || loading ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {loading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Loading…
        </>
      ) : (
        children
      )}
    </button>
  );
}
