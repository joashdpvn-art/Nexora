import { Plan, SessionState } from "@/types";

const STORAGE_KEY = "nexora_session_v1";

export const initialSessionState: SessionState = {
  currentView: "command",
  plan: null,
  activeTaskId: null,
  completedTaskIds: [],
  elapsedSecondsByTask: {},
  totalSecondsSpent: 0,
  history: [
    {
      id: "msg-welcome",
      role: "nexora",
      text: "NEXORA is online and ready. What situation or goals are you navigating?",
      timestamp: new Date().toISOString(),
      type: "status_update",
    },
  ],
  lastQuery: "",
  updatedAt: new Date().toISOString(),
};

export function loadSessionFromStorage(): SessionState {
  if (typeof window === "undefined") {
    return initialSessionState;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialSessionState;
    const parsed = JSON.parse(raw) as SessionState;
    return parsed;
  } catch (error) {
    console.warn("NEXORA: Failed to load session from localStorage, resetting to defaults", error);
    return initialSessionState;
  }
}

export function saveSessionToStorage(state: SessionState): void {
  if (typeof window === "undefined") return;

  try {
    const payload = {
      ...state,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn("NEXORA: Failed to persist session to localStorage", error);
  }
}

export function clearSessionStorage(): SessionState {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn("NEXORA: Failed to clear session storage", e);
    }
  }
  return {
    ...initialSessionState,
    history: [
      {
        id: `msg-${Date.now()}`,
        role: "nexora",
        text: "Session reset. Ready for your next objective.",
        timestamp: new Date().toISOString(),
        type: "status_update",
      },
    ],
  };
}
