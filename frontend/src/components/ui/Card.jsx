import React from "react";

export default function Card({
  children,
  className = "",
  hover = false,
  glow = false,
  glass = false,
  padding = true,
  as: Tag = "div",
}) {
  return (
    <Tag
      className={[
        "rounded-2xl border border-rim",
        glass ? "glass" : "bg-elevated",
        padding ? "p-5" : "",
        hover
          ? "cursor-pointer transition-all duration-200 hover:border-gold/30 hover:shadow-[0_0_20px_rgba(245,200,66,0.08)] hover:-translate-y-0.5"
          : "",
        glow ? "glow-gold" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </Tag>
  );
}
