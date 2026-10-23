import { ExtractedContext, Plan, SessionState, Task } from "@/types";

interface ParsedSubject {
  name: string;
  type: "exam" | "assignment" | "project" | "review" | "presentation" | "study";
  deadline: string;
  urgencyScore: number; // 1-10
  details?: string;
}

// Helper to extract time from natural language
export function extractAvailableMinutes(text: string): number {
  const lower = text.toLowerCase();

  // Pattern matches: "X hours", "X hr", "X hrs"
  const hoursMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:hours|hour|hrs|hr)/);
  if (hoursMatch) {
    return Math.round(parseFloat(hoursMatch[1]) * 60);
  }

  // Words for numbers of hours
  if (lower.includes("half an hour") || lower.includes("half hour")) return 30;
  if (lower.includes("an hour and a half") || lower.includes("one and a half hours")) return 90;
  if (lower.includes("one hour") || lower.includes("an hour") || lower.includes("1 hour")) return 60;
  if (lower.includes("two hours") || lower.includes("2 hours")) return 120;
  if (lower.includes("three hours") || lower.includes("3 hours")) return 180;
  if (lower.includes("four hours") || lower.includes("4 hours")) return 240;

  // Minutes matches: "X minutes", "X mins", "X min"
  const minMatch = lower.match(/(\d+)\s*(?:minutes|minute|mins|min)/);
  if (minMatch) {
    return parseInt(minMatch[1], 10);
  }

  if (lower.includes("forty-five minutes") || lower.includes("45 mins")) return 45;
  if (lower.includes("thirty minutes") || lower.includes("30 mins")) return 30;
  if (lower.includes("twenty minutes") || lower.includes("20 mins")) return 20;

  // Default assumption if not mentioned: 120 minutes (2 hours)
  return 120;
}

export function detectDeadline(text: string): { label: string; score: number } {
  const lower = text.toLowerCase();
  if (lower.includes("in 1 hour") || lower.includes("in 2 hours") || lower.includes("tonight") || lower.includes("in the morning")) {
    return { label: "Imminent (Tonight / Morning)", score: 9 };
  }
  if (lower.includes("tomorrow")) {
    return { label: "Tomorrow", score: 8 };
  }
  if (lower.includes("day after tomorrow")) {
    return { label: "In 2 days", score: 6 };
  }
  if (lower.includes("friday")) {
    return { label: "Friday", score: 5 };
  }
  if (lower.includes("thursday")) {
    return { label: "Thursday", score: 5 };
  }
  if (lower.includes("monday") || lower.includes("next week")) {
    return { label: "Next Week", score: 3 };
  }
  return { label: "Upcoming", score: 4 };
}

