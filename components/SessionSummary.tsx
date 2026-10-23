"use client";

import React from "react";
import { CheckCircle2, Clock, ArrowRight, RotateCcw, Award, Layers } from "lucide-react";
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
    <div className="w-full max-w-3xl mx-auto px-4 py-8 text-center animate-in fade-in duration-300">
      {/* Telemetry Badge */}
      <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono tracking-wider mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        <span className="uppercase">SPRINT COMPLETE</span>
      </div>

      <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase font-mono mb-2">
        MOMENTUM UNLOCKED.
      </h1>

      <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto mb-8 font-light leading-relaxed">
        NEXORA has converted your available time into completed action.
      </p>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="surface-obsidian p-4 rounded-xl border-white/[0.06]">
          <div className="flex items-center justify-center space-x-1.5 text-[10px] font-mono uppercase text-slate-500 mb-1">
            <Clock className="w-3 h-3 text-brand-cyan" />
            <span>FOCUS TIME</span>
          </div>
          <p className="text-2xl font-black text-brand-cyan font-mono">
            {totalMinutesSpent} MIN
          </p>
        </div>

        <div className="surface-obsidian p-4 rounded-xl border-white/[0.06]">
          <div className="flex items-center justify-center space-x-1.5 text-[10px] font-mono uppercase text-slate-500 mb-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>COMPLETED</span>
          </div>
          <p className="text-2xl font-black text-white font-mono">
            {completedTasks.length} / {plan.tasks.length}
          </p>
        </div>

        <div className="surface-obsidian p-4 rounded-xl border-white/[0.06]">
          <div className="flex items-center justify-center space-x-1.5 text-[10px] font-mono uppercase text-slate-500 mb-1">
            <Award className="w-3 h-3 text-amber-400" />
            <span>PROGRESS</span>
          </div>
          <p className="text-2xl font-black text-amber-400 font-mono">
            {completionPercentage}%
          </p>
        </div>

        <div className="surface-obsidian p-4 rounded-xl border-white/[0.06]">
          <div className="flex items-center justify-center space-x-1.5 text-[10px] font-mono uppercase text-slate-500 mb-1">
            <Layers className="w-3 h-3 text-indigo-400" />
            <span>REMAINING</span>
          </div>
          <p className="text-2xl font-black text-white font-mono">
            {remainingTasks.length} OBJECTIVES
          </p>
        </div>
      </div>

      {/* Completed Objectives Log */}
      <div className="surface-obsidian p-5 rounded-2xl border-white/[0.06] mb-6 text-left">
        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-3">
          EXECUTED IN THIS SPRINT
        </span>
        <div className="space-y-2">
          {completedTasks.length > 0 ? (
            completedTasks.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-3 rounded-xl bg-obsidian-900 border border-white/[0.04]"
              >
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-sm font-semibold text-white uppercase font-mono">{t.title}</span>
                    {t.subtitle && (
                      <p className="text-xs text-slate-400 font-light">{t.subtitle}</p>
                    )}
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-400 px-2 py-0.5 rounded bg-white/[0.04]">
                  {t.duration} MIN
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 italic font-mono">No tasks marked complete yet.</p>
          )}
        </div>
      </div>

      {/* NEXORA Next Recommendation Box */}
      <div className="surface-obsidian p-5 rounded-2xl border-brand-cyan/25 bg-gradient-to-r from-brand-cyan/[0.03] to-brand-indigo/[0.03] mb-8 text-left">
        <span className="text-[10px] font-mono uppercase tracking-widest text-brand-cyan block mb-2">
          YOUR NEXT MOVE
        </span>
        <p className="text-sm text-slate-200 leading-relaxed font-light">
          {getSmartRecommendation()}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={onReturnToCommand}
          className="w-full sm:w-auto px-6 py-3 rounded-xl font-mono font-bold text-xs tracking-wider bg-brand-cyan hover:bg-sky-400 text-slate-950 flex items-center justify-center space-x-2 shadow-telemetry transition duration-200"
        >
          <span>RETURN TO NEXORA</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        {remainingTasks.length > 0 && (
          <button
            onClick={() => onContinuePlan(remainingTasks[0].id)}
            className="w-full sm:w-auto px-5 py-3 rounded-xl font-mono text-xs tracking-wider surface-interactive text-slate-300 hover:text-white flex items-center justify-center space-x-2 transition"
          >
            <span>NEXT: {remainingTasks[0].title}</span>
          </button>
        )}

        <button
          onClick={onResetSession}
          className="w-full sm:w-auto px-4 py-3 rounded-xl font-mono text-xs text-slate-500 hover:text-slate-300 flex items-center justify-center space-x-1.5 transition"
        >
          <RotateCcw className="w-3 h-3" />
          <span>NEW SESSION</span>
        </button>
      </div>
    </div>
  );
}
