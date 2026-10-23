"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  CheckCircle2,
  SkipForward,
  ArrowLeft,
  Clock,
  Sparkles,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2
} from "lucide-react";
import confetti from "canvas-confetti";
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
  // Current active task
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

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync elapsed state when active task changes
  useEffect(() => {
    if (currentTask) {
      setElapsedSeconds(elapsedSecondsByTask[currentTask.id] || 0);
      setIsRunning(true);
    }
  }, [currentTask?.id]);

  // Run the countdown timer tick
  useEffect(() => {
    if (isRunning) {
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
  }, [isRunning, currentTask?.id]);

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

  const fireConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#38bdf8", "#6366f1", "#10b981", "#f59e0b"],
      });
    } catch (e) {
      console.log("Confetti fallback:", e);
    }
  };

  const handleComplete = () => {
    fireConfetti();
    if (currentTask) {
      onCompleteTask(currentTask.id);
    }
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

  // Find next task in queue
  const currentIndex = plan.tasks.findIndex((t) => t.id === currentTask?.id);
  const nextTask = plan.tasks.find(
    (t, idx) => idx > currentIndex && !completedTaskIds.includes(t.id) && t.id !== currentTask?.id
  );

  const completedCount = completedTaskIds.length + (completedTaskIds.includes(currentTask?.id || "") ? 0 : 0);
  const overallProgressPercent = Math.round((completedCount / plan.tasks.length) * 100);

  return (
    <div
      className={`min-h-[85vh] w-full flex flex-col justify-between py-6 px-4 transition-all duration-500 ${
        isFullscreen ? "fixed inset-0 z-50 bg-[#07080B] p-8 overflow-y-auto" : "max-w-4xl mx-auto"
      }`}
    >
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onExitFocus}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-xl glass-panel text-slate-400 hover:text-white transition text-xs font-mono"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Command Center</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            className="p-2 rounded-xl glass-panel text-slate-400 hover:text-white transition"
            title={soundEnabled ? "Mute audio cues" : "Unmute audio cues"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsFullscreen((prev) => !prev)}
            className="p-2 rounded-xl glass-panel text-slate-400 hover:text-white transition hidden sm:flex"
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen focus"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Focus Card */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full text-center">
        {/* Status Pill */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/25 text-brand-cyan text-xs font-mono mb-6">
          <span className="relative flex h-2 w-2">
            <span
              className={`absolute inline-flex h-full w-full rounded-full bg-brand-cyan opacity-75 ${
                isRunning ? "animate-ping" : ""
              }`}
            ></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-cyan"></span>
          </span>
          <span>{isRunning ? "DEEP FOCUS ACTIVE" : "SESSION PAUSED"}</span>
        </div>

        {/* Current Task Subject Header */}
        <div className="space-y-1 mb-8">
          <p className="text-xs font-mono tracking-widest uppercase text-slate-400">
            Task {currentIndex + 1} of {plan.tasks.length}
          </p>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
            {currentTask?.title}
          </h1>
          {currentTask?.subtitle && (
            <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto font-normal">
              {currentTask.subtitle}
            </p>
          )}
        </div>

        {/* Large Digital Countdown Timer */}
        <div className="relative my-4 flex flex-col items-center justify-center">
          {/* Subtle Ambient Glow */}
          <div className="absolute w-72 h-72 rounded-full bg-brand-cyan/10 blur-3xl -z-10 pointer-events-none" />

          <div className="font-mono text-7xl sm:text-8xl md:text-9xl font-black tracking-tighter text-white tabular-nums drop-shadow-lg">
            {formatTime(remainingSeconds)}
          </div>

          <p className="text-xs font-mono text-slate-500 mt-2">
            Target duration: {currentTask?.duration} mins ({formatTime(elapsedSeconds)} elapsed)
          </p>
        </div>

        {/* Interactive Progress Bar */}
        <div className="w-full max-w-md my-6 space-y-2">
          <div className="w-full h-2.5 rounded-full bg-surface-100 border border-white/[0.08] overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-cyan to-brand-indigo transition-all duration-500 shadow-glow-cyan"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-slate-500">
            <span>{progressPercent}% completed</span>
            <span>{formatTime(remainingSeconds)} remaining</span>
          </div>
        </div>

        {/* Subtask Checkpoints */}
        {currentTask?.subtasks && currentTask.subtasks.length > 0 && (
          <div className="w-full max-w-md bg-surface-200/50 border border-white/[0.06] rounded-xl p-4 my-4 text-left">
            <p className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2.5">
              Target Checkpoints
            </p>
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
                      className={`leading-relaxed transition ${
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

        {/* Primary Focus Controls: PAUSE / COMPLETE / SKIP */}
        <div className="flex flex-wrap items-center justify-center gap-3 my-6">
          {/* Pause / Resume */}
          <button
            type="button"
            onClick={handleToggleTimer}
            className="px-5 py-3 rounded-xl font-medium text-xs sm:text-sm glass-panel-interactive text-slate-200 flex items-center space-x-2"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-slate-200" />
                <span>Resume</span>
              </>
            )}
          </button>

          {/* Complete */}
          <button
            type="button"
            onClick={handleComplete}
            className="px-7 py-3 rounded-xl font-bold text-xs sm:text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center space-x-2 shadow-glow-emerald transition duration-200"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Complete Task</span>
          </button>

          {/* Skip */}
          <button
            type="button"
            onClick={handleSkip}
            className="px-4 py-3 rounded-xl font-medium text-xs sm:text-sm glass-panel text-slate-400 hover:text-white flex items-center space-x-1.5 transition"
          >
            <SkipForward className="w-4 h-4" />
            <span>Skip</span>
          </button>
        </div>
      </div>

      {/* Bottom Footer: Next Task Preview & Overall Progress */}
      <div className="max-w-2xl mx-auto w-full pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
        {nextTask ? (
          <div className="flex items-center space-x-3 text-left">
            <div className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-400">
              <Clock className="w-4 h-4 text-brand-cyan" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                Next in Queue
              </span>
              <p className="text-xs sm:text-sm font-semibold text-white">
                {nextTask.title} ({nextTask.duration} mins)
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400">
            <Sparkles className="w-4 h-4" />
            <span>Final task of the planned session!</span>
          </div>
        )}

        <div className="text-xs font-mono text-slate-400">
          Overall plan completion:{" "}
          <span className="text-white font-bold">{overallProgressPercent}%</span>
        </div>
      </div>
    </div>
  );
}
