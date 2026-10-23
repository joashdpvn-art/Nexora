"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Check, SkipForward, ArrowLeft } from "lucide-react";
import { Plan } from "@/types";
import { NexoraCore } from "./NexoraCore";

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
  const currentTask =
    plan.tasks.find((t) => t.id === activeTaskId) ||
    plan.tasks.find((t) => !completedTaskIds.includes(t.id)) ||
    plan.tasks[0];

  const totalTaskSeconds = (currentTask?.duration || 25) * 60;
  const initialElapsed = elapsedSecondsByTask[currentTask?.id || ""] || 0;

  const [elapsedSeconds, setElapsedSeconds] = useState<number>(initialElapsed);
  const [isRunning, setIsRunning] = useState<boolean>(true);
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

    setIsTransitioningComplete(true);
    setIsRunning(false);

    setTimeout(() => {
      onCompleteTask(currentTask.id);
    }, 900);
  };

  const handleSkip = () => {
    if (currentTask) {
      onSkipTask(currentTask.id);
    }
  };

  const currentIndex = plan.tasks.findIndex((t) => t.id === currentTask?.id);

  return (
    <div className="min-h-[85vh] w-full max-w-3xl mx-auto flex flex-col justify-between py-8 px-4 animate-in fade-in duration-500">
      {/* Top Escape Link */}
      <div className="flex items-center justify-between">
        <button
          onClick={onExitFocus}
          className="flex items-center space-x-1.5 text-xs font-mono text-slate-500 hover:text-slate-200 transition tracking-wider uppercase"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>NEXORA</span>
        </button>

        <span className="text-[10px] font-mono tracking-widest text-brand-cyan uppercase">
          AI FOCUS ENVIRONMENT
        </span>
      </div>

      {/* Main Focal Chamber */}
      <div className="flex-1 flex flex-col items-center justify-center text-center my-6">
        {/* Living Ambient Core */}
        <div className="mb-6 opacity-80">
          <NexoraCore state={isRunning ? "focus" : "idle"} size="sm" />
        </div>

        {/* Objective Counter */}
        <div className="font-mono text-xs tracking-[0.25em] text-slate-500 uppercase mb-3">
          OBJECTIVE {String(currentIndex + 1).padStart(2, "0")} / {String(plan.tasks.length).padStart(2, "0")}
        </div>

        {/* Objective Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight uppercase font-mono mb-2">
          {currentTask?.title}
        </h1>

        {/* Subtitle / Topic */}
        {currentTask?.subtitle && (
          <p className="text-sm sm:text-base text-slate-400 font-light max-w-md mb-8">
            {currentTask.subtitle}
          </p>
        )}

        {/* Huge Digital Countdown Timer */}
        <div className="my-4">
          {isTransitioningComplete ? (
            <div className="flex flex-col items-center py-6 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-400 flex items-center justify-center mb-2 shadow-telemetry-emerald">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <span className="font-mono text-sm font-bold tracking-widest text-emerald-400 uppercase">
                OBJECTIVE COMPLETE ✓
              </span>
            </div>
          ) : (
            <>
              <div className="font-mono text-7xl sm:text-8xl md:text-9xl font-black tracking-tighter text-white tabular-nums drop-shadow-[0_0_25px_rgba(56,189,248,0.2)]">
                {formatTime(remainingSeconds)}
              </div>
              <div className="font-mono text-xs tracking-[0.3em] uppercase text-brand-cyan mt-2">
                {isRunning ? "FOCUS" : "PAUSED"}
              </div>
            </>
          )}
        </div>

        {/* Primary Controls: PAUSE, COMPLETE, SKIP */}
        {!isTransitioningComplete && (
          <div className="flex items-center space-x-4 mt-8">
            <button
              type="button"
              onClick={handleToggleTimer}
              className="px-6 py-2.5 rounded-xl font-mono text-xs tracking-widest uppercase text-slate-300 hover:text-white border border-white/[0.08] hover:border-white/20 transition flex items-center space-x-2"
            >
              {isRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>PAUSE</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-slate-300" />
                  <span>RESUME</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleComplete}
              className="px-7 py-2.5 rounded-xl font-mono font-bold text-xs tracking-widest uppercase bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center space-x-2 shadow-telemetry-emerald transition"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>COMPLETE</span>
            </button>

            <button
              type="button"
              onClick={handleSkip}
              className="px-4 py-2.5 rounded-xl font-mono text-xs tracking-widest uppercase text-slate-500 hover:text-slate-300 transition"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Subtle Bottom Ambient Track */}
      <div className="text-center font-mono text-[11px] text-slate-600">
        NEXORA ACTIVE EXECUTION
      </div>
    </div>
  );
}
