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
  const getStatusBadge = () => {
    switch (systemStatus) {
      case "thinking":
        return {
          label: "THINKING",
          dotColor: "bg-brand-cyan",
          pingColor: "bg-brand-cyan",
          textColor: "text-brand-cyan",
          borderColor: "border-brand-cyan/40",
          bgColor: "bg-brand-cyan/10",
        };
      case "focus":
        return {
          label: "FOCUS ACTIVE",
          dotColor: "bg-brand-electric",
          pingColor: "bg-brand-electric",
          textColor: "text-brand-electric",
          borderColor: "border-brand-cyan/40",
          bgColor: "bg-brand-cyan/15",
        };
      case "ready":
        return {
          label: "READY",
          dotColor: "bg-emerald-400",
          pingColor: "bg-emerald-400",
          textColor: "text-emerald-400",
          borderColor: "border-emerald-500/30",
          bgColor: "bg-emerald-500/10",
        };
      default:
        return {
          label: "ONLINE",
          dotColor: "bg-brand-cyan",
          pingColor: "bg-brand-cyan",
          textColor: "text-slate-300",
          borderColor: "border-white/[0.08]",
          bgColor: "bg-white/[0.03]",
        };
    }
  };

  const status = getStatusBadge();

  return (
    <header className="w-full border-b border-white/[0.06] bg-obsidian-950/80 backdrop-blur-xl sticky top-0 z-40 transition-all duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand System Identity */}
        <div className="flex items-center space-x-3.5">
          {/* Refined NEXORA Neural Aperture Symbol */}
          <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
            <svg
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]"
            >
              {/* Outer hexagonal technical aperture */}
              <polygon
                points="16,3 28,10 28,22 16,29 4,22 4,10"
                stroke="rgba(56, 189, 248, 0.35)"
                strokeWidth="1.2"
                strokeDasharray="2 3"
              />
              {/* Inner stylized geometric 'N' neural path */}
              <path
                d="M9 22V10L23 22V10"
                stroke="url(#nexora-gradient)"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Neural pulse nodes */}
              <circle cx="9" cy="10" r="1.5" fill="#38BDF8" />
              <circle cx="16" cy="16" r="1.5" fill="#00E5FF" />
              <circle cx="23" cy="22" r="1.5" fill="#818CF8" />

              <defs>
                <linearGradient id="nexora-gradient" x1="9" y1="10" x2="23" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#38BDF8" />
                  <stop offset="0.5" stopColor="#00E5FF" />
                  <stop offset="1" stopColor="#818CF8" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Wordmark & Tagline */}
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base sm:text-lg tracking-widest text-white uppercase font-mono">
                NEXORA
              </span>
              <span className="text-[9px] font-mono tracking-wider px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06] hidden sm:inline-block">
                SYS.OS
              </span>
            </div>
            <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase hidden md:block">
              Think less. Do more.
            </span>
          </div>
        </div>

        {/* System Telemetry & Console Status */}
        <div className="flex items-center space-x-3 sm:space-x-5">
          {/* SYSTEM TELEMETRY */}
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 hidden lg:inline">
              SYSTEM
            </span>
            <div
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono tracking-wider border ${status.bgColor} ${status.borderColor} ${status.textColor}`}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status.pingColor}`}
                ></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${status.dotColor}`}></span>
              </span>
              <span className="font-semibold">{status.label}</span>
            </div>
          </div>

          {/* CONTEXT STATUS */}
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 hidden lg:inline">
              CONTEXT
            </span>
            <div
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono tracking-wider border ${
                hasActiveContext
                  ? "bg-brand-cyan/10 border-brand-cyan/30 text-brand-cyan"
                  : "bg-white/[0.02] border-white/[0.06] text-slate-400"
              }`}
              title={hasActiveContext ? "Session memory active across reloads" : "No active session in memory"}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  hasActiveContext ? "bg-brand-cyan animate-pulse" : "bg-slate-600"
                }`}
              />
              <span className="font-medium">
                {hasActiveContext ? "ACTIVE" : "STANDBY"}
              </span>
              {hasActiveContext && completedCount > 0 && (
                <span className="ml-0.5 px-1 rounded text-[9px] font-bold bg-brand-cyan/20 text-brand-cyan">
                  {completedCount}
                </span>
              )}
            </div>
          </div>

          {/* CONSOLE RESET */}
          <button
            onClick={onReset}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono text-slate-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] transition"
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
