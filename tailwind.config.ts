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
        background: "#08090D",
        surface: {
          50: "#1E222D",
          100: "#161922",
          200: "#10131B",
          300: "#0C0E14",
        },
        brand: {
          cyan: "#38BDF8",
          indigo: "#6366F1",
          violet: "#8B5CF6",
          emerald: "#10B981",
          amber: "#F59E0B",
          rose: "#F43F5E",
        },
        border: {
          subtle: "rgba(255, 255, 255, 0.08)",
          glow: "rgba(56, 189, 248, 0.2)",
        }
      },
      boxShadow: {
        "glass": "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        "glow-cyan": "0 0 25px -5px rgba(56, 189, 248, 0.25)",
        "glow-indigo": "0 0 25px -5px rgba(99, 102, 241, 0.25)",
        "glow-emerald": "0 0 25px -5px rgba(16, 185, 129, 0.25)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          from: { backgroundPosition: "0 0" },
          to: { backgroundPosition: "-200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
