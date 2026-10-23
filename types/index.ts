export type Priority = "high" | "medium" | "low";

export interface Task {
  id: string;
  title: string;
  subtitle?: string;
  duration: number; // in minutes
  priority: Priority;
  deadline?: string;
  reason?: string;
  category?: "study" | "assignment" | "break" | "review" | "project" | "general";
  completed: boolean;
  subtasks?: string[];
}

export interface ExtractedContext {
  availableTimeMinutes: number;
  urgencyLevel: "critical" | "high" | "moderate" | "relaxed";
  identifiedSubjects: string[];
  deadlines: { item: string; date: string }[];
  constraints: string[];
}

export interface Plan {
  id: string;
  query: string;
  summary: string;
  tasks: Task[];
  totalMinutes: number;
  reasoning: string[];
  extractedContext: ExtractedContext;
  createdAt: string;
}

export type ViewState = "command" | "plan" | "focus" | "summary";

export interface MessageHistory {
  id: string;
  role: "user" | "nexora";
  text: string;
  timestamp: string;
  type?: "plan_generated" | "query" | "status_update" | "recommendation";
}

export interface SessionState {
  currentView: ViewState;
  plan: Plan | null;
  activeTaskId: string | null;
  completedTaskIds: string[];
  elapsedSecondsByTask: Record<string, number>;
  totalSecondsSpent: number;
  history: MessageHistory[];
  lastQuery: string;
  updatedAt: string;
}