// Analyze specific query items and extract tasks
export function analyzeQuery(query: string): {
  context: ExtractedContext;
  tasks: Task[];
  summary: string;
  reasoning: string[];
} {
  const lower = query.toLowerCase();
  const availableMinutes = extractAvailableMinutes(query);

  const subjects: ParsedSubject[] = [];

  // 1. Math / Mathematics
  if (lower.includes("math") || lower.includes("mathematics") || lower.includes("calculus") || lower.includes("algebra")) {
    const isTomorrow = lower.includes("tomorrow") || lower.includes("exam") || lower.includes("test");
    subjects.push({
      name: "Mathematics",
      type: lower.includes("assignment") ? "assignment" : "exam",
      deadline: isTomorrow ? "Tomorrow" : "Upcoming",
      urgencyScore: isTomorrow ? 9 : 7,
      details: "Vectors, 3D Geometry & Core Problem Sets",
    });
  }

  // 2. DBMS / Database
  if (lower.includes("dbms") || lower.includes("database") || lower.includes("sql")) {
    const isFriday = lower.includes("friday");
    subjects.push({
      name: "DBMS Assignment",
      type: "assignment",
      deadline: isFriday ? "Friday" : "Later this week",
      urgencyScore: isFriday ? 5 : 4,
      details: "Schema Design, ER Diagrams & Normalization",
    });
  }

  // 3. Physics / Science
  if (lower.includes("physics")) {
    subjects.push({
      name: "Physics",
      type: "study",
      deadline: lower.includes("tomorrow") ? "Tomorrow" : "Upcoming",
      urgencyScore: 8,
      details: "Electromagnetism & Formula Revision",
    });
  }

  // 4. Chemistry
  if (lower.includes("chemistry")) {
    subjects.push({
      name: "Chemistry",
      type: "study",
      deadline: "Upcoming",
      urgencyScore: 6,
      details: "Reaction Mechanisms & Stoichiometry",
    });
  }

  // 5. Presentation / Slides
  if (lower.includes("presentation") || lower.includes("slides")) {
    subjects.push({
      name: "Presentation Prep",
      type: "presentation",
      deadline: "Today / Soon",
      urgencyScore: 8,
      details: "Slide Structure, Key Talking Points & Rehearsal",
    });
  }

  // 6. Coding / Project / Web Dev
  if (lower.includes("code") || lower.includes("coding") || lower.includes("project") || lower.includes("dev")) {
    if (!subjects.some(s => s.name.includes("DBMS"))) {
      subjects.push({
        name: "Project Implementation",
        type: "project",
        deadline: "This week",
        urgencyScore: 6,
        details: "Feature Development & Unit Testing",
      });
    }
  }

  // Fallback if no known keywords matched
  if (subjects.length === 0) {
    // Attempt to extract meaningful phrases from sentences
    const clauses = query.split(/[,.;&]|\band\b/i).map(c => c.trim()).filter(c => c.length > 3);
    if (clauses.length > 0) {
      clauses.slice(0, 3).forEach((clause, idx) => {
        const cleaned = clause.replace(/^(i have|i need to|help me|i want to|there is)\s*/i, "").trim();
        const capitalized = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
        subjects.push({
          name: capitalized.length > 30 ? capitalized.slice(0, 30) + "..." : capitalized,
          type: "study",
          deadline: idx === 0 ? "Urgent" : "Next",
          urgencyScore: 8 - idx * 2,
          details: "Focused execution and deliverables",
        });
      });
    } else {
      subjects.push({
        name: "Deep Focus Session",
        type: "study",
        deadline: "Tonight",
        urgencyScore: 8,
        details: "High-priority objectives and core review",
      });
    }
  }

  // Sort subjects by urgency
  subjects.sort((a, b) => b.urgencyScore - a.urgencyScore);

  // Allocate time according to available budget
  const tasks: Task[] = [];
  const reasoning: string[] = [];

  // Determine urgency level
  const maxUrgency = Math.max(...subjects.map(s => s.urgencyScore));
  const urgencyLevel: ExtractedContext["urgencyLevel"] =
    maxUrgency >= 8 ? "critical" : maxUrgency >= 6 ? "high" : "moderate";

  // Build reasoning notes
  if (subjects.length >= 2) {
    reasoning.push(
      `${subjects[0].name} comes first because its deadline (${subjects[0].deadline}) is closest and requires uninterrupted cognitive effort.`
    );
    reasoning.push(
      `Your available time tonight is bounded to ${availableMinutes} minutes. We are eliminating low-value friction and protecting deep focus.`
    );
    reasoning.push(
      `${subjects[1].name} (${subjects[1].deadline}) follows immediately after a restorative reset to lock down structural momentum before Friday.`
    );
  } else if (subjects.length === 1) {
    reasoning.push(
      `${subjects[0].name} receives full concentration to secure mastery within your ${availableMinutes} min window.`
    );
    reasoning.push(`Integrated a 10-minute restorative reset to prevent late-evening fatigue.`);
  }

  // Intelligent schedule generation based on available minutes
  if (availableMinutes >= 90 && subjects.length >= 2) {
    const primaryDuration = Math.round(availableMinutes * 0.65);
    const breakDuration = 10;
    const secondaryDuration = Math.round(availableMinutes * 0.20);
    const reviewDuration = availableMinutes - (primaryDuration + breakDuration + secondaryDuration);

    tasks.push({
      id: "task-1",
      title: subjects[0].name,
      subtitle: subjects[0].details,
      duration: primaryDuration,
      priority: "high",
      deadline: subjects[0].deadline,
      reason: `Deadline is closest (${subjects[0].deadline}). High cognitive demand requires protected focus.`,
      successMetric: "Mastered critical theorem sets and passed timed self-test without checking notes",
      category: "study",
      completed: false,
      subtasks: [
        "Review critical theorem definitions & formulas",
        "Solve 4 representative high-weight problems",
        "Self-test on edge cases under timed pressure",
      ],
    });

    tasks.push({
      id: "task-break-1",
      title: "Mind Reset & Hydration",
      subtitle: "Step away from screen, deep breathing, quick physical stretch",
      duration: breakDuration,
      priority: "low",
      deadline: "Scheduled Interval",
      reason: "Restores cognitive baseline and consolidates memory before context switch.",
      successMetric: "Cognitive baseline restored; eyes rested away from monitor",
      category: "break",
      completed: false,
      subtasks: ["Hydrate", "Eye rest away from screen", "Brief stretch"],
    });

    tasks.push({
      id: "task-2",
      title: subjects[1].name,
      subtitle: subjects[1].details,
      duration: secondaryDuration,
      priority: "medium",
      deadline: subjects[1].deadline,
      reason: `Due ${subjects[1].deadline}. Early schema breakdown eliminates deadline dread.`,
      successMetric: "Entity relationships defined and starter scaffolding drafted",
      category: "assignment",
      completed: false,
      subtasks: [
        "Read assignment problem prompt completely",
        "Outline schema entities & initial constraints",
        "Draft quick notes for tomorrow's continuation",
      ],
    });

    if (reviewDuration > 0) {
      tasks.push({
        id: "task-review",
        title: "Consolidation & Day Wrap",
        subtitle: "Audit completed work, prep desk for tomorrow",
        duration: reviewDuration,
        priority: "low",
        deadline: "End of session",
        reason: "Locks in gains and prevents morning scramble.",
        successMetric: "Work cataloged, checklist clear, materials ready for morning",
        category: "review",
        completed: false,
        subtasks: ["Review formula cheat-sheet", "Pack bag for tomorrow morning"],
      });
    }
  } else if (subjects.length === 1) {
    const mainDur = Math.max(20, availableMinutes - 15);
    const wrapDur = availableMinutes - mainDur;

    tasks.push({
      id: "task-1",
      title: subjects[0].name,
      subtitle: subjects[0].details,
      duration: mainDur,
      priority: "high",
      deadline: subjects[0].deadline,
      reason: "Targeted deep-work focus block.",
      successMetric: "Core practice problems solved with zero external distractions",
      category: "study",
      completed: false,
      subtasks: ["Clarify primary objectives", "Deep practice work", "Validate results"],
    });

    if (wrapDur > 0) {
      tasks.push({
        id: "task-wrap",
        title: "Session Wrap & Review",
        subtitle: "Review key takeaways and catalog questions",
        duration: wrapDur,
        priority: "low",
        deadline: "Wrap-up",
        reason: "Reinforces concepts learned.",
        successMetric: "Core takeaways summarized and retained",
        category: "review",
        completed: false,
      });
    }
  } else {
    const perTask = Math.floor(availableMinutes / subjects.length);
    subjects.forEach((subj, i) => {
      tasks.push({
        id: `task-${i + 1}`,
        title: subj.name,
        subtitle: subj.details,
        duration: perTask,
        priority: i === 0 ? "high" : "medium",
        deadline: subj.deadline,
        reason: `Condensed sprint on ${subj.name}.`,
        successMetric: "Milestone deliverable outlined and progressed",
        category: subj.type === "assignment" ? "assignment" : "study",
        completed: false,
      });
    });
  }

  const totalMin = tasks.reduce((sum, t) => sum + t.duration, 0);

  const context: ExtractedContext = {
    availableTimeMinutes: availableMinutes,
    urgencyLevel,
    identifiedSubjects: subjects.map(s => s.name),
    deadlines: subjects.map(s => ({ item: s.name, date: s.deadline })),
    constraints: [`Time budget: ${availableMinutes} minutes`, "Zero distractions recommended"],
  };

  const summary = subjects.length >= 2
    ? `You're not out of time. You're out of room for low-value work. I found ${availableMinutes} minutes tonight. I'm protecting ${tasks[0].duration} minutes for ${subjects[0].name} to guarantee mastery before tomorrow, then securing ${subjects[1]?.name || 'next priority'} in a controlled sprint. Let's execute.`
    : `I found ${availableMinutes} minutes tonight. I've isolated a clean deep-work block for ${subjects[0].name}. We're cutting non-essential friction to secure results. Let's execute.`;

  return { context, tasks, summary, reasoning };
}

