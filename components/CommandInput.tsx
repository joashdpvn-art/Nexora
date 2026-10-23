"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, ArrowRight, CornerDownLeft, Sparkles, Terminal, Cpu } from "lucide-react";
import { createSpeechListener, isSpeechRecognitionSupported } from "@/lib/speech";

interface CommandInputProps {
  onSubmit: (command: string) => void;
  isProcessing: boolean;
  processingStep?: "received" | "understanding" | "synthesizing";
  hasExistingPlan: boolean;
  lastQuery?: string;
  completedCount: number;
}

export const DEMO_PROMPT =
  "I have Maths tomorrow, a DBMS assignment due Friday, and I have two hours tonight. Help me decide what to do.";

export function CommandInput({
  onSubmit,
  isProcessing,
  processingStep = "received",
  hasExistingPlan,
}: CommandInputProps) {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const speechRef = useRef<{ start: () => void; stop: () => void } | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setSpeechSupported(isSpeechRecognitionSupported());
  }, []);

  const handleToggleSpeech = () => {
    setSpeechError(null);
    if (isListening) {
      speechRef.current?.stop();
      setIsListening(false);
      return;
    }

    if (!speechSupported) {
      setSpeechError("Voice input is not supported in this browser. Please type your command.");
      return;
    }

    const listener = createSpeechListener(
      (transcript, isFinal) => {
        setInput(transcript);
        if (isFinal) {
          setIsListening(false);
        }
      },
      (error) => {
        setSpeechError(error);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );

    speechRef.current = listener;
    setIsListening(true);
    listener.start();
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isProcessing) return;
    if (isListening) {
      speechRef.current?.stop();
      setIsListening(false);
    }
    const cmd = input.trim();
    setInput("");
    onSubmit(cmd);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const triggerPrompt = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
    onSubmit(prompt);
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
      {/* Hero Header */}
      <div className="text-center mb-8 px-4">
        {/* Subtle System Status Pill */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-slate-300 text-xs mb-4 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse"></span>
          <span className="font-mono text-[11px] tracking-wider text-slate-400 uppercase">
            AUTONOMOUS COMMAND SURFACE
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-3">
          Tell me what you&apos;re dealing with.
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
          NEXORA turns context into your next best action.
        </p>
      </div>

      {/* Main Command Surface (Hero Component) */}
      <form onSubmit={handleSubmit} className="w-full px-4 mb-6">
        <div
          className={`relative rounded-2xl surface-obsidian command-glow-border p-3 sm:p-4 transition-all duration-300 ${
            isListening
              ? "border-brand-cyan/60 shadow-telemetry-active"
              : isProcessing
              ? "border-brand-cyan/40 shadow-telemetry"
              : "hover:border-white/15 focus-within:border-brand-cyan/40 focus-within:shadow-telemetry"
          }`}
        >
          {/* Active Voice Listening Pill */}
          {isListening && (
            <div className="flex items-center space-x-2 px-3 py-1.5 mb-2 bg-brand-cyan/10 border border-brand-cyan/20 rounded-lg text-brand-cyan text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-cyan opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-cyan"></span>
              </span>
              <span className="font-mono font-medium">RECEIVING AUDIO INPUT...</span>
            </div>
          )}

          {/* Thinking / Reasoning Micro-interaction Bar */}
          {isProcessing && (
            <div className="mb-3 p-3 rounded-xl bg-obsidian-900 border border-brand-cyan/30 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Cpu className="w-4 h-4 text-brand-cyan animate-spin" />
                <div className="flex flex-col">
                  <span className="text-xs font-mono font-bold tracking-wider text-white uppercase">
                    {processingStep === "received" && "COMMAND RECEIVED"}
                    {processingStep === "understanding" && "UNDERSTANDING CONSTRAINTS..."}
                    {processingStep === "synthesizing" && "BUILDING OPTIMAL PLAN..."}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {processingStep === "received" && "Parsing temporal markers & task weight"}
                    {processingStep === "understanding" && "Priority mapped • Time budget constrained"}
                    {processingStep === "synthesizing" && "Finalizing execution sequence"}
                  </span>
                </div>
              </div>
              <div className="flex space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2">
            <textarea
              ref={inputRef}
              rows={3}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                hasExistingPlan
                  ? 'Ask a follow-up ("What should I do next?", "I finished Maths", "Only 30 minutes left")...'
                  : 'E.g. "I have Mathematics tomorrow, DBMS assignment due Friday, and two hours tonight..."'
              }
              disabled={isProcessing}
              className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm sm:text-base p-1 sm:p-2 resize-none outline-none focus:ring-0 leading-relaxed font-normal"
              aria-label="Natural-language situation or command"
            />
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.06] mt-1">
            <div className="flex items-center space-x-2">
              {/* Mic Visual Button */}
              <button
                type="button"
                onClick={handleToggleSpeech}
                disabled={isProcessing}
                className={`p-2 rounded-xl transition duration-200 flex items-center justify-center ${
                  isListening
                    ? "bg-brand-cyan text-slate-950 shadow-telemetry-active"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
                }`}
                title={speechSupported ? "Voice input" : "Voice input unavailable"}
                aria-label={isListening ? "Stop voice input" : "Start voice input"}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <span className="hidden sm:flex items-center space-x-1 text-[11px] text-slate-500 font-mono">
                <CornerDownLeft className="w-3 h-3" />
                <span>Enter to execute</span>
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="submit"
                disabled={!input.trim() || isProcessing}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-1.5 transition duration-200 ${
                  input.trim() && !isProcessing
                    ? "bg-brand-cyan hover:bg-sky-400 text-slate-950 font-mono tracking-wider shadow-telemetry cursor-pointer"
                    : "bg-white/[0.04] text-slate-600 font-mono tracking-wider cursor-not-allowed border border-white/[0.04]"
                }`}
                aria-label="Execute command"
              >
                <span>{isProcessing ? "PROCESSING..." : "EXECUTE"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Speech Error Banner */}
        {speechError && (
          <div className="mt-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg flex items-center justify-between">
            <span>{speechError}</span>
            <button
              type="button"
              onClick={() => setSpeechError(null)}
              className="text-slate-400 hover:text-white text-xs underline ml-2"
            >
              Dismiss
            </button>
          </div>
        )}
      </form>

      {/* Featured LIVE DEMO Capsule */}
      <div className="w-full px-4 mb-6">
        <div className="surface-obsidian p-4 rounded-xl border-brand-cyan/25 bg-gradient-to-r from-brand-cyan/[0.04] to-brand-indigo/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:border-brand-cyan/40 transition">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 shrink-0 mt-0.5">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-brand-cyan uppercase">
                  LIVE SCENARIO
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 mt-0.5 line-clamp-1 italic font-light">
                &ldquo;{DEMO_PROMPT}&rdquo;
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => triggerPrompt(DEMO_PROMPT)}
            disabled={isProcessing}
            className="shrink-0 px-4 py-2 rounded-lg bg-brand-cyan/15 hover:bg-brand-cyan hover:text-slate-950 text-brand-cyan text-xs font-mono font-bold tracking-wider border border-brand-cyan/30 hover:border-brand-cyan transition duration-200 flex items-center justify-center space-x-2 shadow-sm"
          >
            <span>RUN SCENARIO</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Prompts (Command Suggestions) */}
      <div className="w-full px-4">
        <div className="flex items-center space-x-2 mb-2.5">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            {hasExistingPlan ? "CONTEXT-AWARE COMMANDS" : "COMMAND SUGGESTIONS"}
          </span>
          <div className="flex-1 h-[1px] bg-white/[0.04]"></div>
        </div>

        <div className="flex flex-wrap gap-2">
          {hasExistingPlan ? (
            <>
              <button
                type="button"
                onClick={() => triggerPrompt("What should I do next?")}
                disabled={isProcessing}
                className="px-3.5 py-1.5 rounded-lg text-xs font-mono system-pill text-brand-cyan hover:border-brand-cyan transition flex items-center space-x-1.5"
              >
                <span>&ldquo;WHAT SHOULD I DO NEXT?&rdquo;</span>
                <CornerDownLeft className="w-3 h-3 opacity-60" />
              </button>
              <button
                type="button"
                onClick={() => triggerPrompt("I finished Maths.")}
                disabled={isProcessing}
                className="px-3.5 py-1.5 rounded-lg text-xs font-mono system-pill text-emerald-400 hover:border-emerald-400 transition flex items-center space-x-1.5"
              >
                <span>&ldquo;I FINISHED MATHS.&rdquo;</span>
                <CornerDownLeft className="w-3 h-3 opacity-60" />
              </button>
              <button
                type="button"
                onClick={() => triggerPrompt("I only have 30 minutes.")}
                disabled={isProcessing}
                className="px-3.5 py-1.5 rounded-lg text-xs font-mono system-pill text-amber-400 hover:border-amber-400 transition flex items-center space-x-1.5"
              >
                <span>&ldquo;I ONLY HAVE 30 MINUTES.&rdquo;</span>
                <CornerDownLeft className="w-3 h-3 opacity-60" />
              </button>
              <button
                type="button"
                onClick={() => triggerPrompt("Move DBMS to tomorrow.")}
                disabled={isProcessing}
                className="px-3.5 py-1.5 rounded-lg text-xs font-mono system-pill text-slate-300 hover:text-white transition flex items-center space-x-1.5"
              >
                <span>&ldquo;MOVE DBMS TO TOMORROW.&rdquo;</span>
                <CornerDownLeft className="w-3 h-3 opacity-60" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => triggerPrompt("Plan my evening: Maths exam tomorrow and two hours tonight.")}
                disabled={isProcessing}
                className="px-3.5 py-1.5 rounded-lg text-xs font-mono system-pill text-slate-300 hover:text-white hover:border-brand-cyan/40 transition"
              >
                PLAN MY EVENING
              </button>
              <button
                type="button"
                onClick={() =>
                  triggerPrompt("I'm running out of time. Urgent Physics test tomorrow and 45 minutes left.")
                }
                disabled={isProcessing}
                className="px-3.5 py-1.5 rounded-lg text-xs font-mono system-pill text-slate-300 hover:text-white hover:border-brand-cyan/40 transition"
              >
                I&apos;M RUNNING OUT OF TIME
              </button>
              <button
                type="button"
                onClick={() =>
                  triggerPrompt("AI presentation in 3 hours. Need a focused rehearsal schedule.")
                }
                disabled={isProcessing}
                className="px-3.5 py-1.5 rounded-lg text-xs font-mono system-pill text-slate-300 hover:text-white hover:border-brand-cyan/40 transition"
              >
                PREPARE PRESENTATION
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
