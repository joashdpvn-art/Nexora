import { NextRequest, NextResponse } from "next/server";
import { handleFollowUp } from "@/lib/reasoningEngine";
import { SessionState } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query: string = body.query || "";
    const currentState: SessionState = body.currentState;

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    const provider = process.env.AI_PROVIDER || "local";
    const apiKey = process.env.OPENAI_API_KEY;

    // Optional OpenAI integration if user provides key in .env.local
    if (provider === "openai" && apiKey) {
      try {
        const prompt = `You are NEXORA, an intelligent executive productivity engine.
The user says: "${query}"
Active plan summary: ${currentState?.plan ? currentState.plan.summary : "None"}
Completed tasks: ${currentState?.completedTaskIds?.join(", ") || "None"}
Respond with JSON matching this structure:
{
  "summary": "Brief executive summary",
  "reasoning": ["point 1", "point 2"],
  "tasks": [
    {
      "id": "task-1",
      "title": "Title",
      "subtitle": "details",
      "duration": 60,
      "priority": "high",
      "deadline": "Tomorrow",
      "category": "study",
      "reason": "Why urgent"
    }
  ]
}`;

        const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: process.env.OPENAI_MODEL || "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
          }),
        });

        if (aiRes.ok) {
          const aiJson = await aiRes.json();
          const parsed = JSON.parse(aiJson.choices[0].message.content);
          return NextResponse.json({
            source: "cloud-ai",
            action: {
              type: "NEW_PLAN",
              plan: {
                id: `plan-${Date.now()}`,
                query,
                summary: parsed.summary,
                tasks: parsed.tasks.map((t: any, i: number) => ({
                  ...t,
                  id: t.id || `task-${i + 1}`,
                  completed: false,
                })),
                totalMinutes: parsed.tasks.reduce((s: number, t: any) => s + (t.duration || 30), 0),
                reasoning: parsed.reasoning || [],
                extractedContext: {
                  availableTimeMinutes: 120,
                  urgencyLevel: "high",
                  identifiedSubjects: parsed.tasks.map((t: any) => t.title),
                  deadlines: [],
                  constraints: [],
                },
                createdAt: new Date().toISOString(),
              },
              message: parsed.summary,
            },
          });
        }
      } catch (e) {
        console.warn("AI provider error, falling back to local engine:", e);
      }
    }

    // Default: Local reasoning engine
    const action = handleFollowUp(query, currentState);
    return NextResponse.json({
      source: "local-engine",
      action,
    });
  } catch (error: any) {
    console.error("API error in /api/plan:", error);
    return NextResponse.json(
      { error: "Internal processing error", details: error?.message },
      { status: 500 }
    );
  }
}
