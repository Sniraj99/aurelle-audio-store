import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        obsidian: "#080A0E",
        midnight: "#0B1426",
        surface: "#111D32",
        gold: "#C5A15A",
        champagne: "#E4CC9A",
        soft: "#E8EAF0",
        muted: "#9AA3B2",
        line: "#263044",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      borderRadius: { DEFAULT: "2px", sm: "2px", md: "4px" },
      maxWidth: { frame: "88rem" },
      transitionTimingFunction: { lux: "cubic-bezier(0.22, 1, 0.36, 1)" },
      keyframes: {
        rise: { from: { opacity: "0", transform: "translateY(18px)" }, to: { opacity: "1", transform: "none" } },
        fade: { from: { opacity: "0" }, to: { opacity: "1" } },
        breathe: { "0%,100%": { opacity: "0.55" }, "50%": { opacity: "0.9" } },
      },
      animation: {
        rise: "rise 1.1s cubic-bezier(0.22,1,0.36,1) both",
        fade: "fade 1.4s ease both",
        breathe: "breathe 7s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
