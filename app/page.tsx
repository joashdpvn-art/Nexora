"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { CommandInput, DEMO_PROMPT } from "@/components/CommandInput";
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
import { ArrowLeft, CheckCircle2, Info, Sparkles } from "lucide-react";

export default function NexoraApp() {
  const [session, setSession] = useState<SessionState>(initialSessionState);
  const [isMounted, setIsMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ text: string; type?: "info" | "success" } | null>(null);

  // Show auto-dismissing toast notifications
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

  // Command submission handler
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
      const { action } = await processCommand(command, session);

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
        showNotification("Intelligent execution plan constructed.", "success");
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
      showNotification("Could not process request. Please try again.", "info");
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
        // All tasks finished -> Transition to session summary!
        return {
          ...prev,
          completedTaskIds: completedList,
          currentView: "summary",
          history: [
            {
              id: `msg-${Date.now()}-nexora`,
              role: "nexora" as const,
              text: "All tasks completed! Session goals met with distinction.",
              timestamp: new Date().toISOString(),
              type: "status_update" as const,
            },
            ...prev.history,
          ],
        };
      }

      // Next task in queue
      const nextTask = remaining[0];
      return {
        ...prev,
        completedTaskIds: completedList,
        activeTaskId: nextTask.id,
        history: [
          {
            id: `msg-${Date.now()}-nexora`,
            role: "nexora" as const,
            text: `Completed task. Advanced to next objective: ${nextTask.title}.`,
            timestamp: new Date().toISOString(),
            type: "status_update" as const,
          },
          ...prev.history,
        ],
      };
    });

    showNotification("Task completed! Momentum unlocked.", "success");
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
    showNotification("Plan updated successfully.", "success");
  };

  const handleResetSession = () => {
    const fresh = clearSessionStorage();
    setSession(fresh);
    showNotification("Session context reset.", "info");
  };

  const switchView = (view: ViewState) => {
    setSession((prev) => ({ ...prev, currentView: view }));
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2 text-brand-cyan text-sm font-mono">
          <Sparkles className="w-4 h-4 animate-spin" />
          <span>Booting NEXORA...</span>
        </div>
      </div>
    );
  }

  const hasActiveContext = Boolean(session.plan || session.completedTaskIds.length > 0);

  return (
    <div className="min-h-screen flex flex-col bg-background text-slate-100 radial-mesh antialiased">
      {/* Global Header */}
      <Header
        onReset={handleResetSession}
        hasActiveContext={hasActiveContext}
        completedCount={session.completedTaskIds.length}
      />

      {/* Floating Notification Toast */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 max-w-sm animate-in slide-in-from-top-3 fade-in duration-200">
          <div
            className={`flex items-start space-x-2.5 p-3 rounded-xl backdrop-blur-xl border shadow-2xl text-xs ${
              notification.type === "success"
                ? "bg-emerald-950/80 border-emerald-500/30 text-emerald-200"
                : "bg-surface-200/90 border-brand-cyan/30 text-slate-200"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-4 h-4 text-brand-cyan shrink-0 mt-0.5" />
            )}
            <span className="leading-relaxed">{notification.text}</span>
          </div>
        </div>
      )}

      {/* Persistent View Nav Bar if a Plan exists */}
      {session.plan && session.currentView !== "focus" && (
        <div className="max-w-4xl mx-auto w-full px-4 pt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => switchView("command")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                session.currentView === "command"
                  ? "bg-white/[0.1] text-white font-semibold border border-white/[0.12]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Command Center
            </button>
            <button
              onClick={() => switchView("plan")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                session.currentView === "plan"
                  ? "bg-white/[0.1] text-white font-semibold border border-white/[0.12]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Plan Breakdown
            </button>
            {session.completedTaskIds.length > 0 && (
              <button
                onClick={() => switchView("summary")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                  session.currentView === "summary"
                    ? "bg-white/[0.1] text-white font-semibold border border-white/[0.12]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Session Summary
              </button>
            )}
          </div>

          <button
            onClick={() => handleStartPlan()}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-brand-cyan/15 hover:bg-brand-cyan text-brand-cyan hover:text-slate-950 border border-brand-cyan/30 transition flex items-center space-x-1.5"
          >
            <span>Resume Focus</span>
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

            {/* Quick Link to Current Plan if One Exists */}
            {session.plan && (
              <div className="max-w-3xl mx-auto px-4 mt-6">
                <div className="glass-panel p-4 rounded-xl border-white/[0.08] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-brand-cyan">
                      Active Plan In Memory
                    </span>
                    <p className="text-sm font-semibold text-white">
                      {session.plan.tasks.length} tasks &bull; {session.plan.totalMinutes} mins total &bull;{" "}
                      {session.completedTaskIds.length} completed
                    </p>
                  </div>
                  <button
                    onClick={() => switchView("plan")}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-xs font-medium text-white transition"
                  >
                    View Plan &rarr;
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

      {/* Footer */}
      <footer className="w-full border-t border-white/[0.04] py-6 px-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="text-slate-400 font-semibold">NEXORA</span> &mdash; Think less. Do more.
          </div>
          <div className="flex items-center space-x-3 text-[11px] text-slate-600">
            <span>Built for Build, Ship, Shape: Amazon Developer Hackathon</span>
            <span>&bull;</span>
            <span>Local Reasoning Engine Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
