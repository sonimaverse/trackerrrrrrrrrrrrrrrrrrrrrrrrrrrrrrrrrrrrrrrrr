import React, { useState, useEffect } from "react";
import { Sparkles, Brain, RefreshCw, Award, CheckCircle2 } from "lucide-react";
import { DatabaseState } from "../types";

interface AnalystProps {
  state: DatabaseState;
}

export default function AiAnalystView({ state }: AnalystProps) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAiSummary = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch("/api/ai-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) {
        throw new Error("Service is currently unavailable. Please try again later.");
      }
      const data = await response.json();
      setSummary(data.summary || "Aura is quiet today.");
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Trigger on load if empty
  useEffect(() => {
    if (!summary) {
      fetchAiSummary();
    }
  }, []);

  const parseInlineBold = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) => 
      i % 2 === 1 
        ? <strong key={i} className="text-indigo-300 font-semibold">{part}</strong> 
        : part
    );
  };

  const parseMarkdown = (rawText: string) => {
    if (!rawText) return null;
    return rawText.split("\n").map((line, idx) => {
      if (line.startsWith("### ")) {
        return <h3 key={idx} className="text-sm font-semibold text-indigo-400 mt-4 mb-2 font-mono tracking-tight uppercase">{line.slice(4)}</h3>;
      }
      if (line.startsWith("## ")) {
        return <h2 key={idx} className="text-base font-bold text-slate-100 mt-5 mb-2.5 font-sans tracking-tight border-b border-slate-800 pb-1">{line.slice(3)}</h2>;
      }
      if (line.startsWith("# ")) {
        return <h1 key={idx} className="text-lg font-extrabold text-slate-50 mt-6 mb-3 font-sans tracking-tight">{line.slice(2)}</h1>;
      }
      if (line.startsWith("- ") || line.startsWith("* ")) {
        return (
          <li key={idx} className="text-xs text-slate-300 ml-4 list-disc py-1 leading-relaxed font-sans">
            {parseInlineBold(line.slice(2))}
          </li>
        );
      }
      if (line.trim() === "") {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="text-xs text-slate-300 leading-relaxed py-1 font-sans">
          {parseInlineBold(line)}
        </p>
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-100 to-indigo-300">Aura Second Brain Coach</h1>
          <p className="text-xs text-slate-400 mt-1">Acquire customized strategic feedback on focus durations, circadian cycles and diet</p>
        </div>
        <button
          onClick={fetchAiSummary}
          disabled={loading}
          className="bg-indigo-650 hover:bg-indigo-700 text-white flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> {loading ? 'Calibrated Summarization...' : 'Recalibrate Coach Summary'}
        </button>
      </div>

      {/* Grid displays */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main coach response display */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-850 rounded-2xl p-6 relative flex flex-col justify-between overflow-hidden">
          {/* Subtle decoration background */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-radial-gradient/30 opacity-15 pointer-events-none rounded-full blur-3xl" />
          
          <div>
            <div className="flex items-center gap-3 mb-5 border-b border-slate-800 pb-4">
              <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white rounded-xl shadow-lg">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-100 text-sm">Strategic Feedback</h3>
                <span className="text-[10px] text-slate-400 font-mono">AURA ENGINE RUNNING</span>
              </div>
            </div>

            {loading ? (
              <div className="py-24 text-center space-y-4">
                <div className="inline-block relative w-8 h-8">
                  <div className="absolute top-0 left-0 w-full h-full rounded-full border-t-2 border-indigo-500 animate-spin" />
                </div>
                <p className="text-xs text-indigo-400 font-mono animate-pulse">Aura is reading your Second Brain details and formatting recommendations...</p>
              </div>
            ) : errorMsg ? (
              <div className="py-12 text-center text-rose-450 border border-rose-950/45 bg-rose-950/10 rounded-xl px-4 font-sans text-xs">
                {errorMsg}
                <button
                  onClick={fetchAiSummary}
                  className="mt-4 block mx-auto px-3.5 py-1.5 text-[11px] bg-rose-900/30 border border-rose-800 text-rose-300 rounded-lg hover:bg-rose-900/50"
                >
                  Retry request
                </button>
              </div>
            ) : (
              <div className="space-y-1 prose prose-invert max-w-none" id="ai-markdown-summary-output">
                {parseMarkdown(summary || "")}
              </div>
            )}
          </div>
        </div>

        {/* Aura Coach philosophy */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <h3 className="text-slate-202 text-sm font-semibold mb-3 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-indigo-400" /> Aura's Methodology
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Unlike classical trackers that log numbers passively, Aura inspects correlations. It gauges sleep parameters against study metrics, and physical workout durations against creative logs.
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 
                <span>Correlate Sleep and Fatigue</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 
                <span>Evaluate Daily Focus Blocks</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 
                <span>Protect Capital Margins weekly</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-indigo-950/20 border border-indigo-900/20 p-5 rounded-2xl">
            <h3 className="text-indigo-300 text-sm font-semibold mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Next-Gen OS Analytics
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Log diaries, completed habits, or workouts to increase synthesis details. More variables prompt sharper recommendations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
