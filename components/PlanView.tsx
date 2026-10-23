"use client";

import React, { useState } from "react";
import {
  Clock,
  Play,
  Calendar,
  CheckCircle2,
  Coffee,
  BookOpen,
  FileText,
  ChevronDown,
  ChevronUp,
  Cpu,
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

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case "break":
        return <Coffee className="w-3.5 h-3.5 text-emerald-400" />;
      case "assignment":
        return <FileText className="w-3.5 h-3.5 text-indigo-400" />;
      case "review":
        return <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <BookOpen className="w-3.5 h-3.5 text-brand-cyan" />;
    }
  };

  const getPriorityBadge = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-rose-500/10 text-rose-400 border border-rose-500/25">
            CRITICAL
          </span>
        );
      case "medium":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/25">
            MODERATE
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-slate-500/10 text-slate-400 border border-slate-500/25">
            INTERVAL
          </span>
        );
    }
  };

  // Find next uncompleted objective
  const nextTask = plan.tasks.find((t) => !completedTaskIds.includes(t.id));

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 animate-in fade-in duration-300">
      {/* Strategy Briefing Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.06] pb-6">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-widest text-brand-cyan mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan"></span>
            <span>STRATEGY CONSTRUCTED</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-mono uppercase">
            YOUR NEXT MOVE
          </h2>
          <p className="text-slate-300 text-sm mt-2 max-w-2xl leading-relaxed font-light">
            {plan.summary}
          </p>
        </div>

        {/* Global Action CTAs */}
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={onEditPlan}
            className="px-3.5 py-2.5 rounded-xl text-xs font-mono tracking-wider surface-interactive text-slate-300 hover:text-white flex items-center space-x-2 border border-white/[0.08]"
            aria-label="Edit plan sequence"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span>EDIT PLAN</span>
          </button>

          <button
            onClick={() => onStartPlan(nextTask?.id)}
            className="px-6 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider bg-brand-cyan hover:bg-sky-400 text-slate-950 flex items-center space-x-2 shadow-telemetry transition duration-200"
            aria-label="Start executing plan in focus mode"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            <span>START PLAN</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progressive Execution Flow (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
              EXECUTION SEQUENCE
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {plan.totalMinutes} MIN TOTAL &bull; {plan.tasks.length} OBJECTIVES
            </span>
          </div>

          <div className="space-y-4">
            {plan.tasks.map((task, index) => {
              const isCompleted = completedTaskIds.includes(task.id);
              const isExpanded = expandedTaskId === task.id;
              const isNext = task.id === nextTask?.id;

              return (
                <div
                  key={task.id}
                  className={`rounded-2xl transition-all duration-300 border p-5 ${
                    isCompleted
                      ? "bg-obsidian-950/40 border-white/[0.04] opacity-55"
                      : isNext
                      ? "surface-obsidian-active"
                      : "surface-interactive"
                  }`}
                >
                  {/* Objective Header Bar */}
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="font-mono text-xs font-bold text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/25 rounded px-2 py-0.5">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <h4
                        className={`text-base sm:text-lg font-bold uppercase font-mono tracking-wide ${
                          isCompleted ? "line-through text-slate-500" : "text-white"
                        }`}
                      >
                        {task.title}
                      </h4>
                    </div>

                    <div className="flex items-center space-x-2">
                      {getPriorityBadge(task.priority)}
                      <div className="flex items-center space-x-1 text-xs font-mono px-2 py-0.5 rounded bg-white/[0.04] text-slate-300 border border-white/[0.06]">
                        <Clock className="w-3 h-3 text-brand-cyan" />
                        <span>{task.duration} MIN</span>
                      </div>
                    </div>
                  </div>

                  {/* 4 Pillars: What to do / Why it matters / What success looks like */}
                  <div className="space-y-2.5 text-xs text-slate-300 font-light border-t border-white/[0.05] pt-3">
                    {/* What to do */}
                    {task.subtitle && (
                      <div className="flex items-start space-x-2">
                        <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider shrink-0 mt-0.5 w-24">
                          WHAT TO DO:
                        </span>
                        <span className="text-slate-200">{task.subtitle}</span>
                      </div>
                    )}

                    {/* Why it matters */}
                    {task.reason && (
                      <div className="flex items-start space-x-2">
                        <span className="font-mono text-[10px] text-brand-cyan uppercase tracking-wider shrink-0 mt-0.5 w-24 font-semibold">
                          WHY IT MATTERS:
                        </span>
                        <span className="text-slate-300">{task.reason}</span>
                      </div>
                    )}

                    {/* What success looks like */}
                    {task.successMetric && (
                      <div className="flex items-start space-x-2">
                        <span className="font-mono text-[10px] text-emerald-400 uppercase tracking-wider shrink-0 mt-0.5 w-24 font-semibold">
                          SUCCESS STATE:
                        </span>
                        <span className="text-emerald-300/90">{task.successMetric}</span>
                      </div>
                    )}
                  </div>

                  {/* Subtask Checkpoints Accordion */}
                  {task.subtasks && task.subtasks.length > 0 && (
                    <div className="mt-3.5 pt-3 border-t border-white/[0.05]">
                      <button
                        type="button"
                        onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                        className="flex items-center justify-between w-full text-xs text-slate-400 hover:text-white transition py-0.5"
                      >
                        <span className="font-mono text-[10px] uppercase tracking-widest flex items-center space-x-1.5">
                          <Target className="w-3 h-3 text-brand-cyan" />
                          <span>ACTIONABLE CHECKPOINTS ({task.subtasks.length})</span>
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {isExpanded && (
                        <ul className="mt-2.5 space-y-1.5 pl-1">
                          {task.subtasks.map((st, sidx) => (
                            <li
                              key={sidx}
                              className="text-xs text-slate-300 flex items-start space-x-2 font-light"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan mt-1.5 shrink-0" />
                              <span>{st}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {/* Card Actions Footer */}
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/[0.05]">
                    {onToggleCompleteTask && (
                      <button
                        type="button"
                        onClick={() => onToggleCompleteTask(task.id)}
                        className={`text-xs font-mono transition flex items-center space-x-1.5 ${
                          isCompleted
                            ? "text-emerald-400 hover:text-emerald-300"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isCompleted ? "COMPLETED" : "MARK DONE"}</span>
                      </button>
                    )}

                    {!isCompleted && (
                      <button
                        type="button"
                        onClick={() => onStartPlan(task.id)}
                        className="ml-auto text-xs font-mono font-semibold text-brand-cyan hover:text-sky-300 flex items-center space-x-1.5 transition"
                      >
                        <span>FOCUS THIS OBJECTIVE</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Intelligent Reasoning Panel: "WHY THIS ORDER" (1 col) */}
        <div className="space-y-4">
          <div className="surface-obsidian p-5 rounded-2xl border-brand-cyan/25">
            <div className="flex items-center space-x-2 text-[10px] font-mono font-bold uppercase text-brand-cyan tracking-widest mb-4">
              <ShieldAlert className="w-3.5 h-3.5 text-brand-cyan" />
              <span>WHY THIS ORDER</span>
            </div>

            <div className="space-y-4">
              {plan.reasoning.map((item, idx) => (
                <div key={idx} className="flex items-start space-x-3">
                  <div className="font-mono text-[11px] font-bold text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/30 rounded px-1.5 py-0.5 shrink-0 mt-0.5">
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                    {item}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-white/[0.06]">
              <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                Urgency algorithm: Nearest-deadline deliverables preempt lower-consequence backlog items.
              </p>
            </div>
          </div>

          {/* Quick Focus Mode Trigger Box */}
          <div className="surface-obsidian p-5 rounded-2xl border-white/[0.08] text-center">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-1">
              EXECUTION READY
            </h4>
            <p className="text-xs text-slate-400 mb-4 font-light">
              Enter Focus Mode for uninterrupted, single-objective deep work.
            </p>
            <button
              onClick={() => onStartPlan(nextTask?.id)}
              className="w-full py-2.5 rounded-xl font-mono font-bold text-xs tracking-wider bg-brand-cyan hover:bg-sky-400 text-slate-950 flex items-center justify-center space-x-2 shadow-telemetry transition duration-200"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              <span>ENGAGE FOCUS MODE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
