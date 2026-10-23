import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050608",
        obsidian: {
          950: "#050608",
          900: "#090B0F",
          850: "#0D1017",
          800: "#121620",
          700: "#1A1F2D",
          600: "#242B3E",
        },
        brand: {
          cyan: "#38BDF8",
          sky: "#0284C7",
          electric: "#00E5FF",
          indigo: "#6366F1",
          violet: "#8B5CF6",
          emerald: "#10B981",
          amber: "#F59E0B",
          rose: "#F43F5E",
        },
      },
      boxShadow: {
        "telemetry": "0 0 15px -3px rgba(56, 189, 248, 0.15)",
        "telemetry-active": "0 0 25px -4px rgba(56, 189, 248, 0.35)",
        "telemetry-emerald": "0 0 20px -3px rgba(16, 185, 129, 0.3)",
        "glass-surface": "0 8px 32px 0 rgba(0, 0, 0, 0.5)",
      },
      animation: {
        "pulse-subtle": "pulseSubtle 4s ease-in-out infinite",
        "grid-fade": "gridFade 8s ease-in-out infinite",
        "scan-line": "scanline 4s linear infinite",
      },
      keyframes: {
        pulseSubtle: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
        gridFade: {
          "0%, 100%": { opacity: "0.03" },
          "50%": { opacity: "0.07" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1000%)" },
        },
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
