"use client";

import React from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import { Plan } from "@/types";
import { NexoraCore } from "./NexoraCore";

interface SessionSummaryProps {
  plan: Plan;
  completedTaskIds: string[];
  totalSecondsSpent: number;
  onReturnToCommand: () => void;
  onResetSession: () => void;
  onContinuePlan: (nextTaskId: string) => void;
}

export function SessionSummary({
  plan,
  completedTaskIds,
  totalSecondsSpent,
  onReturnToCommand,
  onResetSession,
  onContinuePlan,
}: SessionSummaryProps) {
  const completedTasks = plan.tasks.filter((t) => completedTaskIds.includes(t.id));
  const remainingTasks = plan.tasks.filter((t) => !completedTaskIds.includes(t.id));

  const totalMinutesSpent = Math.max(
    1,
    Math.round(totalSecondsSpent / 60) ||
      completedTasks.reduce((s, t) => s + t.duration, 0)
  );

  const getSmartRecommendation = () => {
    if (remainingTasks.length === 0) {
      return "All scheduled objectives have been executed with precision. Critical deadlines are secured. Take the rest of the evening to recharge before tomorrow.";
    }
    const next = remainingTasks[0];
    return `Highest-urgency milestones are secured. When ready, proceed to ${next.title} (${next.duration} mins) or defer it to tomorrow morning.`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-12 sm:py-16 text-center animate-in fade-in duration-500">
      {/* Living AI Core in Result State */}
      <div className="mb-6">
        <NexoraCore state="result" size="sm" />
      </div>

      {/* State Badge */}
      <div className="text-[11px] font-mono tracking-[0.25em] text-emerald-400 uppercase font-bold mb-3">
        RESULT
      </div>

      <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight uppercase font-mono mb-4">
        MOMENTUM UNLOCKED.
      </h1>

      <p className="text-slate-300 text-sm sm:text-base max-w-md mx-auto mb-8 font-light leading-relaxed">
        NEXORA has converted your available time into completed action.
      </p>

      {/* Minimal Telemetry Line */}
      <div className="flex items-center justify-center space-x-4 py-4 border-y border-white/[0.06] mb-8 font-mono text-xs text-slate-400">
        <span className="text-brand-cyan font-bold">{totalMinutesSpent} MIN FOCUSED</span>
        <span>&bull;</span>
        <span className="text-white">{completedTasks.length} / {plan.tasks.length} OBJECTIVES SECURED</span>
      </div>

      {/* Next Move Callout */}
      <div className="p-6 rounded-2xl surface-obsidian border-brand-cyan/20 mb-8 text-left">
        <span className="text-[10px] font-mono uppercase tracking-widest text-brand-cyan block mb-2 font-bold">
          YOUR NEXT MOVE
        </span>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-light">
          {getSmartRecommendation()}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={onReturnToCommand}
          className="w-full sm:w-auto px-8 py-3 rounded-xl font-mono font-bold text-xs tracking-widest uppercase bg-brand-cyan hover:bg-sky-400 text-slate-950 flex items-center justify-center space-x-2 shadow-telemetry transition"
        >
          <span>RETURN TO NEXORA</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        {remainingTasks.length > 0 && (
          <button
            onClick={() => onContinuePlan(remainingTasks[0].id)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-mono text-xs tracking-wider text-slate-300 hover:text-white border border-white/[0.08] hover:border-white/20 transition"
          >
            NEXT: {remainingTasks[0].title}
          </button>
        )}

        <button
          onClick={onResetSession}
          className="w-full sm:w-auto px-4 py-3 rounded-xl font-mono text-xs text-slate-500 hover:text-slate-300 transition flex items-center justify-center space-x-1.5"
        >
          <RotateCcw className="w-3 h-3" />
          <span>NEW SESSION</span>
        </button>
      </div>
    </div>
  );
}
