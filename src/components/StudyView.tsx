import React, { useState, useEffect } from "react";
import { Play, Square, Clock, Award, BookOpen, Trash2, CheckCircle2, TrendingUp } from "lucide-react";
import { DatabaseState, StudySession } from "../types";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface StudyProps {
  state: DatabaseState;
  updateState: (newState: DatabaseState) => void;
}

export default function StudyView({ state, updateState }: StudyProps) {
  const [subject, setSubject] = useState("Software Architecture");
  const [tickerText, setTickerText] = useState("00:00:00");

  // Effect to handle clock tick
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.activeStudy) {
      interval = setInterval(() => {
        const diff = Date.now() - state.activeStudy!.startTime;
        const hrs = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTickerText(
          `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
        );
      }, 1000);
    } else {
      setTickerText("00:00:00");
    }
    return () => clearInterval(interval);
  }, [state.activeStudy]);

  const toggleStudyTimer = () => {
    const newState = { ...state };
    if (newState.activeStudy) {
      // STOP study and submit session
      const duration = Date.now() - newState.activeStudy.startTime;
      const session: StudySession = {
        id: `study-${Date.now()}`,
        subject: newState.activeStudy.subject,
        startTime: newState.activeStudy.startTime,
        endTime: Date.now(),
        durationMs: duration
      };
      newState.studySessions.unshift(session);
      newState.activeStudy = null;
    } else {
      // START study session
      newState.activeStudy = {
        startTime: Date.now(),
        subject: subject.trim() || "General Study"
      };
    }
    updateState(newState);
  };

  const deleteSession = (id: string) => {
    if (!confirm("Are you sure you want to delete this study session block?")) return;
    const newState = { ...state };
    newState.studySessions = newState.studySessions.filter(s => s.id !== id);
    updateState(newState);
  };

  const formatDuration = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = (mins / 60).toFixed(1);
    return `${hrs}h`;
  };

  // Compute analytics data for chart (Group hours by subject)
  const subjectMap: { [key: string]: number } = {};
  state.studySessions.forEach(s => {
    subjectMap[s.subject] = (subjectMap[s.subject] || 0) + (s.durationMs / 3600000);
  });

  const chartData = Object.keys(subjectMap).map(subj => ({
    name: subj.length > 15 ? subj.substring(0, 15) + "..." : subj,
    hours: parseFloat(subjectMap[subj].toFixed(1))
  })).slice(0, 6);

  // Calculate streaks (Consolidate study dates)
  const studyDates = Array.from(new Set(state.studySessions.map(s => {
    return new Date(s.startTime).toISOString().split("T")[0];
  }))).sort().reverse();

  let streak = 0;
  const todayStr = new Date().toISOString().split("T")[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  if (studyDates.includes(todayStr) || studyDates.includes(yesterdayStr)) {
    let checkDate = studyDates.includes(todayStr) ? new Date() : new Date(Date.now() - 86400000);
    
    while (true) {
      const checkStr = checkDate.toISOString().split("T")[0];
      if (studyDates.includes(checkStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate total study logged
  const totalStudyHours = (state.studySessions.reduce((acc, s) => acc + s.durationMs, 0) / 3600000).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Dynamic Header Block */}
      <div>
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-100 to-indigo-300">Study Tracker & Focus Session</h1>
        <p className="text-xs text-slate-400 mt-1">Strengthen specialized knowledge, log hours and evaluate momentum</p>
      </div>

      {/* Grid: Study Controller and Streaks / Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Live Controller */}
        <div className={`p-6 rounded-2xl border transition-all duration-300 lg:col-span-2 ${
          state.activeStudy ? "bg-indigo-950/20 border-indigo-700 pulse-border" : "bg-slate-900 border-slate-800"
        }`}>
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-sans">Active Target Clock</h3>
            {state.activeStudy && (
              <span className="bg-indigo-900/50 border border-indigo-600/30 text-indigo-400 font-mono text-[10px] uppercase font-bold py-1 px-3 rounded-full animate-pulse">
                STUDY FOCUSING CURRENTLY RUNNING
              </span>
            )}
          </div>

          <div className="flex flex-col items-center justify-center py-6">
            <span className="text-5xl md:text-6xl font-mono tracking-wider font-semibold text-slate-100">
              {tickerText}
            </span>
            <span className="text-slate-500 font-mono text-xs uppercase mt-3">TICKING SECOND-BRAIN focus ENGINE</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 font-mono block mb-1">CHOOSE FOCUS TOPIC</label>
              {state.activeStudy ? (
                <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-indigo-300 font-medium font-sans">
                  {state.activeStudy.subject}
                </div>
              ) : (
                <input 
                  type="text"
                  placeholder="Software engineering, mathematics midterm, writing essays..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
                />
              )}
            </div>

            <button 
              onClick={toggleStudyTimer}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border cursor-pointer transition-all ${
                state.activeStudy 
                  ? 'bg-rose-950/30 border-rose-800 text-rose-300 hover:bg-rose-900/40' 
                  : 'bg-indigo-650 hover:bg-indigo-700 border-indigo-600 text-white'
              }`}
            >
              {state.activeStudy ? (
                <>
                  <Square className="w-4 h-4 fill-current" /> Stop Study Session Lock
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" /> Initialize Study Session Lock
                </>
              )}
            </button>
          </div>
        </div>

        {/* Focus Streaks & Summaries card */}
        <div className="space-y-4">
          {/* Streak display */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="p-4 bg-orange-950/40 text-orange-400 border border-orange-900/20 rounded-xl">
              <Award className="w-8 h-8 fill-current" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-sans block">Daily Study Streak</span>
              <span className="font-mono text-3xl font-bold text-slate-100">{streak} Days</span>
              <p className="text-[10px] text-slate-500 mt-1 uppercase font-mono">Consolidated study streaks</p>
            </div>
          </div>

          {/* Sum Display */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="p-4 bg-indigo-950/40 text-indigo-400 border border-indigo-900/20 rounded-xl">
              <Clock className="w-8 h-8 font-bold" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-sans block">Total Learning Hours</span>
              <span className="font-mono text-3xl font-bold text-slate-100">{totalStudyHours} hrs</span>
              <p className="text-[10px] text-slate-500 mt-1 uppercase font-mono">Accumulated system sessions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Study analytics section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analytics bar chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 lg:col-span-1">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 uppercase tracking-wider font-sans flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" /> Focus Allocation (Hours)
          </h3>
          {chartData.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500">
              No analytics graphs are currently available. Log sessions first.
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={9} fontStyle="italic" />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "12px" }}
                    itemStyle={{ color: "#818cf8" }}
                    labelStyle={{ color: "#94a3b8" }}
                  />
                  <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#4f46e5" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Study Logs */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 uppercase tracking-wider font-sans">Focus Records</h3>
          {state.studySessions.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500">
              Your focus backlog is currently empty. Get to work!
            </div>
          ) : (
            <div className="overflow-y-auto max-h-72 space-y-2 pr-1" id="study-sessions-logs">
              {state.studySessions.map((session) => (
                <div 
                  key={session.id}
                  className="bg-slate-950/60 border border-slate-850 p-3 rounded-xl flex items-center justify-between gap-3 hover:border-slate-800 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-950/30 text-indigo-400 rounded-lg border border-indigo-900/10">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200">{session.subject}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(session.startTime).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-slate-600 block text-[10px] font-mono">•</span>
                        <span className="text-[10px] text-indigo-400 font-mono">
                          {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="bg-indigo-900/20 text-[#8eaeff] border border-blue-900/30 font-mono text-xs px-2.5 py-1 rounded-lg">
                      {formatDuration(session.durationMs)}
                    </span>
                    <button 
                      onClick={() => deleteSession(session.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded cursor-pointer"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
