"use client";

import React from "react";
import { RotateCcw } from "lucide-react";

export type SystemStatusState = "online" | "thinking" | "ready" | "focus";

interface HeaderProps {
  systemStatus?: SystemStatusState;
  hasActiveContext: boolean;
  completedCount: number;
  onReset: () => void;
}

export function Header({
  systemStatus = "online",
  hasActiveContext,
  completedCount,
  onReset,
}: HeaderProps) {
  const getStatusTelemetry = () => {
    switch (systemStatus) {
      case "thinking":
        return {
          label: "SYSTEM THINKING",
          dotColor: "bg-brand-cyan",
          ping: true,
          textColor: "text-brand-cyan",
        };
      case "focus":
        return {
          label: "FOCUS ACTIVE",
          dotColor: "bg-brand-electric",
          ping: true,
          textColor: "text-brand-electric",
        };
      case "ready":
        return {
          label: "SYSTEM READY",
          dotColor: "bg-emerald-400",
          ping: false,
          textColor: "text-emerald-400",
        };
      default:
        return {
          label: "SYSTEM ONLINE",
          dotColor: "bg-brand-cyan",
          ping: false,
          textColor: "text-slate-400",
        };
    }
  };

  const status = getStatusTelemetry();

  return (
    <header className="w-full border-b border-white/[0.05] bg-obsidian-950/70 backdrop-blur-xl sticky top-0 z-40 transition-all duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Identity: Neural Aperture + Monospace Wordmark */}
        <div className="flex items-center space-x-3">
          <div className="relative w-7 h-7 flex items-center justify-center shrink-0">
            <svg
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-7 h-7 drop-shadow-[0_0_8px_rgba(56,189,248,0.35)]"
            >
              <polygon
                points="16,3 28,10 28,22 16,29 4,22 4,10"
                stroke="rgba(56, 189, 248, 0.3)"
                strokeWidth="1.2"
                strokeDasharray="2 3"
              />
              <path
                d="M9 22V10L23 22V10"
                stroke="url(#nexora-gradient-head)"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="9" cy="10" r="1.5" fill="#38BDF8" />
              <circle cx="16" cy="16" r="1.5" fill="#00E5FF" />
              <circle cx="23" cy="22" r="1.5" fill="#818CF8" />
              <defs>
                <linearGradient id="nexora-gradient-head" x1="9" y1="10" x2="23" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#38BDF8" />
                  <stop offset="0.5" stopColor="#00E5FF" />
                  <stop offset="1" stopColor="#818CF8" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="font-bold text-base tracking-widest text-white uppercase font-mono">
              NEXORA
            </span>
          </div>
        </div>

        {/* Minimal System Telemetry & Reset */}
        <div className="flex items-center space-x-4">
          {/* Status Indicator */}
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              {status.ping && (
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status.dotColor}`}></span>
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${status.dotColor}`}></span>
            </span>
            <span className={`text-[11px] font-mono tracking-widest uppercase font-medium ${status.textColor}`}>
              {status.label}
            </span>
            {hasActiveContext && completedCount > 0 && (
              <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
                ({completedCount} done)
              </span>
            )}
          </div>

          {/* Reset Control */}
          <button
            onClick={onReset}
            className="flex items-center space-x-1.5 px-2 py-1 rounded text-[11px] font-mono text-slate-500 hover:text-slate-300 transition"
            title="Purge session memory"
            aria-label="Purge session memory"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline tracking-wider">RESET</span>
          </button>
        </div>
      </div>
    </header>
  );
}
