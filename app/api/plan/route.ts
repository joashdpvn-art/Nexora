import { NextRequest, NextResponse } from "next/server";
import { handleFollowUp } from "@/lib/reasoningEngine";
import { Plan, SessionState, Task } from "@/types";

interface ModelStructuredOutput {
  nextMove: string;
  durationMinutes: number;
  reason: string;
  objectives: Array<{
    title: string;
    description: string;
    durationMinutes: number;
  }>;
}

/**
 * Checks if a query is a casual conversational greeting
 */
function isGreetingQuery(query: string): boolean {
  const clean = query.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  const words = clean.split(" ").filter(Boolean);

  const greetings = new Set([
    "hi", "hello", "hey", "yo", "sup", "howdy", "hola", "greetings",
    "good morning", "good afternoon", "good evening", "good night", "good day",
    "thanks", "thank you", "thx", "cool", "ok", "okay", "great", "awesome", "got it", "understood", "nice",
    "help", "who are you", "what can you do", "what is nexora", "test", "ping"
  ]);

  return (
    greetings.has(clean) ||
    (words.length <= 2 && words.every(w => ["hi", "hello", "hey", "yo", "there", "nexora", "assistant", "bot", "morning", "evening"].includes(w)))
  );
}

/**
 * Checks if a query is a conversational session follow-up
 */
function isFollowUpActionQuery(query: string): boolean {
  const lower = query.toLowerCase().trim();
  return (
    lower.includes("what should i do next") ||
    lower.includes("what's next") ||
    lower.includes("whats next") ||
    lower.includes("what next") ||
    lower.includes("now what") ||
    lower.includes("where am i") ||
    lower.includes("recommendation") ||
    lower.includes("finished") ||
    lower.includes("done with") ||
    lower.includes("completed") ||
    lower.includes("only have") ||
    lower.includes("shorter plan") ||
    lower.includes("cut down") ||
    lower.includes("move") ||
    lower.includes("postpone") ||
    lower.includes("delay") ||
    lower.includes("start the next task") ||
    lower.includes("start plan") ||
    lower.includes("begin focus")
  );
}

/**
 * Calls the configured real LLM provider
 */