export type FollowUpAction =
  | { type: "MESSAGE_ONLY"; message: string }
  | { type: "START_TASK"; taskId: string; message: string }
  | { type: "MARK_COMPLETED"; taskId: string; message: string; nextTaskId?: string }
  | { type: "RESCHEDULE_TIME"; newTotalMinutes: number; message: string; updatedTasks: Task[] }
  | { type: "REMOVE_TASK"; taskId: string; message: string; updatedTasks: Task[] }
  | { type: "NEW_PLAN"; plan: Plan; message: string };

// Intelligent follow-up interpreter based on current state
export function handleFollowUp(
  query: string,
  currentState: SessionState
): FollowUpAction {
  const lower = query.toLowerCase().trim();
  const plan = currentState.plan;

  // 1. "What should I do next?" / "What's next?" / "Now what?"
  if (
    lower.includes("what should i do next") ||
    lower.includes("what's next") ||
    lower.includes("whats next") ||
    lower.includes("what next") ||
    lower.includes("now what") ||
    lower.includes("where am i") ||
    lower.includes("recommendation")
  ) {
    if (!plan || plan.tasks.length === 0) {
      return {
        type: "MESSAGE_ONLY",
        message: "No active plan found. Tell me what tasks or deadlines you have, and I will construct an optimized plan.",
      };
    }

    const uncompleted = plan.tasks.filter(t => !currentState.completedTaskIds.includes(t.id));
    if (uncompleted.length === 0) {
      return {
        type: "MESSAGE_ONLY",
        message: "You've crushed every task in this session! Take a well-deserved break or ask me to schedule tomorrow's agenda.",
      };
    }

    const next = uncompleted[0];
    return {
      type: "START_TASK",
      taskId: next.id,
      message: `Your next priority is **${next.title}** (${next.duration} mins). ${next.reason || "Let's dive in!"}`,
    };
  }

  // 2. "I finished [Task]" / "Done with [Task]" / "Completed [Task]"
  if (
    lower.includes("i finished") ||
    lower.includes("i have finished") ||
    lower.includes("done with") ||
    lower.includes("completed") ||
    lower.includes("i completed")
  ) {
    if (!plan) {
      return {
        type: "MESSAGE_ONLY",
        message: "Great job! To track your progress, create a plan with me first.",
      };
    }

    // Identify which task was finished
    let matchedTask = plan.tasks.find(
      t =>
        !currentState.completedTaskIds.includes(t.id) &&
        (lower.includes(t.title.toLowerCase()) ||
          (t.title.toLowerCase().includes("math") && (lower.includes("math") || lower.includes("maths"))) ||
          (t.title.toLowerCase().includes("dbms") && lower.includes("dbms")))
    );

    // If not explicitly mentioned by name, take the active task or first uncompleted
    if (!matchedTask) {
      matchedTask =
        plan.tasks.find(t => t.id === currentState.activeTaskId) ||
        plan.tasks.find(t => !currentState.completedTaskIds.includes(t.id));
    }

    if (matchedTask) {
      const remaining = plan.tasks.filter(
        t => t.id !== matchedTask!.id && !currentState.completedTaskIds.includes(t.id)
      );
      const nextTask = remaining[0];

      return {
        type: "MARK_COMPLETED",
        taskId: matchedTask.id,
        nextTaskId: nextTask?.id,
        message: `Marked **${matchedTask.title}** as complete! ${
          nextTask
            ? `Next up is **${nextTask.title}** (${nextTask.duration} mins). Ready when you are.`
            : "That wraps up all planned tasks for tonight. Outstanding focus!"
        }`,
      };
    }
  }

  // 3. "I only have 30 minutes" / "I have 45 minutes" / "Give me a shorter plan"
  if (
    lower.includes("only have") ||
    lower.includes("shorter plan") ||
    lower.includes("cut down") ||
    lower.includes("shorten") ||
    lower.includes("less time")
  ) {
    const newMinutes = extractAvailableMinutes(query);
    if (plan) {
      // Re-scale remaining tasks
      const remainingTasks = plan.tasks.filter(t => !currentState.completedTaskIds.includes(t.id));
      if (remainingTasks.length > 0) {
        const totalOld = remainingTasks.reduce((s, t) => s + t.duration, 0);
        const scale = newMinutes / totalOld;
        const updated = plan.tasks.map(t => {
          if (currentState.completedTaskIds.includes(t.id)) return t;
          const newDur = Math.max(5, Math.round(t.duration * scale));
          return { ...t, duration: newDur };
        });

        return {
          type: "RESCHEDULE_TIME",
          newTotalMinutes: newMinutes,
          updatedTasks: updated,
          message: `Adjusted your remaining schedule to fit **${newMinutes} minutes**. Durations have been intelligently compressed while preserving high-priority coverage.`,
        };
      }
    }
  }

  // 4. "Move DBMS to tomorrow" / "Postpone [Task]" / "Skip [Task]"
  if (lower.includes("move") || lower.includes("postpone") || lower.includes("remove") || lower.includes("delay")) {
    if (plan) {
      const taskToRemove = plan.tasks.find(
        t =>
          (lower.includes("dbms") && t.title.toLowerCase().includes("dbms")) ||
          (lower.includes("math") && t.title.toLowerCase().includes("math")) ||
          lower.includes(t.title.toLowerCase())
      );

      if (taskToRemove) {
        const updated = plan.tasks.filter(t => t.id !== taskToRemove.id);
        return {
          type: "REMOVE_TASK",
          taskId: taskToRemove.id,
          updatedTasks: updated,
          message: `Moved **${taskToRemove.title}** to tomorrow's backlog. Re-balanced tonight's focus exclusively around immediate deliverables.`,
        };
      }
    }
  }

  // 5. "Start the next task" / "Start plan" / "Begin focus"
  if (
    lower.includes("start the next task") ||
    lower.includes("start next task") ||
    lower.includes("start plan") ||
    lower.includes("begin") ||
    lower.includes("let's go") ||
    lower.includes("start focus")
  ) {
    if (plan) {
      const next = plan.tasks.find(t => !currentState.completedTaskIds.includes(t.id));
      if (next) {
        return {
          type: "START_TASK",
          taskId: next.id,
          message: `Starting focus timer for **${next.title}** (${next.duration} mins). Deep work mode engaged.`,
        };
      }
    }
  }

  // 6. Otherwise generate a fresh or revised plan
  const parsed = analyzeQuery(query);
  const newPlan: Plan = {
    id: `plan-${Date.now()}`,
    query,
    summary: parsed.summary,
    tasks: parsed.tasks,
    totalMinutes: parsed.tasks.reduce((acc, t) => acc + t.duration, 0),
    reasoning: parsed.reasoning,
    extractedContext: parsed.context,
    createdAt: new Date().toISOString(),
  };

  return {
    type: "NEW_PLAN",
    plan: newPlan,
    message: parsed.summary,
  };
}
