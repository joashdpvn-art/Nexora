"use client";

import React, { useState } from "react";
import {
  Clock,
  Play,
  Edit3,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Coffee,
  BookOpen,
  FileText,
  Layers,
  ChevronDown,
  ChevronUp,
  Brain,
  HelpCircle,
  ArrowRight
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
        return <Coffee className="w-4 h-4 text-emerald-400" />;
      case "assignment":
        return <FileText className="w-4 h-4 text-indigo-400" />;
      case "review":
        return <CheckCircle2 className="w-4 h-4 text-amber-400" />;
      default:
        return <BookOpen className="w-4 h-4 text-brand-cyan" />;
    }
  };

  const getPriorityBadge = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold tracking-wide uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">
            High Priority
          </span>
        );
      case "medium":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold tracking-wide uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Medium Priority
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold tracking-wide uppercase bg-slate-500/10 text-slate-400 border border-slate-500/20">
            Interval
          </span>
        );
    }
  };

  // Find next uncompleted task
  const nextTask = plan.tasks.find((t) => !completedTaskIds.includes(t.id));

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      {/* View Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-brand-cyan mb-1.5">
            <Brain className="w-3.5 h-3.5" />
            <span>NEXORA Plan Synthesis</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Here&apos;s what I&apos;d do
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl leading-relaxed">
            {plan.summary}
          </p>
        </div>

        {/* Global Action CTAs */}
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={onEditPlan}
            className="px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium glass-panel-interactive text-slate-300 hover:text-white flex items-center space-x-1.5"
            aria-label="Edit plan tasks or durations"
          >
            <Edit3 className="w-4 h-4 text-slate-400" />
            <span>Edit Plan</span>
          </button>

          <button
            onClick={() => onStartPlan(nextTask?.id)}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-brand-cyan hover:bg-sky-400 text-slate-950 flex items-center space-x-2 shadow-glow-cyan transition duration-200"
            aria-label="Start executing plan in focus mode"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Start Plan</span>
          </button>
        </div>
      </div>

      {/* Extracted Context Meta Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="glass-panel p-3 rounded-xl border-white/[0.06]">
          <div className="flex items-center space-x-1.5 text-slate-400 text-xs mb-1">
            <Clock className="w-3.5 h-3.5 text-brand-cyan" />
            <span>Total Duration</span>
          </div>
          <p className="text-lg font-bold text-white font-mono">{plan.totalMinutes} mins</p>
        </div>

        <div className="glass-panel p-3 rounded-xl border-white/[0.06]">
          <div className="flex items-center space-x-1.5 text-slate-400 text-xs mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Urgency State</span>
          </div>
          <p className="text-lg font-bold text-rose-400 font-mono capitalize">
            {plan.extractedContext.urgencyLevel}
          </p>
        </div>

        <div className="glass-panel p-3 rounded-xl border-white/[0.06]">
          <div className="flex items-center space-x-1.5 text-slate-400 text-xs mb-1">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Focus Blocks</span>
          </div>
          <p className="text-lg font-bold text-white font-mono">
            {plan.tasks.filter((t) => t.category !== "break").length} work sprints
          </p>
        </div>

        <div className="glass-panel p-3 rounded-xl border-white/[0.06]">
          <div className="flex items-center space-x-1.5 text-slate-400 text-xs mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Session Status</span>
          </div>
          <p className="text-lg font-bold text-white font-mono">
            {completedTaskIds.length} / {plan.tasks.length} done
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Timeline & Priority Task Cards (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-sm font-mono uppercase tracking-wider text-slate-400">
              Sequence Timeline
            </h3>
            <span className="text-xs text-slate-500 font-mono">Ordered by urgency &amp; return</span>
          </div>

          <div className="relative pl-6 space-y-4 border-l-2 border-white/[0.08] ml-2">
            {plan.tasks.map((task, index) => {
              const isCompleted = completedTaskIds.includes(task.id);
              const isExpanded = expandedTaskId === task.id;

              return (
                <div key={task.id} className="relative group">
                  {/* Timeline node icon */}
                  <div
                    className={`absolute -left-[31px] top-4 w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                      isCompleted
                        ? "bg-emerald-500 border-emerald-400 text-slate-950"
                        : task.priority === "high"
                        ? "bg-surface-300 border-rose-500 text-rose-400 shadow-glow-cyan"
                        : "bg-surface-300 border-white/20 text-slate-400"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <span className="text-[10px] font-mono font-bold">{index + 1}</span>
                    )}
                  </div>

                  {/* Task Card */}
                  <div
                    className={`rounded-2xl transition-all duration-200 border ${
                      isCompleted
                        ? "bg-surface-200/40 border-white/[0.04] opacity-75"
                        : "glass-panel-interactive border-white/[0.08]"
                    } p-4 sm:p-5`}
                  >
                    {/* Top Row: Category, Urgency, Duration */}
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08]">
                          {getCategoryIcon(task.category)}
                        </div>
                        {getPriorityBadge(task.priority)}
                        {task.deadline && (
                          <div className="flex items-center space-x-1 text-xs text-slate-400 font-mono">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            <span>{task.deadline}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-1.5 text-xs font-mono px-2 py-0.5 rounded-md bg-white/[0.06] text-slate-300 border border-white/[0.08]">
                        <Clock className="w-3 h-3 text-brand-cyan" />
                        <span>{task.duration} mins</span>
                      </div>
                    </div>

                    {/* Task Title & Subtitle */}
                    <div className="mb-2">
                      <h4
                        className={`text-base sm:text-lg font-bold tracking-tight ${
                          isCompleted ? "line-through text-slate-400" : "text-white"
                        }`}
                      >
                        {task.title}
                      </h4>
                      {task.subtitle && (
                        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                          {task.subtitle}
                        </p>
                      )}
                    </div>

                    {/* Reasoning Snippet */}
                    {task.reason && (
                      <div className="bg-white/[0.02] border-l-2 border-brand-cyan/40 px-3 py-1.5 rounded-r-lg text-xs text-slate-300 my-2">
                        <span className="font-semibold text-brand-cyan mr-1">Rationale:</span>
                        {task.reason}
                      </div>
                    )}

                    {/* Subtasks Accordion */}
                    {task.subtasks && task.subtasks.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/[0.06]">
                        <button
                          type="button"
                          onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                          className="flex items-center justify-between w-full text-xs text-slate-400 hover:text-white transition py-1"
                        >
                          <span className="font-mono">
                            Sub-objectives ({task.subtasks.length})
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {isExpanded && (
                          <ul className="mt-2 space-y-1.5 pl-1">
                            {task.subtasks.map((st, sidx) => (
                              <li
                                key={sidx}
                                className="text-xs text-slate-300 flex items-start space-x-2"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan mt-1.5 shrink-0" />
                                <span>{st}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}

                    {/* Card Actions */}
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/[0.06]">
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
                          <span>{isCompleted ? "Completed" : "Mark Done"}</span>
                        </button>
                      )}

                      {!isCompleted && (
                        <button
                          type="button"
                          onClick={() => onStartPlan(task.id)}
                          className="ml-auto text-xs font-semibold text-brand-cyan hover:text-sky-300 flex items-center space-x-1 group-hover:translate-x-0.5 transition"
                        >
                          <span>Focus This Task</span>
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

        {/* Reasoning Panel: "Why this order?" (1 col) */}
        <div className="space-y-4">
          <div className="glass-panel p-5 rounded-2xl border-brand-cyan/20 bg-surface-200/50">
            <div className="flex items-center space-x-2 text-xs font-mono font-semibold uppercase text-brand-cyan tracking-wider mb-3">
              <HelpCircle className="w-4 h-4 text-brand-cyan" />
              <span>Why this order?</span>
            </div>

            <div className="space-y-3">
              {plan.reasoning.map((item, idx) => (
                <div key={idx} className="flex items-start space-x-2.5">
                  <div className="w-5 h-5 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-[11px] font-mono flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-white/[0.06]">
              <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                &bull; Urgency decay rule: High-consequence deadlines within 24h preempt all multi-day backlog items.
              </p>
            </div>
          </div>

          {/* Quick Start Card */}
          <div className="glass-panel p-5 rounded-2xl border-white/[0.08] text-center">
            <h4 className="text-sm font-bold text-white mb-1">Ready to execute?</h4>
            <p className="text-xs text-slate-400 mb-4">
              Enter Focus Mode for uninterrupted deep-work sprints with integrated timers.
            </p>
            <button
              onClick={() => onStartPlan(nextTask?.id)}
              className="w-full py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-brand-cyan hover:bg-sky-400 text-slate-950 flex items-center justify-center space-x-2 shadow-glow-cyan transition duration-200"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Enter Focus Mode</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
