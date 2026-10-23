"use client";

import React, { useState } from "react";
import {
  Clock,
  Play,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldAlert,
  SlidersHorizontal,
  Target,
} from "lucide-react";
import { Plan, Task } from "@/types";

interface PlanViewProps {
  plan: Plan;
  completedTaskIds: string[];
  onStartPlan: (taskId?: string) => void;
  onEditPlan: () => void;
  onToggleCompleteTask?: (taskId: string) => void;
}

export function PlanView({
  plan,
  completedTaskIds,
  onStartPlan,
  onEditPlan,
  onToggleCompleteTask,
}: PlanViewProps) {
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(plan.tasks[0]?.id || null);

  const getPriorityTag = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return <span className="text-[10px] font-mono tracking-widest text-rose-400 uppercase font-semibold">CRITICAL</span>;
      case "medium":
        return <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-semibold">MODERATE</span>;
      default:
        return <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase font-semibold">INTERVAL</span>;
    }
  };

  const nextTask = plan.tasks.find((t) => !completedTaskIds.includes(t.id));

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      {/* Editorial Header */}
      <div className="mb-10 pb-6 border-b border-white/[0.06]">
        <div className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-widest text-brand-cyan mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan" />
          <span>STRATEGY SYNTHESIZED</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-mono uppercase mb-3">
          YOUR NEXT MOVE
        </h2>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light max-w-2xl">
          {plan.summary}
        </p>

        {/* Global CTAs */}
        <div className="flex items-center space-x-3 mt-6">
          <button
            onClick={() => onStartPlan(nextTask?.id)}
            className="px-6 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider bg-brand-cyan hover:bg-sky-400 text-slate-950 flex items-center space-x-2 shadow-telemetry transition duration-200"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            <span>START PLAN</span>
          </button>

          <button
            onClick={onEditPlan}
            className="px-4 py-2.5 rounded-xl text-xs font-mono tracking-wider text-slate-400 hover:text-white border border-white/[0.08] hover:border-white/20 transition flex items-center space-x-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>EDIT PLAN</span>
          </button>
        </div>
      </div>

      {/* Sequential Strategy (Progressive Editorial Reveal, No Repetitive Cards) */}
      <div className="space-y-8 mb-12">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 uppercase tracking-widest">
          <span>SEQUENCE TIMELINE</span>
          <span>{plan.totalMinutes} MIN TOTAL &bull; {plan.tasks.length} OBJECTIVES</span>
        </div>

        <div className="space-y-6">
          {plan.tasks.map((task, index) => {
            const isCompleted = completedTaskIds.includes(task.id);
            const isExpanded = expandedTaskId === task.id;
            const isNext = task.id === nextTask?.id;

            return (
              <div
                key={task.id}
                className={`transition-all duration-300 pb-6 border-b border-white/[0.05] ${
                  isCompleted ? "opacity-40" : ""
                }`}
              >
                {/* Header Line */}
                <div className="flex items-baseline justify-between flex-wrap gap-2 mb-2">
                  <div className="flex items-baseline space-x-3">
                    <span className="font-mono text-xs font-bold text-brand-cyan">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3
                      className={`text-lg sm:text-xl font-bold font-mono tracking-tight uppercase ${
                        isCompleted ? "line-through text-slate-500" : isNext ? "text-white" : "text-slate-200"
                      }`}
                    >
                      {task.title}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-3">
                    {getPriorityTag(task.priority)}
                    <span className="text-xs font-mono text-slate-400 flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-brand-cyan" />
                      <span>{task.duration} MIN</span>
                    </span>
                  </div>
                </div>

                {/* 4 Pillars: What to do / Why NEXORA chose it / Success metric */}
                <div className="space-y-1.5 text-xs text-slate-300 font-light pl-7">
                  {task.subtitle && (
                    <div className="flex items-start space-x-2">
                      <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider shrink-0 mt-0.5 w-20">
                        FOCUS:
                      </span>
                      <span className="text-slate-200">{task.subtitle}</span>
                    </div>
                  )}

                  {task.reason && (
                    <div className="flex items-start space-x-2">
                      <span className="font-mono text-[10px] text-brand-cyan uppercase tracking-wider shrink-0 mt-0.5 w-20 font-semibold">
                        LOGIC:
                      </span>
                      <span className="text-slate-300">{task.reason}</span>
                    </div>
                  )}

                  {task.successMetric && (
                    <div className="flex items-start space-x-2">
                      <span className="font-mono text-[10px] text-emerald-400 uppercase tracking-wider shrink-0 mt-0.5 w-20 font-semibold">
                        SUCCESS:
                      </span>
                      <span className="text-emerald-300/90">{task.successMetric}</span>
                    </div>
                  )}
                </div>

                {/* Checkpoints & Inline Actions */}
                <div className="pl-7 pt-3 flex items-center justify-between flex-wrap gap-2">
                  {task.subtasks && task.subtasks.length > 0 && (
                    <div>
                      <button
                        type="button"
                        onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                        className="text-[11px] font-mono text-slate-500 hover:text-slate-300 flex items-center space-x-1 transition"
                      >
                        <Target className="w-3 h-3 text-brand-cyan" />
                        <span>CHECKPOINTS ({task.subtasks.length})</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>

                      {isExpanded && (
                        <ul className="mt-2 space-y-1 pl-1">
                          {task.subtasks.map((st, i) => (
                            <li key={i} className="text-xs text-slate-400 flex items-center space-x-2 font-light">
                              <span className="w-1 h-1 rounded-full bg-brand-cyan" />
                              <span>{st}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  <div className="flex items-center space-x-3 ml-auto">
                    {onToggleCompleteTask && (
                      <button
                        type="button"
                        onClick={() => onToggleCompleteTask(task.id)}
                        className="text-[11px] font-mono text-slate-500 hover:text-white transition flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{isCompleted ? "COMPLETED" : "MARK DONE"}</span>
                      </button>
                    )}

                    {!isCompleted && (
                      <button
                        type="button"
                        onClick={() => onStartPlan(task.id)}
                        className="text-[11px] font-mono font-semibold text-brand-cyan hover:text-sky-300 flex items-center space-x-1 transition"
                      >
                        <span>START THIS OBJECTIVE</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* WHY THIS ORDER — Transparent Decision Console */}
      <div className="p-6 rounded-2xl surface-obsidian border-brand-cyan/20 space-y-4">
        <div className="flex items-center space-x-2 text-[10px] font-mono font-bold uppercase text-brand-cyan tracking-widest">
          <ShieldAlert className="w-3.5 h-3.5 text-brand-cyan" />
          <span>WHY THIS ORDER</span>
        </div>

        <div className="space-y-3">
          {plan.reasoning.map((item, idx) => (
            <div key={idx} className="flex items-start space-x-3">
              <span className="font-mono text-xs font-bold text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/25 rounded px-1.5 py-0.5 shrink-0 mt-0.5">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
