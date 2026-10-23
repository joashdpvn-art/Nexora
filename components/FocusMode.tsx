"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  Check,
  SkipForward,
  ArrowLeft,
  Clock,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  CheckCircle2,
} from "lucide-react";
import { Plan, Task } from "@/types";

interface FocusModeProps {
  plan: Plan;
  activeTaskId: string;
  completedTaskIds: string[];
  elapsedSecondsByTask: Record<string, number>;
  onCompleteTask: (taskId: string) => void;
  onSkipTask: (taskId: string) => void;
  onExitFocus: () => void;
  onUpdateElapsedSeconds: (taskId: string, seconds: number) => void;
}

export function FocusMode({
  plan,
  activeTaskId,
  completedTaskIds,
  elapsedSecondsByTask,
  onCompleteTask,
  onSkipTask,
  onExitFocus,
  onUpdateElapsedSeconds,
}: FocusModeProps) {
  // Current active objective
  const currentTask =
    plan.tasks.find((t) => t.id === activeTaskId) ||
    plan.tasks.find((t) => !completedTaskIds.includes(t.id)) ||
    plan.tasks[0];

  const totalTaskSeconds = (currentTask?.duration || 25) * 60;
  const initialElapsed = elapsedSecondsByTask[currentTask?.id || ""] || 0;

  const [elapsedSeconds, setElapsedSeconds] = useState<number>(initialElapsed);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [checkedSubtasks, setCheckedSubtasks] = useState<Record<string, boolean>>({});
  const [isTransitioningComplete, setIsTransitioningComplete] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync elapsed state when active task changes
  useEffect(() => {
    if (currentTask) {
      setElapsedSeconds(elapsedSecondsByTask[currentTask.id] || 0);
      setIsRunning(true);
      setIsTransitioningComplete(false);
    }
  }, [currentTask?.id]);

  // Run the countdown timer tick
  useEffect(() => {
    if (isRunning && !isTransitioningComplete) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = prev + 1;
          if (currentTask) {
            onUpdateElapsedSeconds(currentTask.id, next);
          }
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isTransitioningComplete, currentTask?.id]);

  const remainingSeconds = Math.max(0, totalTaskSeconds - elapsedSeconds);
  const progressPercent = Math.min(100, Math.round((elapsedSeconds / totalTaskSeconds) * 100));

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleToggleTimer = () => {
    setIsRunning((prev) => !prev);
  };

  const handleComplete = () => {
    if (!currentTask || isTransitioningComplete) return;

    // Premium visual completion transition (TASK COMPLETE ✓) without childish confetti
    setIsTransitioningComplete(true);
    setIsRunning(false);

    setTimeout(() => {
      onCompleteTask(currentTask.id);
    }, 1100);
  };

  const handleSkip = () => {
    if (currentTask) {
      onSkipTask(currentTask.id);
    }
  };

  const toggleSubtask = (stIdx: number) => {
    const key = `${currentTask?.id}-${stIdx}`;
    setCheckedSubtasks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Find next objective in queue
  const currentIndex = plan.tasks.findIndex((t) => t.id === currentTask?.id);
  const nextTask = plan.tasks.find(
    (t, idx) => idx > currentIndex && !completedTaskIds.includes(t.id) && t.id !== currentTask?.id
  );

  const completedCount = completedTaskIds.length;
  const overallProgressPercent = Math.round((completedCount / plan.tasks.length) * 100);

  // Circular progress calculations for SVG ring
  const circleRadius = 140;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference - (progressPercent / 100) * circleCircumference;

  return (
    <div
      className={`min-h-[85vh] w-full flex flex-col justify-between py-6 px-4 transition-all duration-500 ${
        isFullscreen ? "fixed inset-0 z-50 bg-[#050608] p-8 overflow-y-auto" : "max-w-4xl mx-auto"
      }`}
    >
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onExitFocus}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-lg surface-obsidian text-slate-400 hover:text-white transition text-xs font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>RETURN TO COMMAND CENTER</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            className="p-2 rounded-lg surface-obsidian text-slate-400 hover:text-white transition"
            title={soundEnabled ? "Mute audio cues" : "Unmute audio cues"}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setIsFullscreen((prev) => !prev)}
            className="p-2 rounded-lg surface-obsidian text-slate-400 hover:text-white transition hidden sm:flex"
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen focus"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Focus Centerpiece */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full text-center py-4">
        {/* Status Indicator */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-xs font-mono mb-4">
          <span className="relative flex h-2 w-2">
            <span
              className={`absolute inline-flex h-full w-full rounded-full bg-brand-cyan opacity-75 ${
                isRunning ? "animate-ping" : ""
              }`}
            ></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-cyan"></span>
          </span>
          <span className="tracking-widest uppercase">
            {isTransitioningComplete
              ? "OBJECTIVE SECURED"
              : isRunning
              ? "FOCUS ACTIVE"
              : "SESSION PAUSED"}
          </span>
        </div>

        {/* Current Objective Heading */}
        <div className="space-y-1 mb-6">
          <span className="text-[11px] font-mono tracking-widest uppercase text-slate-500">
            OBJECTIVE {currentIndex + 1} OF {plan.tasks.length}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase font-mono">
            {currentTask?.title}
          </h1>
          {currentTask?.subtitle && (
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto font-light mt-1">
              {currentTask.subtitle}
            </p>
          )}
        </div>

        {/* Premium Circular Timer System */}
        <div className="relative my-4 flex items-center justify-center">
          {/* Subtle Ambient Radial Light */}
          <div className="absolute w-80 h-80 rounded-full bg-brand-cyan/5 blur-3xl -z-10 pointer-events-none" />

          {/* SVG Circular Progress Ring */}
          <svg className="w-72 h-72 sm:w-80 sm:h-80 -rotate-90 transform" viewBox="0 0 320 320">
            {/* Background Track */}
            <circle
              cx="160"
              cy="160"
              r={circleRadius}
              className="stroke-white/[0.04]"
              strokeWidth="6"
              fill="transparent"
            />
            {/* Active Telemetry Ring */}
            <circle
              cx="160"
              cy="160"
              r={circleRadius}
              className="stroke-brand-cyan transition-all duration-700 ease-linear"
              strokeWidth="6"
              strokeDasharray={circleCircumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{
                filter: "drop-shadow(0 0 8px rgba(56, 189, 248, 0.4))",
              }}
            />
          </svg>

          {/* Center Digital Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isTransitioningComplete ? (
              <div className="flex flex-col items-center animate-in zoom-in duration-300">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-400 flex items-center justify-center mb-2 shadow-telemetry-emerald">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <span className="font-mono text-xs font-bold tracking-widest text-emerald-400 uppercase">
                  TASK COMPLETE ✓
                </span>
                <span className="text-[10px] font-mono text-slate-400 mt-1">
                  Advancing to next milestone...
                </span>
              </div>
            ) : (
              <>
                <div className="font-mono text-5xl sm:text-6xl font-black tracking-tighter text-white tabular-nums drop-shadow-md">
                  {formatTime(remainingSeconds)}
                </div>
                <span className="text-[10px] font-mono text-slate-500 mt-1 uppercase tracking-wider">
                  {currentTask?.duration} MIN TARGET &bull; {progressPercent}% ELAPSED
                </span>
              </>
            )}
          </div>
        </div>

        {/* Subtask Checkpoints */}
        {currentTask?.subtasks && currentTask.subtasks.length > 0 && !isTransitioningComplete && (
          <div className="w-full max-w-md bg-obsidian-900 border border-white/[0.06] rounded-xl p-4 my-3 text-left">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-2">
              TARGET CHECKPOINTS
            </span>
            <div className="space-y-2">
              {currentTask.subtasks.map((st, i) => {
                const isChecked = Boolean(checkedSubtasks[`${currentTask.id}-${i}`]);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleSubtask(i)}
                    className="flex items-start space-x-2.5 w-full text-left text-xs group transition"
                  >
                    <div
                      className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center transition shrink-0 ${
                        isChecked
                          ? "bg-brand-cyan border-brand-cyan text-slate-950"
                          : "border-white/20 group-hover:border-white/50"
                      }`}
                    >
                      {isChecked && <CheckCircle2 className="w-3 h-3" />}
                    </div>
                    <span
                      className={`leading-relaxed transition font-light ${
                        isChecked ? "line-through text-slate-500" : "text-slate-300"
                      }`}
                    >
                      {st}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Controls: PAUSE / COMPLETE / SKIP */}
        <div className="flex flex-wrap items-center justify-center gap-3 my-4">
          <button
            type="button"
            onClick={handleToggleTimer}
            disabled={isTransitioningComplete}
            className="px-5 py-2.5 rounded-xl font-mono text-xs tracking-wider surface-interactive text-slate-200 flex items-center space-x-2"
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-slate-200" />
                <span>RESUME</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleComplete}
            disabled={isTransitioningComplete}
            className="px-6 py-2.5 rounded-xl font-mono font-bold text-xs tracking-wider bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center space-x-2 shadow-telemetry-emerald transition duration-200"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>COMPLETE TASK</span>
          </button>

          <button
            type="button"
            onClick={handleSkip}
            disabled={isTransitioningComplete}
            className="px-4 py-2.5 rounded-xl font-mono text-xs tracking-wider surface-obsidian text-slate-400 hover:text-white flex items-center space-x-1.5 transition"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>SKIP</span>
          </button>
        </div>
      </div>

      {/* Footer Preview for Next Objective & Telemetry */}
      <div className="max-w-2xl mx-auto w-full pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
        {nextTask ? (
          <div className="flex items-center space-x-3 text-left">
            <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-slate-400">
              <Clock className="w-3.5 h-3.5 text-brand-cyan" />
            </div>
            <div>
              <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 block">
                NEXT IN SEQUENCE
              </span>
              <p className="text-xs font-semibold text-white font-mono uppercase">
                {nextTask.title} &bull; {nextTask.duration} MIN
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400">
            <span>FINAL OBJECTIVE IN SEQUENCE</span>
          </div>
        )}

        <div className="text-xs font-mono text-slate-400">
          PLAN PROGRESS: <span className="text-brand-cyan font-bold">{overallProgressPercent}%</span>
        </div>
      </div>
    </div>
  );
}