async function callRealLLM(query: string, currentState: SessionState): Promise<ModelStructuredOutput | null> {
  const openaiKey = process.env.OPENAI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  const hasAnyKey = Boolean(openaiKey || groqKey || geminiKey || anthropicKey);
  if (!hasAnyKey) {
    return null;
  }

  const prompt = `The user is in this situation:
"${query}"

Active plan in memory: ${currentState?.plan ? currentState.plan.summary : "None"}

You must independently determine their single best next move.
Reason about:
- priorities
- deadlines
- available time
- urgency
- dependencies
- what the user should do next

Return structured JSON matching this exact schema:
{
  "nextMove": "Name of the single highest-priority objective to do first",
  "durationMinutes": number,
  "reason": "Direct, crisp 1-2 sentence explanation of why this objective is prioritized first and how it protects their available time",
  "objectives": [
    {
      "title": "Objective title",
      "description": "Concrete subtasks and deliverables",
      "durationMinutes": number
    }
  ]
}

Rules:
1. "nextMove" MUST be the highest-leverage single objective to do first.
2. The duration of "nextMove" must match the first objective in "objectives".
3. The sum of all objectives' durationMinutes must match or fit into the user's available time.
4. If available time is not mentioned, budget around 90 to 120 minutes total.
5. If the session is longer than 50 minutes, include a brief 5-10 minute restorative reset interval between intense focus sessions.
6. Calculate all values dynamically from the user's situation. Do NOT hardcode Mathematics or DBMS unless the user explicitly requested them.
7. Return raw JSON ONLY.`;

  // 1. Groq API (Ultra-fast real LLM)
  if (groqKey) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: "You are NEXORA, an intelligent executive productivity engine. Respond with valid JSON matching the schema ONLY.",
            },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content || "";
        const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        return JSON.parse(cleaned);
      }
    } catch (err) {
      console.warn("NEXORA: Groq API call error, trying next provider:", err);
    }
  }

  // 2. OpenAI API
  if (openaiKey) {
    try {
      const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1/chat/completions";
      const res = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are NEXORA, an intelligent executive productivity engine. Respond with valid JSON matching the schema ONLY.",
            },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content || "";
        const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        return JSON.parse(cleaned);
      }
    } catch (err) {
      console.warn("NEXORA: OpenAI API call error, trying next provider:", err);
    }
  }

  // 3. Google Gemini API
  if (geminiKey) {
    try {
      const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        return JSON.parse(cleaned);
      }
    } catch (err) {
      console.warn("NEXORA: Gemini API call error, trying next provider:", err);
    }
  }

  // 4. Anthropic Claude API
  if (anthropicKey) {
    try {
      const model = process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-20241022";
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: 1024,
          system: "You are NEXORA, an intelligent executive productivity engine. Respond with raw JSON matching the schema ONLY.",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.content?.[0]?.text || "";
        const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        return JSON.parse(cleaned);
      }
    } catch (err) {
      console.warn("NEXORA: Anthropic API call error:", err);
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query: string = (body.query || "").trim();
    const currentState: SessionState = body.currentState;

    if (!query) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    // 1. Greetings: Return conversational response immediately without calling planning model
    if (isGreetingQuery(query)) {
      return NextResponse.json({
        source: "local-engine",
        action: handleFollowUp(query, currentState),
      });
    }

    // 2. Follow-up actions (mark done, reschedule, postpone): Handled deterministically
    if (isFollowUpActionQuery(query)) {
      return NextResponse.json({
        source: "local-engine",
        action: handleFollowUp(query, currentState),
      });
    }

    // 3. Meaningful Situation: Attempt real LLM reasoning
    const modelOutput = await callRealLLM(query, currentState);

    if (modelOutput && modelOutput.objectives && modelOutput.objectives.length > 0) {
      const nextMove = modelOutput.nextMove || modelOutput.objectives[0]?.title || "Primary Objective";
      const durationMinutes = Number(modelOutput.durationMinutes) || modelOutput.objectives[0]?.durationMinutes || 45;
      const reason = modelOutput.reason || `Prioritizing ${nextMove} to protect your available attention for immediate deliverables.`;

      const tasks: Task[] = modelOutput.objectives.map((obj, idx) => {
        const isFirst = idx === 0;
        const isBreak = /break|rest|stretch|hydrate|walk/i.test(obj.title);
        const isReview = /wrap|review|audit|prep/i.test(obj.title);
        const dur = typeof obj.durationMinutes === "number" ? obj.durationMinutes : (isBreak ? 10 : 30);

        return {
          id: `task-${idx + 1}`,
          title: obj.title || `Objective ${idx + 1}`,
          subtitle: obj.description || "Focused execution block",
          duration: isFirst ? durationMinutes : dur,
          priority: isFirst ? ("high" as const) : isBreak ? ("low" as const) : ("medium" as const),
          deadline: isFirst ? "Immediate" : "Scheduled",
          reason: isFirst ? reason : `Sequential progression following ${nextMove}.`,
          successMetric: isFirst
            ? `Completed core work on ${obj.title} with uninterrupted focus`
            : `Objective milestones advanced and verified`,
          category: isBreak ? ("break" as const) : isReview ? ("review" as const) : ("study" as const),
          completed: false,
          subtasks: obj.description
            ? [obj.description]
            : ["Clarify objective targets", "Execute uninterrupted", "Validate deliverables"],
        };
      });

      const totalMinutes = tasks.reduce((sum, t) => sum + t.duration, 0);

      const plan: Plan = {
        id: `plan-${Date.now()}`,
        query,
        summary: reason,
        tasks,
        totalMinutes,
        reasoning: [
          reason,
          `Protected ${tasks[0].duration} minutes of high-focus attention for ${tasks[0].title}.`,
          tasks.length > 1
            ? `Remaining ${totalMinutes - tasks[0].duration} minutes partitioned across secondary deliverables and restorative pacing.`
            : "Single-objective dedicated focus block.",
        ],
        extractedContext: {
          availableTimeMinutes: totalMinutes,
          urgencyLevel: "high",
          identifiedSubjects: tasks.filter(t => t.category !== "break").map(t => t.title),
          deadlines: [{ item: tasks[0].title, date: tasks[0].deadline || "Immediate" }],
          constraints: [`Time budget: ${totalMinutes} minutes`],
        },
        createdAt: new Date().toISOString(),
      };

      return NextResponse.json({
        source: "cloud-ai",
        action: {
          type: "NEW_PLAN",
          plan,
          message: reason,
        },
      });
    }

    // 4. Fallback to dynamic local reasoning engine if real model unavailable
    const fallbackAction = handleFollowUp(query, currentState);
    return NextResponse.json({
      source: "local-engine",
      action: fallbackAction,
    });
  } catch (error: any) {
    console.error("API error in /api/plan:", error);
    const fallbackAction = handleFollowUp("", {
      currentView: "command",
      plan: null,
      activeTaskId: null,
      completedTaskIds: [],
      elapsedSecondsByTask: {},
      totalSecondsSpent: 0,
      history: [],
      lastQuery: "",
      updatedAt: new Date().toISOString(),
    });
    return NextResponse.json({
      source: "local-engine",
      action: fallbackAction,
    });
  }
}
