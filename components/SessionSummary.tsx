"use client";

import React from "react";
import { CheckCircle2, Clock, ArrowRight, RotateCcw } from "lucide-react";
import { Plan } from "@/types";

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

  const completionPercentage = Math.round((completedTasks.length / plan.tasks.length) * 100);

  const getSmartRecommendation = () => {
    if (remainingTasks.length === 0) {
      return "All scheduled objectives have been executed with precision. Critical deadlines are secured. Take the rest of the evening to recharge before tomorrow.";
    }
    const next = remainingTasks[0];
    return `Highest-urgency milestones are now locked down. When ready, proceed to **${next.title}** (${next.duration} mins) or defer it to tomorrow morning.`;
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-12 text-center animate-in fade-in duration-300">
      {/* Telemetry Header */}
      <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono tracking-widest uppercase mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <span>SPRINT COMPLETE</span>
      </div>

      <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase font-mono mb-2">
        MOMENTUM UNLOCKED.
      </h1>

      <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto mb-10 font-light leading-relaxed">
        NEXORA has converted your available time into completed action.
      </p>

      {/* Clean Telemetry Strip (No Repetitive Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 py-6 border-y border-white/[0.06] mb-10 font-mono text-center gap-6">
        <div>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">FOCUS TIME</span>
          <span className="text-2xl sm:text-3xl font-black text-brand-cyan">{totalMinutesSpent} MIN</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">COMPLETED</span>
          <span className="text-2xl sm:text-3xl font-black text-white">{completedTasks.length} / {plan.tasks.length}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">PROGRESS</span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-400">{completionPercentage}%</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">REMAINING</span>
          <span className="text-2xl sm:text-3xl font-black text-slate-400">{remainingTasks.length} OBJ</span>
        </div>
      </div>

      {/* Executed Sequence Log */}
      <div className="mb-10 text-left">
        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block mb-4">
          EXECUTED OBJECTIVES
        </span>
        <div className="space-y-3">
          {completedTasks.length > 0 ? (
            completedTasks.map((t, idx) => (
              <div
                key={t.id}
                className="flex items-center justify-between py-2 border-b border-white/[0.04]"
              >
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-sm font-semibold text-white uppercase font-mono">{t.title}</span>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  {t.duration} MIN
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 italic font-mono">No tasks marked complete yet.</p>
          )}
        </div>
      </div>

      {/* NEXORA Next Move Recommendation */}
      <div className="p-6 rounded-2xl surface-obsidian border-brand-cyan/20 mb-10 text-left">
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
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-mono font-bold text-xs tracking-wider bg-brand-cyan hover:bg-sky-400 text-slate-950 flex items-center justify-center space-x-2 shadow-telemetry transition duration-200"
        >
          <span>RETURN TO NEXORA</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        {remainingTasks.length > 0 && (
          <button
            onClick={() => onContinuePlan(remainingTasks[0].id)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-mono text-xs tracking-wider text-slate-300 hover:text-white border border-white/[0.08] hover:border-white/20 transition flex items-center justify-center space-x-2"
          >
            <span>NEXT: {remainingTasks[0].title}</span>
          </button>
        )}

        <button
          onClick={onResetSession}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-mono text-xs text-slate-500 hover:text-slate-300 transition flex items-center justify-center space-x-1.5"
        >
          <RotateCcw className="w-3 h-3" />
          <span>NEW SESSION</span>
        </button>
      </div>
    </div>
  );
}
