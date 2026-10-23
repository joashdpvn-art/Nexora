"use client";

import React, { useEffect } from "react";
import { CheckCircle2, Clock, Sparkles, ArrowRight, RotateCcw, Award } from "lucide-react";
import confetti from "canvas-confetti";
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
  useEffect(() => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#38bdf8", "#6366f1", "#10b981", "#f59e0b"],
      });
    } catch (e) {
      console.log(e);
    }
  }, []);

  const completedTasks = plan.tasks.filter((t) => completedTaskIds.includes(t.id));
  const remainingTasks = plan.tasks.filter((t) => !completedTaskIds.includes(t.id));

  const totalMinutesSpent = Math.max(
    1,
    Math.round(totalSecondsSpent / 60) ||
      completedTasks.reduce((s, t) => s + t.duration, 0)
  );

  const getSmartRecommendation = () => {
    if (remainingTasks.length === 0) {
      return "You've successfully cleared tonight's agenda! High-urgency objectives are secured. Take the rest of the evening to recharge before tomorrow.";
    }
    const next = remainingTasks[0];
    return `You've locked down your most urgent milestone. When ready, follow up with **${next.title}** (${next.duration} mins) or defer it to tomorrow morning.`;
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-10 text-center">
      {/* Badge */}
      <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono mb-4">
        <Sparkles className="w-3.5 h-3.5" />
        <span>EXECUTION SPRINT COMPLETED</span>
      </div>

      <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-3">
        Momentum unlocked.
      </h1>

      <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto mb-8 leading-relaxed">
        You converted intentions into tangible output. Here is the operational summary of your
        session.
      </p>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="glass-panel p-4 rounded-xl border-white/[0.06]">
          <div className="flex items-center justify-center space-x-1.5 text-xs text-slate-400 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Completed</span>
          </div>
          <p className="text-2xl font-black text-white font-mono">
            {completedTasks.length} / {plan.tasks.length}
          </p>
        </div>

        <div className="glass-panel p-4 rounded-xl border-white/[0.06]">
          <div className="flex items-center justify-center space-x-1.5 text-xs text-slate-400 mb-1">
            <Clock className="w-3.5 h-3.5 text-brand-cyan" />
            <span>Time Focused</span>
          </div>
          <p className="text-2xl font-black text-brand-cyan font-mono">
            {totalMinutesSpent}m
          </p>
        </div>

        <div className="glass-panel p-4 rounded-xl border-white/[0.06]">
          <div className="flex items-center justify-center space-x-1.5 text-xs text-slate-400 mb-1">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Completion</span>
          </div>
          <p className="text-2xl font-black text-amber-400 font-mono">
            {Math.round((completedTasks.length / plan.tasks.length) * 100)}%
          </p>
        </div>

        <div className="glass-panel p-4 rounded-xl border-white/[0.06]">
          <div className="flex items-center justify-center space-x-1.5 text-xs text-slate-400 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Remaining</span>
          </div>
          <p className="text-2xl font-black text-white font-mono">
            {remainingTasks.length} tasks
          </p>
        </div>
      </div>

      {/* Completed Tasks Card */}
      <div className="glass-panel p-6 rounded-2xl border-white/[0.08] mb-6 text-left">
        <h3 className="text-sm font-mono uppercase tracking-wider text-slate-400 mb-3">
          Completed in this session
        </h3>
        <div className="space-y-2.5">
          {completedTasks.length > 0 ? (
            completedTasks.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]"
              >
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-sm font-semibold text-white">{t.title}</span>
                    {t.subtitle && (
                      <p className="text-xs text-slate-400">{t.subtitle}</p>
                    )}
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-400 px-2 py-0.5 rounded bg-white/[0.04]">
                  {t.duration} mins
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 italic">No tasks marked complete yet.</p>
          )}
        </div>
      </div>

      {/* NEXORA Next Recommendation Card */}
      <div className="glass-panel p-6 rounded-2xl border-brand-cyan/20 bg-gradient-to-r from-brand-cyan/[0.04] to-brand-indigo/[0.04] mb-8 text-left">
        <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-brand-cyan mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>NEXORA Recommendation</span>
        </div>
        <p className="text-sm text-slate-200 leading-relaxed">
          {getSmartRecommendation()}
        </p>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={onReturnToCommand}
          className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-brand-cyan hover:bg-sky-400 text-slate-950 flex items-center justify-center space-x-2 shadow-glow-cyan transition duration-200"
        >
          <span>RETURN TO NEXORA</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {remainingTasks.length > 0 && (
          <button
            onClick={() => onContinuePlan(remainingTasks[0].id)}
            className="w-full sm:w-auto px-5 py-3 rounded-xl font-medium text-xs sm:text-sm glass-panel text-slate-300 hover:text-white flex items-center justify-center space-x-2 transition"
          >
            <span>Start Next Task ({remainingTasks[0].title})</span>
          </button>
        )}

        <button
          onClick={onResetSession}
          className="w-full sm:w-auto px-4 py-3 rounded-xl font-mono text-xs text-slate-500 hover:text-slate-300 flex items-center justify-center space-x-1.5 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New Session</span>
        </button>
      </div>
    </div>
  );
}
