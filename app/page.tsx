"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header, SystemStatusState } from "@/components/Header";
import { CommandInput } from "@/components/CommandInput";
import { PlanView } from "@/components/PlanView";
import { FocusMode } from "@/components/FocusMode";
import { SessionSummary } from "@/components/SessionSummary";
import { EditPlanModal } from "@/components/EditPlanModal";
import { ConversationHistory } from "@/components/ConversationHistory";
import {
  clearSessionStorage,
  loadSessionFromStorage,
  saveSessionToStorage,
  initialSessionState,
} from "@/lib/storage";
import { processCommand } from "@/lib/aiProvider";
import { Plan, SessionState, Task, ViewState } from "@/types";
import { CheckCircle2, Info, Sparkles } from "lucide-react";

export default function NexoraApp() {
  const [session, setSession] = useState<SessionState>(initialSessionState);
  const [isMounted, setIsMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ text: string; type?: "info" | "success" } | null>(null);

  // Auto-dismissing toast notifications
  const showNotification = useCallback((text: string, type: "info" | "success" = "info") => {
    setNotification({ text, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.text === text ? null : curr));
    }, 4500);
  }, []);

  // Hydrate from localStorage on client mount
  useEffect(() => {
    const loaded = loadSessionFromStorage();
    setSession(loaded);
    setIsMounted(true);
  }, []);

  // Save to localStorage whenever session updates (after initial mount)
  useEffect(() => {
    if (isMounted) {
      saveSessionToStorage(session);
    }
  }, [session, isMounted]);

  // Command submission handler with cinematic reasoning cadence
  const handleExecuteCommand = async (command: string) => {
    if (!command.trim() || isProcessing) return;

    setIsProcessing(true);

    const userMessage = {
      id: `msg-${Date.now()}-user`,
      role: "user" as const,
      text: command,
      timestamp: new Date().toISOString(),
      type: "query" as const,
    };

    // Optimistically log user input
    setSession((prev) => ({
      ...prev,
      lastQuery: command,
      history: [userMessage, ...prev.history],
    }));

    try {
      // Allow the 5-stage reasoning sequence to play smoothly
      const [res] = await Promise.all([
        processCommand(command, session),
        new Promise((resolve) => setTimeout(resolve, 1350)),
      ]);

      const { action } = res;

      if (action.type === "NEW_PLAN") {
        setSession((prev) => ({
          ...prev,
          plan: action.plan,
          activeTaskId: action.plan.tasks[0]?.id || null,
          currentView: "plan",
          history: [
            {
              id: `msg-${Date.now()}-nexora`,
              role: "nexora" as const,
              text: action.message,
              timestamp: new Date().toISOString(),
              type: "plan_generated" as const,
            },
            ...prev.history,
          ],
        }));
        showNotification("Optimal execution sequence constructed.", "success");
      } else if (action.type === "START_TASK") {
        setSession((prev) => ({
          ...prev,
          activeTaskId: action.taskId,
          currentView: "focus",
          history: [
            {
              id: `msg-${Date.now()}-nexora`,
              role: "nexora" as const,
              text: action.message,
              timestamp: new Date().toISOString(),
              type: "status_update" as const,
            },
            ...prev.history,
          ],
        }));
        showNotification(action.message, "success");
      } else if (action.type === "MARK_COMPLETED") {
        setSession((prev) => {
          const completedSet = new Set(prev.completedTaskIds);
          completedSet.add(action.taskId);
          const completedList = Array.from(completedSet);

          const allDone = prev.plan?.tasks.every((t) => completedList.includes(t.id));

          return {
            ...prev,
            completedTaskIds: completedList,
            activeTaskId: action.nextTaskId || prev.activeTaskId,
            currentView: allDone ? "summary" : prev.currentView,
            history: [
              {
                id: `msg-${Date.now()}-nexora`,
                role: "nexora" as const,
                text: action.message,
                timestamp: new Date().toISOString(),
                type: "status_update" as const,
              },
              ...prev.history,
            ],
          };
        });
        showNotification(action.message, "success");
      } else if (action.type === "RESCHEDULE_TIME") {
        setSession((prev) => ({
          ...prev,
          plan: prev.plan
            ? {
                ...prev.plan,
                tasks: action.updatedTasks,
                totalMinutes: action.newTotalMinutes,
              }
            : null,
          currentView: "plan",
          history: [
            {
              id: `msg-${Date.now()}-nexora`,
              role: "nexora" as const,
              text: action.message,
              timestamp: new Date().toISOString(),
              type: "plan_generated" as const,
            },
            ...prev.history,
          ],
        }));
        showNotification(action.message, "info");
      } else if (action.type === "REMOVE_TASK") {
        setSession((prev) => ({
          ...prev,
          plan: prev.plan
            ? {
                ...prev.plan,
                tasks: action.updatedTasks,
                totalMinutes: action.updatedTasks.reduce((s, t) => s + t.duration, 0),
              }
            : null,
          currentView: "plan",
          history: [
            {
              id: `msg-${Date.now()}-nexora`,
              role: "nexora" as const,
              text: action.message,
              timestamp: new Date().toISOString(),
              type: "status_update" as const,
            },
            ...prev.history,
          ],
        }));
        showNotification(action.message, "info");
      } else if (action.type === "MESSAGE_ONLY") {
        setSession((prev) => ({
          ...prev,
          history: [
            {
              id: `msg-${Date.now()}-nexora`,
              role: "nexora" as const,
              text: action.message,
              timestamp: new Date().toISOString(),
              type: "recommendation" as const,
            },
            ...prev.history,
          ],
        }));
        showNotification(action.message, "info");
      }
    } catch (err) {
      console.error("Execution failed:", err);
      showNotification("Could not process command. Please retry.", "info");
    } finally {
      setIsProcessing(false);
    }
  };

  // Focus mode actions
  const handleStartPlan = (taskId?: string) => {
    if (!session.plan) return;
    const targetId =
      taskId ||
      session.plan.tasks.find((t) => !session.completedTaskIds.includes(t.id))?.id ||
      session.plan.tasks[0]?.id;

    setSession((prev) => ({
      ...prev,
      activeTaskId: targetId,
      currentView: "focus",
    }));
  };

  const handleCompleteTask = (taskId: string) => {
    setSession((prev) => {
      const completedSet = new Set(prev.completedTaskIds);
      completedSet.add(taskId);
      const completedList = Array.from(completedSet);

      const remaining = prev.plan?.tasks.filter((t) => !completedList.includes(t.id)) || [];

      if (remaining.length === 0) {
        return {
          ...prev,
          completedTaskIds: completedList,
          currentView: "summary",
          history: [
            {
              id: `msg-${Date.now()}-nexora`,
              role: "nexora" as const,
              text: "All objectives executed! Momentum unlocked.",
              timestamp: new Date().toISOString(),
              type: "status_update" as const,
            },
            ...prev.history,
          ],
        };
      }

      const nextTask = remaining[0];
      return {
        ...prev,
        completedTaskIds: completedList,
        activeTaskId: nextTask.id,
        history: [
          {
            id: `msg-${Date.now()}-nexora`,
            role: "nexora" as const,
            text: `Objective complete. Next best action: ${nextTask.title} (${nextTask.duration} mins).`,
            timestamp: new Date().toISOString(),
            type: "status_update" as const,
          },
          ...prev.history,
        ],
      };
    });

    showNotification("Objective complete. Next action queued.", "success");
  };

  const handleSkipTask = (taskId: string) => {
    if (!session.plan) return;
    const uncompleted = session.plan.tasks.filter(
      (t) => !session.completedTaskIds.includes(t.id) && t.id !== taskId
    );

    if (uncompleted.length > 0) {
      setSession((prev) => ({
        ...prev,
        activeTaskId: uncompleted[0].id,
      }));
      showNotification(`Skipped to ${uncompleted[0].title}`, "info");
    } else {
      setSession((prev) => ({
        ...prev,
        currentView: "summary",
      }));
    }
  };

  const handleUpdateElapsedSeconds = (taskId: string, seconds: number) => {
    setSession((prev) => ({
      ...prev,
      elapsedSecondsByTask: {
        ...prev.elapsedSecondsByTask,
        [taskId]: seconds,
      },
      totalSecondsSpent: prev.totalSecondsSpent + 1,
    }));
  };

  const handleToggleCompleteFromPlan = (taskId: string) => {
    setSession((prev) => {
      const exists = prev.completedTaskIds.includes(taskId);
      const nextList = exists
        ? prev.completedTaskIds.filter((id) => id !== taskId)
        : [...prev.completedTaskIds, taskId];

      return {
        ...prev,
        completedTaskIds: nextList,
      };
    });
  };

  const handleSaveEditedPlan = (updatedTasks: Task[]) => {
    setSession((prev) => {
      if (!prev.plan) return prev;
      const totalMinutes = updatedTasks.reduce((s, t) => s + t.duration, 0);
      return {
        ...prev,
        plan: {
          ...prev.plan,
          tasks: updatedTasks,
          totalMinutes,
        },
      };
    });
    showNotification("Execution plan updated.", "success");
  };

  const handleResetSession = () => {
    const fresh = clearSessionStorage();
    setSession(fresh);
    showNotification("Session memory reset to baseline.", "info");
  };

  const switchView = (view: ViewState) => {
    setSession((prev) => ({ ...prev, currentView: view }));
  };

  // Derive system telemetry state for Header
  const getHeaderSystemStatus = (): SystemStatusState => {
    if (isProcessing) return "thinking";
    if (session.currentView === "focus") return "focus";
    if (session.plan) return "ready";
    return "online";
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2.5 text-brand-cyan text-xs font-mono">
          <Sparkles className="w-4 h-4 animate-spin" />
          <span className="tracking-widest uppercase">INITIALIZING NEXORA...</span>
        </div>
      </div>
    );
  }

  const hasActiveContext = Boolean(session.plan || session.completedTaskIds.length > 0);

  return (
    <div className="min-h-screen flex flex-col cinematic-environment text-slate-100 antialiased">
      {/* Global Header — Futuristic System Console */}
      <Header
        systemStatus={getHeaderSystemStatus()}
        hasActiveContext={hasActiveContext}
        completedCount={session.completedTaskIds.length}
        onReset={handleResetSession}
      />

      {/* Floating System Notification Toast */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 max-w-sm animate-in slide-in-from-top-3 fade-in duration-200">
          <div
            className={`flex items-start space-x-2.5 p-3 rounded-xl backdrop-blur-xl border shadow-2xl text-xs ${
              notification.type === "success"
                ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-200"
                : "bg-obsidian-900/90 border-brand-cyan/30 text-slate-200"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-4 h-4 text-brand-cyan shrink-0 mt-0.5" />
            )}
            <span className="leading-relaxed font-light">{notification.text}</span>
          </div>
        </div>
      )}

      {/* System Navigation Ribbon (when a plan exists and not in focus mode) */}
      {session.plan && session.currentView !== "focus" && (
        <div className="max-w-4xl mx-auto w-full px-4 pt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => switchView("command")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider transition ${
                session.currentView === "command"
                  ? "bg-white/[0.08] text-white font-semibold border border-white/[0.12]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              COMMAND CENTER
            </button>
            <button
              onClick={() => switchView("plan")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider transition ${
                session.currentView === "plan"
                  ? "bg-white/[0.08] text-white font-semibold border border-white/[0.12]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              PLAN BREAKDOWN
            </button>
            {session.completedTaskIds.length > 0 && (
              <button
                onClick={() => switchView("summary")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider transition ${
                  session.currentView === "summary"
                    ? "bg-white/[0.08] text-white font-semibold border border-white/[0.12]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                SESSION SUMMARY
              </button>
            )}
          </div>

          <button
            onClick={() => handleStartPlan()}
            className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold bg-brand-cyan/15 hover:bg-brand-cyan text-brand-cyan hover:text-slate-950 border border-brand-cyan/30 transition flex items-center space-x-1.5"
          >
            <span>RESUME FOCUS</span>
          </button>
        </div>
      )}

      {/* Main Content Workspace by State */}
      <main className="flex-1 flex flex-col justify-center py-6 sm:py-10">
        {/* STATE 1: COMMAND CENTER */}
        {session.currentView === "command" && (
          <div className="w-full">
            <CommandInput
              onSubmit={handleExecuteCommand}
              isProcessing={isProcessing}
              hasExistingPlan={Boolean(session.plan)}
              lastQuery={session.lastQuery}
              completedCount={session.completedTaskIds.length}
            />

            {/* Quick Status Pill for Active Plan in Memory */}
            {session.plan && (
              <div className="max-w-3xl mx-auto px-4 mt-6">
                <div className="surface-obsidian p-4 rounded-xl border-white/[0.06] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-brand-cyan block">
                      ACTIVE PLAN IN MEMORY
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-white font-mono uppercase mt-0.5">
                      {session.plan.tasks.length} OBJECTIVES &bull; {session.plan.totalMinutes} MIN &bull;{" "}
                      {session.completedTaskIds.length} EXECUTED
                    </p>
                  </div>
                  <button
                    onClick={() => switchView("plan")}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-xs font-mono tracking-wider text-white transition"
                  >
                    VIEW PLAN &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* Conversational Dialogue Log */}
            <ConversationHistory history={session.history} />
          </div>
        )}

        {/* STATE 2: PLAN / INSIGHT VIEW */}
        {session.currentView === "plan" && session.plan && (
          <div>
            <PlanView
              plan={session.plan}
              completedTaskIds={session.completedTaskIds}
              onStartPlan={handleStartPlan}
              onEditPlan={() => setIsEditModalOpen(true)}
              onToggleCompleteTask={handleToggleCompleteFromPlan}
            />
            <ConversationHistory history={session.history} />
          </div>
        )}

        {/* STATE 3: FOCUS MODE */}
        {session.currentView === "focus" && session.plan && (
          <FocusMode
            plan={session.plan}
            activeTaskId={session.activeTaskId || session.plan.tasks[0]?.id}
            completedTaskIds={session.completedTaskIds}
            elapsedSecondsByTask={session.elapsedSecondsByTask}
            onCompleteTask={handleCompleteTask}
            onSkipTask={handleSkipTask}
            onExitFocus={() => switchView("command")}
            onUpdateElapsedSeconds={handleUpdateElapsedSeconds}
          />
        )}

        {/* STATE 4: SESSION SUMMARY */}
        {session.currentView === "summary" && session.plan && (
          <SessionSummary
            plan={session.plan}
            completedTaskIds={session.completedTaskIds}
            totalSecondsSpent={session.totalSecondsSpent}
            onReturnToCommand={() => switchView("command")}
            onResetSession={handleResetSession}
            onContinuePlan={handleStartPlan}
          />
        )}
      </main>

      {/* Edit Plan Modal */}
      {session.plan && (
        <EditPlanModal
          isOpen={isEditModalOpen}
          tasks={session.plan.tasks}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveEditedPlan}
        />
      )}

      {/* Footer — Minimalist System Signature */}
      <footer className="w-full border-t border-white/[0.06] py-8 px-4 mt-12 bg-obsidian-950/60 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-slate-500">
          <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-3">
            <span className="font-bold text-slate-300 tracking-widest uppercase">NEXORA</span>
            <span className="hidden sm:inline text-slate-600">&bull;</span>
            <span className="tracking-wider uppercase text-slate-400">Think less. Do more.</span>
          </div>

          <div className="flex items-center space-x-3 text-slate-500 tracking-widest uppercase">
            <span>SYSTEM v1.0</span>
            <span className="text-slate-700">&bull;</span>
            <span className="text-brand-cyan">LOCAL-FIRST</span>
            <span className="text-slate-700">&bull;</span>
            <span>PRIVATE BY DESIGN</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
