"use client";

import React from "react";
import { Sparkles, RotateCcw, Activity } from "lucide-react";

interface HeaderProps {
  onReset: () => void;
  hasActiveContext: boolean;
  completedCount: number;
}

export function Header({ onReset, hasActiveContext, completedCount }: HeaderProps) {
  return (
    <header className="w-full border-b border-white/[0.06] bg-surface-300/60 backdrop-blur-md sticky top-0 z-40 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Wordmark */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-cyan via-brand-indigo to-brand-violet p-[1px] flex items-center justify-center shadow-glow-cyan">
            <div className="w-full h-full bg-surface-300 rounded-[7px] flex items-center justify-center">
              <span className="text-brand-cyan text-sm font-bold tracking-wider">N</span>
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-lg tracking-wider text-white">NEXORA</span>
              <span className="hidden sm:inline-block text-[11px] font-mono tracking-wide px-2 py-0.5 rounded-full bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20">
                v1.0 MVP
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono tracking-tight hidden md:block">
              Think less. Do more.
            </p>
          </div>
        </div>

        {/* Status Indicators & Controls */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Status Badge */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium tracking-wide">READY</span>
          </div>

          {/* Context Badge */}
          {hasActiveContext ? (
            <div
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-xs font-medium"
              title="Session memory active across page reloads"
            >
              <Activity className="w-3.5 h-3.5 animate-pulse text-brand-cyan" />
              <span className="hidden sm:inline">Session context active</span>
              {completedCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-brand-cyan/20 text-[10px] font-mono font-bold">
                  {completedCount} done
                </span>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-800/60 border border-slate-700/50 text-slate-400 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-slate-400" />
              <span>Standby</span>
            </div>
          )}

          {/* Reset Session */}
          <button
            onClick={onReset}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] transition text-xs font-mono"
            title="Reset session memory"
            aria-label="Reset session memory"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
}
