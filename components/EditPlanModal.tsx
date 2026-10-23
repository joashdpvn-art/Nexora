"use client";

import React, { useState } from "react";
import { X, Trash2, Plus, Minus, Clock, Check, AlertCircle } from "lucide-react";
import { Task } from "@/types";

interface EditPlanModalProps {
  tasks: Task[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTasks: Task[]) => void;
}

export function EditPlanModal({ tasks, isOpen, onClose, onSave }: EditPlanModalProps) {
  const [editableTasks, setEditableTasks] = useState<Task[]>(tasks);

  // Sync state when opened
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
    if (editableTasks.length <= 1) return; // Keep at least one task
    setEditableTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const totalMinutes = editableTasks.reduce((sum, t) => sum + t.duration, 0);

  const handleSave = () => {
    onSave(editableTasks);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="glass-panel w-full max-w-xl rounded-2xl border-white/[0.1] bg-surface-300 shadow-2xl p-6 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-plan-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-4">
          <div>
            <h3 id="edit-plan-title" className="text-lg font-bold text-white tracking-tight">
              Edit Execution Plan
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Adjust block durations or remove tasks to fit your exact availability.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition"
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
              className="p-3.5 rounded-xl bg-surface-200/60 border border-white/[0.06] flex items-center justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-white truncate">
                    {task.title}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded uppercase ${
                      task.priority === "high"
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
                {task.subtitle && (
                  <p className="text-xs text-slate-400 truncate mt-0.5">{task.subtitle}</p>
                )}
              </div>

              {/* Duration +/- controls */}
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleDurationChange(task.id, -5)}
                  disabled={task.duration <= 5}
                  className="w-7 h-7 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center transition"
                  aria-label="Decrease 5 minutes"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <div className="w-16 text-center font-mono text-sm font-bold text-brand-cyan">
                  {task.duration}m
                </div>

                <button
                  type="button"
                  onClick={() => handleDurationChange(task.id, 5)}
                  className="w-7 h-7 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white flex items-center justify-center transition"
                  aria-label="Increase 5 minutes"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>

                {/* Remove Task Button */}
                <button
                  type="button"
                  onClick={() => handleRemoveTask(task.id)}
                  disabled={editableTasks.length <= 1}
                  className="p-1.5 rounded-lg text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/10 transition disabled:opacity-20 disabled:cursor-not-allowed ml-1"
                  title="Remove this task"
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
          <div className="mt-3 flex items-center space-x-1.5 text-xs text-amber-400/80">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>At least one task is required in an active plan.</span>
          </div>
        )}

        {/* Footer / Total & Submit */}
        <div className="pt-4 mt-4 border-t border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs font-mono text-slate-400">
            <Clock className="w-4 h-4 text-brand-cyan" />
            <span>New total: </span>
            <span className="text-white font-bold">{totalMinutes} mins</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-cyan hover:bg-sky-400 text-slate-950 flex items-center space-x-1.5 shadow-glow-cyan transition duration-200"
            >
              <Check className="w-4 h-4" />
              <span>Apply Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
