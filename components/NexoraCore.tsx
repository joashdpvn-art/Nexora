"use client";

import React from "react";

export type CoreState = "idle" | "thinking" | "ready" | "focus" | "result";

interface NexoraCoreProps {
  state?: CoreState;
  size?: "sm" | "md" | "lg";
}

export function NexoraCore({ state = "idle", size = "md" }: NexoraCoreProps) {
  const sizeClasses = {
    sm: "w-20 h-20",
    md: "w-32 h-32 sm:w-40 sm:h-40",
    lg: "w-44 h-44 sm:w-56 sm:h-56",
  }[size];

  const getStateStyles = () => {
    switch (state) {
      case "thinking":
        return {
          glowColor: "rgba(0, 229, 255, 0.45)",
          ambientSize: "scale-110",
          ringAnimation: "animate-[spin_4s_linear_infinite]",
          corePulse: "animate-pulse",
          accentColor: "#00E5FF",
        };
      case "focus":
        return {
          glowColor: "rgba(56, 189, 248, 0.35)",
          ambientSize: "scale-105",
          ringAnimation: "animate-[spin_20s_linear_infinite]",
          corePulse: "animate-[pulse_3s_ease-in-out_infinite]",
          accentColor: "#38BDF8",
        };
      case "result":
        return {
          glowColor: "rgba(16, 185, 129, 0.4)",
          ambientSize: "scale-105",
          ringAnimation: "animate-[spin_30s_linear_infinite]",
          corePulse: "animate-[pulse_4s_ease-in-out_infinite]",
          accentColor: "#10B981",
        };
      case "ready":
        return {
          glowColor: "rgba(56, 189, 248, 0.3)",
          ambientSize: "scale-100",
          ringAnimation: "animate-[spin_25s_linear_infinite]",
          corePulse: "animate-[pulse_5s_ease-in-out_infinite]",
          accentColor: "#38BDF8",
        };
      default: // idle
        return {
          glowColor: "rgba(56, 189, 248, 0.2)",
          ambientSize: "scale-95",
          ringAnimation: "animate-[spin_35s_linear_infinite]",
          corePulse: "animate-[pulse_6s_ease-in-out_infinite]",
          accentColor: "#38BDF8",
        };
    }
  };

  const style = getStateStyles();

  return (
    <div className={`relative flex items-center justify-center ${sizeClasses} select-none pointer-events-none transition-all duration-700`}>
      {/* Outer Soft Atmospheric Light Field */}
      <div
        className={`absolute inset-0 rounded-full blur-2xl sm:blur-3xl transition-all duration-1000 ${style.ambientSize}`}
        style={{ background: style.glowColor }}
      />

      {/* SVG Neural Aperture System */}
      <svg
        className={`w-full h-full transform transition-all duration-700 drop-shadow-[0_0_15px_rgba(56,189,248,0.3)]`}
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Orbital Technical Track (outer) */}
        <circle
          cx="80"
          cy="80"
          r="72"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth="1"
          strokeDasharray="3 6"
        />

        {/* Dynamic Telemetry Ring */}
        <circle
          cx="80"
          cy="80"
          r="62"
          stroke={style.accentColor}
          strokeWidth="1.2"
          strokeDasharray="4 14"
          strokeOpacity={state === "thinking" ? "0.8" : "0.35"}
          className={style.ringAnimation}
          style={{ transformOrigin: "80px 80px" }}
        />

        {/* Counter-rotating Inner Track */}
        <circle
          cx="80"
          cy="80"
          r="48"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="1"
          strokeDasharray="1 8"
          className="animate-[spin_15s_linear_infinite_reverse]"
          style={{ transformOrigin: "80px 80px" }}
        />

        {/* Central Geometric Neural Nodes */}
        <g className={style.corePulse}>
          <polygon
            points="80,45 110,62 110,98 80,115 50,98 50,62"
            stroke={style.accentColor}
            strokeWidth="1"
            strokeOpacity={state === "thinking" ? "0.6" : "0.25"}
            fill="none"
          />
          {/* Inner Core Pulse Gradient */}
          <circle cx="80" cy="80" r="18" fill="url(#core-inner-gradient)" />
          <circle cx="80" cy="80" r="5" fill="#FFFFFF" />
        </g>

        <defs>
          <radialGradient id="core-inner-gradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(80 80) rotate(90) scale(18)">
            <stop stopColor="#00E5FF" stopOpacity="0.8" />
            <stop offset="0.6" stopColor="#38BDF8" stopOpacity="0.4" />
            <stop offset="1" stopColor="#6366F1" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}
