"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, ArrowRight, CornerDownLeft } from "lucide-react";
import { createSpeechListener, isSpeechRecognitionSupported } from "@/lib/speech";
import { NexoraCore } from "./NexoraCore";

interface CommandInputProps {
  onSubmit: (command: string) => void;
  isProcessing: boolean;
  hasExistingPlan: boolean;
  lastQuery?: string;
  completedCount: number;
}

export const DEMO_PROMPT =
  "I have Maths tomorrow, a DBMS assignment due Friday, and I have two hours tonight. Help me decide what to do.";

export function CommandInput({
  onSubmit,
  isProcessing,
  hasExistingPlan,
}: CommandInputProps) {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [aiThinkingStage, setAiThinkingStage] = useState<string>("COMMAND RECEIVED");
  const speechRef = useRef<{ start: () => void; stop: () => void } | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setSpeechSupported(isSpeechRecognitionSupported());
  }, []);

  // Cinematic AI Thinking Transformation
  useEffect(() => {
    let t1: NodeJS.Timeout, t2: NodeJS.Timeout, t3: NodeJS.Timeout, t4: NodeJS.Timeout, t5: NodeJS.Timeout;

    if (isProcessing) {
      setAiThinkingStage("COMMAND RECEIVED");
      t1 = setTimeout(() => setAiThinkingStage("UNDERSTANDING"), 220);
      t2 = setTimeout(() => setAiThinkingStage("CONSTRAINTS FOUND"), 480);
      t3 = setTimeout(() => setAiThinkingStage("PRIORITIES RESOLVED"), 750);
      t4 = setTimeout(() => setAiThinkingStage("TIME OPTIMIZED"), 1020);
      t5 = setTimeout(() => setAiThinkingStage("STRATEGY READY"), 1280);
    } else {
      setAiThinkingStage("");
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [isProcessing]);

  const handleToggleSpeech = () => {
    setSpeechError(null);
    if (isListening) {
      speechRef.current?.stop();
      setIsListening(false);
      return;
    }

    if (!speechSupported) {
      setSpeechError("Voice input is not supported in this browser. Please type your situation.");
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
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center py-6 sm:py-14 animate-in fade-in duration-500">
      {/* Living AI Core Presence */}
      <div className="mb-6">
        <NexoraCore state={isProcessing ? "thinking" : isListening ? "focus" : "idle"} size="md" />
      </div>

      {/* Cinematic AI Reaction (When Thinking) */}
      {isProcessing ? (
        <div className="text-center py-10 space-y-4 animate-in fade-in duration-300">
          <div className="font-mono text-xs tracking-[0.3em] uppercase text-brand-cyan">
            NEXORA REASONING
          </div>
          <div className="text-2xl sm:text-4xl md:text-5xl font-black font-mono tracking-tight text-white uppercase animate-in zoom-in-95 duration-200">
            {aiThinkingStage}
          </div>
          <p className="text-xs font-mono text-slate-500 tracking-wider">
            Synthesizing decision from your constraints
          </p>
        </div>
      ) : (
        <>
          {/* Main Hero Typography */}
          <div className="text-center mb-8 px-4 max-w-2xl">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-3">
              Tell me what you&apos;re dealing with.
            </h1>
            <p className="text-slate-400 text-sm sm:text-base font-light leading-relaxed">
              NEXORA turns context into your next best action.
            </p>
          </div>

          {/* Sovereign Command Surface */}
          <form onSubmit={handleSubmit} className="w-full px-4 mb-6">
            <div
              className={`relative rounded-3xl surface-obsidian command-glow-border p-4 sm:p-5 transition-all duration-300 ${
                isListening
                  ? "border-brand-cyan/60 shadow-telemetry-active"
                  : "hover:border-white/15 focus-within:border-brand-cyan/40 focus-within:shadow-telemetry"
              }`}
            >
              {/* Active Voice Pill */}
              {isListening && (
                <div className="flex items-center space-x-2 px-3 py-1.5 mb-2 bg-brand-cyan/10 border border-brand-cyan/20 rounded-lg text-brand-cyan text-xs font-mono">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-cyan opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-cyan"></span>
                  </span>
                  <span className="tracking-wider">LISTENING... SPEAK FREELY</span>
                </div>
              )}

              {/* Conversational Text Input */}
              <div className="flex items-start">
                <textarea
                  ref={inputRef}
                  rows={3}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    hasExistingPlan
                      ? 'Tell NEXORA what changed ("Finished Maths", "Only have 30 mins", "What\'s next?")...'
                      : 'E.g. "I have Mathematics tomorrow, DBMS assignment due Friday, and two hours tonight..."'
                  }
                  disabled={isProcessing}
                  className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm sm:text-base p-1 sm:p-2 resize-none outline-none focus:ring-0 leading-relaxed font-normal"
                  aria-label="Natural-language command or situation"
                />
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-3 border-t border-white/[0.05] mt-1">
                <div className="flex items-center space-x-2">
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

                <button
                  type="submit"
                  disabled={!input.trim() || isProcessing}
                  className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-2 transition duration-200 ${
                    input.trim() && !isProcessing
                      ? "bg-brand-cyan hover:bg-sky-400 text-slate-950 font-mono tracking-wider shadow-telemetry cursor-pointer"
                      : "bg-white/[0.04] text-slate-600 font-mono tracking-wider cursor-not-allowed border border-white/[0.04]"
                  }`}
                  aria-label="Execute command"
                >
                  <span>EXECUTE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
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

          {/* Minimal Supporting Context */}
          <div className="w-full px-4 space-y-4">
            {/* Subtle Live Demo Capsule */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl border border-white/[0.05] bg-white/[0.015] hover:border-brand-cyan/25 transition gap-2">
              <div className="flex items-center space-x-2.5 overflow-hidden">
                <span className="text-[10px] font-mono tracking-widest uppercase text-brand-cyan font-bold shrink-0">
                  SCENARIO:
                </span>
                <span className="text-xs text-slate-300 font-light truncate">
                  &ldquo;{DEMO_PROMPT}&rdquo;
                </span>
              </div>
              <button
                type="button"
                onClick={() => triggerPrompt(DEMO_PROMPT)}
                className="text-xs font-mono font-semibold text-brand-cyan hover:text-sky-300 shrink-0 flex items-center space-x-1"
              >
                <span>RUN SCENARIO</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Quiet Suggestion Text Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {hasExistingPlan ? (
                <>
                  <button
                    type="button"
                    onClick={() => triggerPrompt("What should I do next?")}
                    className="px-3 py-1 rounded text-[11px] font-mono text-brand-cyan border border-brand-cyan/20 hover:border-brand-cyan/40 bg-brand-cyan/5 transition"
                  >
                    WHAT SHOULD I DO NEXT?
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerPrompt("I finished Maths.")}
                    className="px-3 py-1 rounded text-[11px] font-mono text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 bg-emerald-500/5 transition"
                  >
                    I FINISHED MATHS.
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerPrompt("I only have 30 minutes.")}
                    className="px-3 py-1 rounded text-[11px] font-mono text-amber-400 border border-amber-500/20 hover:border-amber-500/40 bg-amber-500/5 transition"
                  >
                    I ONLY HAVE 30 MINUTES.
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerPrompt("Move DBMS to tomorrow.")}
                    className="px-3 py-1 rounded text-[11px] font-mono text-slate-400 border border-white/[0.08] hover:text-white transition"
                  >
                    MOVE DBMS TO TOMORROW
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => triggerPrompt("Plan my evening: Maths exam tomorrow and two hours tonight.")}
                    className="px-3 py-1 rounded text-[11px] font-mono text-slate-400 border border-white/[0.08] hover:text-white transition"
                  >
                    PLAN MY EVENING
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerPrompt("I'm running out of time. Urgent Physics test tomorrow and 45 minutes left.")}
                    className="px-3 py-1 rounded text-[11px] font-mono text-slate-400 border border-white/[0.08] hover:text-white transition"
                  >
                    I&apos;M RUNNING OUT OF TIME
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerPrompt("AI presentation in 3 hours. Need a focused rehearsal schedule.")}
                    className="px-3 py-1 rounded text-[11px] font-mono text-slate-400 border border-white/[0.08] hover:text-white transition"
                  >
                    PREPARE PRESENTATION
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
