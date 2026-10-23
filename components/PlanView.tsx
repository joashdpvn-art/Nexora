"use client";

import React, { useState } from "react";
import { Play, SlidersHorizontal, ChevronDown, ChevronUp, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { Plan, Task } from "@/types";
import { NexoraCore } from "./NexoraCore";

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
  const [showFullStrategy, setShowFullStrategy] = useState(false);

  // Identify next uncompleted objective (primary decision)
  const primaryObjective = plan.tasks.find((t) => !completedTaskIds.includes(t.id)) || plan.tasks[0];
  const remainingCount = plan.tasks.filter((t) => !completedTaskIds.includes(t.id)).length;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 sm:py-12 flex flex-col items-center text-center animate-in fade-in duration-500">
      {/* Living AI Core Presence (Ready State) */}
      <div className="mb-6">
        <NexoraCore state="ready" size="sm" />
      </div>

      {/* Telemetry Status */}
      <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-mono tracking-widest uppercase mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <span>SYSTEM READY</span>
      </div>

      {/* Hero Decision Tag */}
      <div className="text-[11px] font-mono tracking-[0.25em] text-brand-cyan uppercase font-bold mb-3">
        YOUR NEXT MOVE
      </div>

      {/* Focal Objective Title (Huge, Authoritative) */}
      <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight uppercase font-mono mb-2">
        {primaryObjective.title}
      </h1>

      {/* Duration Callout */}
      <div className="text-xl sm:text-3xl font-mono font-bold text-slate-400 tracking-wider mb-6">
        {primaryObjective.duration} MINUTES
      </div>

      {/* AI Decision Rationale */}
      <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light max-w-lg mb-8">
        &ldquo;{plan.summary}&rdquo;
      </p>

      {/* Primary Action Button: EXECUTE */}
      <div className="mb-6">
        <button
          onClick={() => onStartPlan(primaryObjective.id)}
          className="px-10 py-3.5 rounded-2xl font-mono font-bold text-sm tracking-widest uppercase bg-brand-cyan hover:bg-sky-400 text-slate-950 flex items-center space-x-2.5 shadow-telemetry-active transition-all duration-200 transform hover:scale-[1.02] cursor-pointer"
        >
          <Play className="w-4 h-4 fill-slate-950" />
          <span>EXECUTE</span>
        </button>
      </div>

      {/* Secondary Logic Snippet */}
      <div className="text-xs font-mono text-slate-500 max-w-md mb-10">
        <span className="text-slate-400">DECISION: </span>
        {primaryObjective.reason || "Immediate deadline with highest cognitive load demands protected focus."}
      </div>

      {/* Secondary: View Full Strategy (Progressive Disclosure) */}
      <div className="w-full max-w-xl border-t border-white/[0.06] pt-6">
        <button
          type="button"
          onClick={() => setShowFullStrategy((prev) => !prev)}
          className="inline-flex items-center space-x-2 text-xs font-mono text-slate-400 hover:text-white transition tracking-wider uppercase mb-4"
        >
          <span>{showFullStrategy ? "Hide full sequence" : `View full strategy (${plan.tasks.length} objectives) →`}</span>
          {showFullStrategy ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showFullStrategy && (
          <div className="text-left space-y-6 pt-4 animate-in fade-in duration-300">
            {/* Sequence Timeline */}
            <div className="space-y-4">
              {plan.tasks.map((task, idx) => {
                const isCompleted = completedTaskIds.includes(task.id);
                const isCurrent = task.id === primaryObjective.id;

                return (
                  <div
                    key={task.id}
                    className={`pb-4 border-b border-white/[0.04] transition ${
                      isCompleted ? "opacity-40" : ""
                    }`}
                  >
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-baseline space-x-2.5">
                        <span className="font-mono text-xs font-bold text-brand-cyan">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <h3 className={`font-mono font-bold text-base uppercase ${isCompleted ? "line-through text-slate-500" : isCurrent ? "text-white" : "text-slate-300"}`}>
                          {task.title}
                        </h3>
                      </div>
                      <span className="font-mono text-xs text-slate-400">
                        {task.duration} MIN
                      </span>
                    </div>

                    {task.subtitle && (
                      <p className="text-xs text-slate-400 font-light mt-1 pl-6">
                        {task.subtitle}
                      </p>
                    )}

                    {onToggleCompleteTask && (
                      <div className="pl-6 pt-2 flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => onToggleCompleteTask(task.id)}
                          className="text-[11px] font-mono text-slate-500 hover:text-white transition flex items-center space-x-1"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{isCompleted ? "COMPLETED" : "MARK DONE"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Edit Plan Option */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={onEditPlan}
                className="px-3.5 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-white border border-white/[0.08] hover:border-white/20 transition flex items-center space-x-1.5"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>MODIFY SEQUENCE</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
