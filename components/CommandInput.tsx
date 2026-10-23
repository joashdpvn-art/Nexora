"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Send, Sparkles, ArrowRight, CornerDownLeft, Loader2 } from "lucide-react";
import { createSpeechListener, isSpeechRecognitionSupported } from "@/lib/speech";

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
  lastQuery,
  completedCount,
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
      setSpeechError("Speech recognition is not supported in this browser. Please type your command.");
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

  const triggerQuickPrompt = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
    onSubmit(prompt);
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
      {/* Hero Header */}
      <div className="text-center mb-8 px-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-300 text-xs mb-4 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
          <span>Simulated Conversational Command Center</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-3">
          What&apos;s on your mind?
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Tell NEXORA what you&apos;re dealing with. It will turn your natural-language situation
          into your next best actions.
        </p>
      </div>

      {/* Main Command Input Box */}
      <form onSubmit={handleSubmit} className="w-full px-4 mb-6">
        <div
          className={`relative rounded-2xl glass-panel p-2 sm:p-3 transition-all duration-300 ${
            isListening
              ? "border-brand-cyan/60 shadow-glow-cyan"
              : "hover:border-white/20 focus-within:border-brand-cyan/50 focus-within:shadow-glow-cyan"
          }`}
        >
          {/* Active Listening Indicator */}
          {isListening && (
            <div className="flex items-center space-x-2 px-3 py-1.5 mb-2 bg-brand-cyan/10 border border-brand-cyan/20 rounded-lg text-brand-cyan text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-cyan opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-cyan"></span>
              </span>
              <span className="font-medium animate-pulse">Listening... Speak now</span>
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
              className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm sm:text-base p-2 sm:p-3 resize-none outline-none focus:ring-0 leading-relaxed"
              aria-label="Natural-language situation or command"
            />
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] px-2">
            <div className="flex items-center space-x-2">
              {/* Mic Button */}
              <button
                type="button"
                onClick={handleToggleSpeech}
                disabled={isProcessing}
                className={`p-2 rounded-xl transition duration-200 flex items-center justify-center ${
                  isListening
                    ? "bg-brand-cyan text-slate-950 shadow-glow-cyan animate-pulse"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.08]"
                }`}
                title={speechSupported ? "Speak your command" : "Microphone not supported in this browser"}
                aria-label={isListening ? "Stop listening" : "Start voice input"}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <span className="hidden sm:inline text-[11px] text-slate-500 font-mono">
                Press Enter ↵ to send
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="submit"
                disabled={!input.trim() || isProcessing}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium flex items-center space-x-1.5 transition duration-200 ${
                  input.trim() && !isProcessing
                    ? "bg-brand-cyan hover:bg-sky-400 text-slate-950 font-semibold shadow-glow-cyan cursor-pointer"
                    : "bg-white/[0.05] text-slate-500 cursor-not-allowed"
                }`}
                aria-label="Submit command"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Reasoning...</span>
                  </>
                ) : (
                  <>
                    <span>Execute</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
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

      {/* Demo Scenario Highlight Card */}
      <div className="w-full px-4 mb-6">
        <div className="glass-panel p-4 rounded-xl border-brand-cyan/20 bg-gradient-to-r from-brand-cyan/[0.03] to-brand-indigo/[0.03] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-semibold tracking-wider text-brand-cyan uppercase">
                  Featured Hackathon Scenario
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 font-mono">
                  Recommended
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5 line-clamp-1 italic">
                &ldquo;{DEMO_PROMPT}&rdquo;
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => triggerQuickPrompt(DEMO_PROMPT)}
            disabled={isProcessing}
            className="shrink-0 px-3.5 py-2 rounded-lg bg-white/[0.08] hover:bg-brand-cyan hover:text-slate-950 text-slate-200 text-xs font-semibold border border-white/[0.1] hover:border-brand-cyan transition duration-200 flex items-center justify-center space-x-1.5 shadow-sm"
          >
            <span>Try the demo scenario</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Suggested Follow-ups & Fast Actions */}
      <div className="w-full px-4">
        <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2.5">
          {hasExistingPlan ? "Context-Aware Follow-ups" : "Or Try Saying"}
        </p>
        <div className="flex flex-wrap gap-2">
          {hasExistingPlan ? (
            <>
              <button
                type="button"
                onClick={() => triggerQuickPrompt("What should I do next?")}
                disabled={isProcessing}
                className="px-3 py-1.5 rounded-lg text-xs glass-pill hover:bg-white/[0.1] text-brand-cyan border-brand-cyan/30 hover:border-brand-cyan transition flex items-center space-x-1.5"
              >
                <span>&ldquo;What should I do next?&rdquo;</span>
                <CornerDownLeft className="w-3 h-3 opacity-60" />
              </button>
              <button
                type="button"
                onClick={() => triggerQuickPrompt("I finished Maths.")}
                disabled={isProcessing}
                className="px-3 py-1.5 rounded-lg text-xs glass-pill hover:bg-white/[0.1] text-emerald-400 border-emerald-500/30 hover:border-emerald-400 transition flex items-center space-x-1.5"
              >
                <span>&ldquo;I finished Maths.&rdquo;</span>
                <CornerDownLeft className="w-3 h-3 opacity-60" />
              </button>
              <button
                type="button"
                onClick={() => triggerQuickPrompt("I only have 30 minutes.")}
                disabled={isProcessing}
                className="px-3 py-1.5 rounded-lg text-xs glass-pill hover:bg-white/[0.1] text-amber-400 border-amber-500/30 hover:border-amber-400 transition flex items-center space-x-1.5"
              >
                <span>&ldquo;I only have 30 minutes.&rdquo;</span>
                <CornerDownLeft className="w-3 h-3 opacity-60" />
              </button>
              <button
                type="button"
                onClick={() => triggerQuickPrompt("Move DBMS to tomorrow.")}
                disabled={isProcessing}
                className="px-3 py-1.5 rounded-lg text-xs glass-pill hover:bg-white/[0.1] text-slate-300 hover:text-white transition flex items-center space-x-1.5"
              >
                <span>&ldquo;Move DBMS to tomorrow.&rdquo;</span>
                <CornerDownLeft className="w-3 h-3 opacity-60" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() =>
                  triggerQuickPrompt(
                    "I have an AI project presentation in 3 hours and I haven't rehearsed the demo yet."
                  )
                }
                disabled={isProcessing}
                className="px-3 py-1.5 rounded-lg text-xs glass-pill hover:bg-white/[0.1] text-slate-300 hover:text-white transition"
              >
                &ldquo;AI project presentation in 3 hours...&rdquo;
              </button>
              <button
                type="button"
                onClick={() =>
                  triggerQuickPrompt(
                    "Physics test tomorrow, Chemistry notes to review, and only 90 minutes tonight."
                  )
                }
                disabled={isProcessing}
                className="px-3 py-1.5 rounded-lg text-xs glass-pill hover:bg-white/[0.1] text-slate-300 hover:text-white transition"
              >
                &ldquo;Physics test tomorrow, 90 mins tonight...&rdquo;
              </button>
              <button
                type="button"
                onClick={() => triggerQuickPrompt("I'm feeling overwhelmed. Give me a 45-minute focused reset.")}
                disabled={isProcessing}
                className="px-3 py-1.5 rounded-lg text-xs glass-pill hover:bg-white/[0.1] text-slate-300 hover:text-white transition"
              >
                &ldquo;45-minute focused reset...&rdquo;
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
