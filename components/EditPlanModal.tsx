"use client";

import React, { useState } from "react";
import { X, Trash2, Plus, Minus, Clock, Check, AlertCircle, Sliders } from "lucide-react";
import { Task } from "@/types";

interface EditPlanModalProps {
  tasks: Task[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTasks: Task[]) => void;
}

export function EditPlanModal({ tasks, isOpen, onClose, onSave }: EditPlanModalProps) {
  const [editableTasks, setEditableTasks] = useState<Task[]>(tasks);

  React.useEffect(() => {
    setEditableTasks(tasks);
  }, [tasks, isOpen]);

  if (!isOpen) return null;

  const handleDurationChange = (taskId: string, delta: number) => {
    setEditableTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const newDur = Math.max(5, t.duration + delta);
          return { ...t, duration: newDur };
        }
        return t;
      })
    );
  };

  const handleRemoveTask = (taskId: string) => {
    if (editableTasks.length <= 1) return;
    setEditableTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const totalMinutes = editableTasks.reduce((sum, t) => sum + t.duration, 0);

  const handleSave = () => {
    onSave(editableTasks);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="surface-obsidian w-full max-w-xl rounded-2xl border-white/[0.1] bg-obsidian-950 shadow-2xl p-6 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-plan-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 id="edit-plan-title" className="text-base font-bold text-white tracking-wide uppercase font-mono">
                EDIT EXECUTION PLAN
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 font-light">
                Adjust block durations or eliminate objectives to fit your schedule.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Task List */}
        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
          {editableTasks.map((task) => (
            <div
              key={task.id}
              className="p-3.5 rounded-xl bg-obsidian-900 border border-white/[0.06] flex items-center justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-white uppercase font-mono truncate">
                    {task.title}
                  </span>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded uppercase ${
                      task.priority === "high"
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
                {task.subtitle && (
                  <p className="text-xs text-slate-400 truncate mt-0.5 font-light">{task.subtitle}</p>
                )}
              </div>

              {/* Duration +/- controls */}
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleDurationChange(task.id, -5)}
                  disabled={task.duration <= 5}
                  className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center transition"
                  aria-label="Decrease 5 minutes"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <div className="w-14 text-center font-mono text-xs font-bold text-brand-cyan">
                  {task.duration}M
                </div>

                <button
                  type="button"
                  onClick={() => handleDurationChange(task.id, 5)}
                  className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-white flex items-center justify-center transition"
                  aria-label="Increase 5 minutes"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>

                {/* Remove Task */}
                <button
                  type="button"
                  onClick={() => handleRemoveTask(task.id)}
                  disabled={editableTasks.length <= 1}
                  className="p-1.5 rounded-lg text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/10 transition disabled:opacity-20 disabled:cursor-not-allowed ml-1"
                  title="Remove this objective"
                  aria-label={`Remove ${task.title}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Warning if only 1 task */}
        {editableTasks.length <= 1 && (
          <div className="mt-3 flex items-center space-x-1.5 text-xs text-amber-400/80 font-mono">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Minimum of one objective required in active plan.</span>
          </div>
        )}

        {/* Footer / Total & Apply */}
        <div className="pt-4 mt-4 border-t border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs font-mono text-slate-400">
            <Clock className="w-4 h-4 text-brand-cyan" />
            <span>TOTAL TIME: </span>
            <span className="text-white font-bold">{totalMinutes} MIN</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white transition"
            >
              CANCEL
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-mono font-bold bg-brand-cyan hover:bg-sky-400 text-slate-950 flex items-center space-x-1.5 shadow-telemetry transition duration-200"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>APPLY CHANGES</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
