/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        abyss: "#060B16",
        "abyss-edge": "#0A1830",
        panel: "#0E1B2E",
        "panel-border": "#1C3454",
        "tile-idle": "#122540",
        "tile-idle-border": "#22456C",
        "tile-hover-border": "#3AA0FF",
        sonar: "#2F8FFF",
        "sonar-deep": "#1550A6",
        ice: "#EAF3FF",
        muted: "#7C93B3",
        "muted-dim": "#4E6584",
        glow: "#5FB4FF",
        breach: "#DCEEFF",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      keyframes: {
        radarPulse: {
          "0%, 100%": { opacity: 0.6, transform: "scale(1)" },
          "50%": { opacity: 1, transform: "scale(1.08)" },
        },
        sweepRotate: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "radar-pulse": "radarPulse 2.6s ease-in-out infinite",
        "sweep-rotate": "sweepRotate 7s linear infinite",
      },
    },
  },
  plugins: [],
};
