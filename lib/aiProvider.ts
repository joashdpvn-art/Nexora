import { FollowUpAction, handleFollowUp } from "./reasoningEngine";
import { SessionState } from "@/types";

export interface ProcessCommandResult {
  action: FollowUpAction;
  source: "local-engine" | "cloud-ai";
}

/**
 * Process a user command with intelligent routing:
 * 1. Checks if server-side AI provider is requested/available
 * 2. Defaults reliably to deterministic local reasoning engine (zero network lag, 100% offline uptime)
 */
export async function processCommand(
  query: string,
  currentState: SessionState
): Promise<ProcessCommandResult> {
  // Attempt optional server AI route if configured
  try {
    const res = await fetch("/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, currentState }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.action) {
        return {
          action: data.action,
          source: data.source || "cloud-ai",
        };
      }
    }
  } catch (err) {
    // Graceful fallback to deterministic local engine
    console.info("Using local NEXORA reasoning engine:", err);
  }

  // Local reasoning engine
  const localAction = handleFollowUp(query, currentState);
  return {
    action: localAction,
    source: "local-engine",
  };
}
