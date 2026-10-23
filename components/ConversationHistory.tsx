"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Bot, User, Clock, Terminal } from "lucide-react";
import { MessageHistory } from "@/types";

interface ConversationHistoryProps {
  history: MessageHistory[];
}

export function ConversationHistory({ history }: ConversationHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (history.length <= 1) return null;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 mt-8">
      <div className="surface-obsidian rounded-xl border-white/[0.06] overflow-hidden">
        {/* Toggle Bar */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-[11px] font-mono text-slate-400 hover:text-white transition bg-obsidian-900/40"
        >
          <div className="flex items-center space-x-2">
            <Terminal className="w-3.5 h-3.5 text-brand-cyan" />
            <span className="tracking-wider">SESSION DIALOGUE LOG ({history.length} EVENTS)</span>
          </div>
          <div className="flex items-center space-x-1 text-slate-500">
            <span>{isOpen ? "COLLAPSE" : "EXPAND"}</span>
            {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </div>
        </button>

        {/* Log Entries */}
        {isOpen && (
          <div className="p-4 space-y-3 max-h-72 overflow-y-auto border-t border-white/[0.06]">
            {history.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 text-xs ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "nexora" && (
                  <div className="w-5 h-5 rounded-md bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan shrink-0 mt-0.5">
                    <Bot className="w-3 h-3" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-xl p-3 ${
                    msg.role === "user"
                      ? "bg-brand-indigo/15 text-slate-200 border border-brand-indigo/25 rounded-tr-none"
                      : "bg-obsidian-900 text-slate-300 border border-white/[0.06] rounded-tl-none"
                  }`}
                >
                  <div className="flex items-center justify-between space-x-3 mb-1">
                    <span className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">
                      {msg.role === "user" ? "USER INPUT" : "NEXORA TELEMETRY"}
                    </span>
                    <span className="font-mono text-[9px] text-slate-600 flex items-center space-x-1">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </span>
                  </div>
                  <p className="leading-relaxed whitespace-pre-wrap font-light">{msg.text}</p>
                </div>

                {msg.role === "user" && (
                  <div className="w-5 h-5 rounded-md bg-brand-indigo/20 border border-brand-indigo/30 flex items-center justify-center text-brand-indigo shrink-0 mt-0.5">
                    <User className="w-3 h-3" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
