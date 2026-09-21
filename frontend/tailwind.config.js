/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // ── Premium VaultPlay design tokens ──────────────────────────────
        void:     "#080B12",   // deepest background
        base:     "#0D1117",   // base surfaces
        elevated: "#131920",   // card / panel backgrounds
        raised:   "#1A2332",   // elevated sub-panels
        rim:      "#1E2D42",   // default borders
        "rim-bright": "#2A3F5C", // hover borders
        gold: {
          DEFAULT: "#F5C842",  // primary accent
          deep:    "#C49A10",  // gradient end
          muted:   "#6B5515",  // subtle tint
          subtle:  "#1A160A",  // near-invisible tint
        },
        chalk:  "#F0F4FF",   // primary text
        silver: "#8899B4",   // secondary text
        fog:    "#4E6584",   // dim / label text
        win:    "#22C55E",   // success / safe
        "win-deep": "#16A34A",
        loss:   "#EF4444",   // error / bust
        "loss-deep": "#DC2626",
        info:   "#6366F1",   // info / secondary accent

        // ── Legacy tokens (admin pages + backward compat) ────────────────
        abyss:           "#060B16",
        "abyss-edge":    "#0A1830",
        panel:           "#0E1B2E",
        "panel-border":  "#1C3454",
        "tile-idle":     "#122540",
        "tile-idle-border": "#22456C",
        "tile-hover-border": "#3AA0FF",
        sonar:           "#2F8FFF",
        "sonar-deep":    "#1550A6",
        ice:             "#EAF3FF",
        muted:           "#7C93B3",
        "muted-dim":     "#4E6584",
        glow:            "#5FB4FF",
        breach:          "#DCEEFF",
      },

      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        mono:    ["'IBM Plex Mono'", "monospace"],
        body:    ["'Inter'", "sans-serif"],
      },

      keyframes: {
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-gold": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(245,200,66,0)" },
          "50%":      { boxShadow: "0 0 20px 4px rgba(245,200,66,0.25)" },
        },
        "float-up": {
          "0%":   { transform: "translateY(16px)", opacity: "0" },
          "100%": { transform: "translateY(0)",    opacity: "1" },
        },
        "scale-in": {
          "0%":   { transform: "scale(0.96)", opacity: "0" },
          "100%": { transform: "scale(1)",    opacity: "1" },
        },
        "slide-down": {
          "0%":   { transform: "translateY(-8px)", opacity: "0" },
          "100%": { transform: "translateY(0)",    opacity: "1" },
        },
        "crash-glow": {
          "0%, 100%": { filter: "drop-shadow(0 0 8px rgba(34,197,94,0.4))" },
          "50%":      { filter: "drop-shadow(0 0 24px rgba(34,197,94,0.9))" },
        },
        // Legacy
        radarPulse: {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%":      { opacity: "1",   transform: "scale(1.08)" },
        },
        sweepRotate: {
          from: { transform: "rotate(0deg)" },
          to:   { transform: "rotate(360deg)" },
        },
      },

      animation: {
        shimmer:       "shimmer 2s linear infinite",
        "pulse-gold":  "pulse-gold 2.5s ease-in-out infinite",
        "float-up":    "float-up 0.3s ease-out forwards",
        "scale-in":    "scale-in 0.2s ease-out forwards",
        "slide-down":  "slide-down 0.25s ease-out forwards",
        "crash-glow":  "crash-glow 1.5s ease-in-out infinite",
        // Legacy
        "radar-pulse":   "radarPulse 2.6s ease-in-out infinite",
        "sweep-rotate":  "sweepRotate 7s linear infinite",
      },
    },
  },
  plugins: [],
};
