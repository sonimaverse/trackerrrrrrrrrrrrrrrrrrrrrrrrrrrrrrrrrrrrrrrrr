import React, { useState, useEffect } from "react";
import { Play, Square, Footprints, Droplet, Moon, Dumbbell, Trash2, TrendingUp } from "lucide-react";
import { DatabaseState, WorkoutSession } from "../types";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface FitnessProps {
  state: DatabaseState;
  updateState: (newState: DatabaseState) => void;
}

export default function FitnessView({ state, updateState }: FitnessProps) {
  const [workoutType, setWorkoutType] = useState("Strength Training");
  const [tickerText, setTickerText] = useState("00:00:00");
  
  // Custom manual logger inputs
  const [stepInput, setStepInput] = useState("");
  const [waterInput, setWaterInput] = useState("");
  const [sleepInput, setSleepInput] = useState("");
  const [logDate, setLogDate] = useState(new Date().toISOString().split("T")[0]);

  // Workout ticker effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.activeWorkout) {
      interval = setInterval(() => {
        const diff = Date.now() - state.activeWorkout!.startTime;
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
  }, [state.activeWorkout]);

  const toggleWorkout = () => {
    const newState = { ...state };
    if (newState.activeWorkout) {
      // STOP workout and push session
      const duration = Date.now() - newState.activeWorkout.startTime;
      const session: WorkoutSession = {
        id: `workout-${Date.now()}`,
        type: newState.activeWorkout.type,
        startTime: newState.activeWorkout.startTime,
        endTime: Date.now(),
        durationMs: duration
      };
      newState.workoutSessions.unshift(session);
      newState.activeWorkout = null;
    } else {
      // START workout
      newState.activeWorkout = {
        startTime: Date.now(),
        type: workoutType.trim() || "General Exercise"
      };
    }
    updateState(newState);
  };

  const deleteWorkout = (id: string) => {
    if (!confirm("Are you sure you want to delete this workout entry log?")) return;
    const newState = { ...state };
    newState.workoutSessions = newState.workoutSessions.filter(w => w.id !== id);
    updateState(newState);
  };

  const handleManualMetricsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newState = { ...state };

    if (stepInput.trim()) {
      const parsedSteps = parseInt(stepInput);
      if (!isNaN(parsedSteps) && parsedSteps >= 0) {
        newState.steps[logDate] = parsedSteps;
      }
    }

    if (waterInput.trim()) {
      const parsedWater = parseInt(waterInput);
      if (!isNaN(parsedWater) && parsedWater >= 0) {
        newState.waterIntake[logDate] = parsedWater;
      }
    }

    if (sleepInput.trim()) {
      const parsedSleep = parseFloat(sleepInput);
      if (!isNaN(parsedSleep) && parsedSleep >= 0 && parsedSleep <= 24) {
        newState.sleepHours[logDate] = parsedSleep;
      }
    }

    setStepInput("");
    setWaterInput("");
    setSleepInput("");
    updateState(newState);
  };

  const formatDuration = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = (mins / 60).toFixed(1);
    return `${hrs}h`;
  };

  const todayStr = new Date().toISOString().split("T")[0];

  // Render last week steps historical chart data
  const dateList = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dateList.push(d.toISOString().split("T")[0]);
  }

  const stepChartData = dateList.map(dateKey => {
    const label = new Date(dateKey).toLocaleDateString([], { weekday: 'short' });
    return {
      date: label,
      steps: state.steps[dateKey] || 0,
      water: state.waterIntake[dateKey] || 0,
      sleep: state.sleepHours[dateKey] || 0
    };
  });

  return (
    <div className="space-y-6">
      {/* Dynamic Header Block */}
      <div>
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-100 to-indigo-300">Fitness & Biometric OS</h1>
        <p className="text-xs text-slate-400 mt-1">Calibrate steps, hydration loops, circadian sleep tracking and active gym session logging</p>
      </div>

      {/* Grid: Workout Live Controller & Manual Loggers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workout session toggles */}
        <div className={`p-6 rounded-2xl border transition-all duration-300 lg:col-span-2 ${
          state.activeWorkout ? "bg-emerald-950/25 border-emerald-700 pulse-border" : "bg-slate-900 border-slate-800"
        }`}>
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-sans">Workout Activity Controller</h3>
            {state.activeWorkout && (
              <span className="bg-emerald-900/50 border border-emerald-600/30 text-emerald-400 font-mono text-[10px] uppercase font-bold py-1 px-3 rounded-full animate-pulse">
                WORKOUT ACTIVITY RUNNING
              </span>
            )}
          </div>

          <div className="flex flex-col items-center justify-center py-6">
            <span className="text-5xl md:text-6xl font-mono tracking-wider font-semibold text-slate-100">
              {tickerText}
            </span>
            <span className="text-slate-500 font-mono text-xs uppercase mt-3">STRENGTH FITNESS SESSION TIMER</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 font-mono block mb-1">CHOOSE TRAINING MODALITY (TYPE)</label>
              {state.activeWorkout ? (
                <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-emerald-300 font-medium font-sans">
                  {state.activeWorkout.type}
                </div>
              ) : (
                <input 
                  type="text"
                  placeholder="Cardio exercise, barbell bench press, fullbody circuit training..."
                  value={workoutType}
                  onChange={(e) => setWorkoutType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans"
                />
              )}
            </div>

            <button 
              onClick={toggleWorkout}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border cursor-pointer transition-all ${
                state.activeWorkout 
                  ? 'bg-rose-950/30 border-rose-800 text-rose-300 hover:bg-rose-900/40' 
                  : 'bg-emerald-600 hover:bg-emerald-700 border-emerald-500 text-white'
              }`}
            >
              {state.activeWorkout ? (
                <>
                  <Square className="w-4 h-4 fill-current" /> Stop Workout Session Lock
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" /> Initialize Workout Session Lock
                </>
              )}
            </button>
          </div>
        </div>

        {/* Manual Tracker logger */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <h3 className="text-sm font-semibold text-slate-205 mb-4 uppercase tracking-wider font-sans">Manual Daily Log</h3>
          <form onSubmit={handleManualMetricsSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 font-mono block mb-1">RECORD INTENSITY DATE</label>
              <input 
                type="date"
                required
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 font-sans flex items-center gap-1.5 mb-1">
                  <Footprints className="w-3.5 h-3.5 text-emerald-400" /> Steps Count
                </label>
                <input 
                  type="number"
                  placeholder="E.g., 10000"
                  value={stepInput}
                  onChange={(e) => setStepInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono placeholder-slate-650 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-sans flex items-center gap-1.5 mb-1">
                  <Droplet className="w-3.5 h-3.5 text-blue-400" /> Hydration Level (ml)
                </label>
                <input 
                  type="number"
                  placeholder="E.g., 2500"
                  value={waterInput}
                  onChange={(e) => setWaterInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono placeholder-slate-650 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-sans flex items-center gap-1.5 mb-1">
                  <Moon className="w-3.5 h-3.5 text-violet-400" /> Sleep Allocation (hrs)
                </label>
                <input 
                  type="number"
                  step="0.1"
                  placeholder="E.g., 7.5"
                  value={sleepInput}
                  onChange={(e) => setSleepInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono placeholder-slate-650 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 px-3 bg-slate-850 hover:bg-slate-800 text-slate-200 cursor-pointer font-semibold text-xs rounded-xl flex items-center justify-center border border-slate-800"
            >
              Log Biometric Entries
            </button>
          </form>
        </div>
      </div>

      {/* Dynamic charts and previous workout session logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step log timeline graph */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 lg:col-span-1">
          <h3 className="text-sm font-semibold text-slate-202 mb-4 uppercase tracking-wider font-sans flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Daily Steps Graph (7d)
          </h3>
          <div className="h-60 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stepChartData} margin={{ left: -25, right: 10 }}>
                <XAxis dataKey="date" stroke="#64748b" fontSize={9} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "12px" }}
                  itemStyle={{ color: "#10b981" }}
                  labelStyle={{ color: "#94a3b8" }}
                />
                <Line type="monotone" dataKey="steps" stroke="#10b981" strokeWidth={2.5} dot={{ fill: "#10b981" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Workout Session History Logs */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 uppercase tracking-wider font-sans">Gym Activity Logs</h3>
          {state.workoutSessions.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500 font-sans">
              No workout logs parsed. Complete active fitness targets to populate logs.
            </div>
          ) : (
            <div className="overflow-y-auto max-h-72 space-y-2 pr-1" id="workout-sessions-logs">
              {state.workoutSessions.map(session => (
                <div 
                  key={session.id}
                  className="bg-slate-950/60 border border-slate-850 p-3 rounded-xl flex items-center justify-between gap-3 hover:border-slate-800 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-950/30 text-emerald-400 rounded-lg border border-emerald-900/10">
                      <Dumbbell className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-202">{session.type}</h4>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {new Date(session.startTime).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        <span className="mx-1.5">•</span>
                        {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="bg-emerald-950/30 border border-emerald-900/30 text-emerald-400 font-mono text-xs px-2.5 py-1 rounded-lg">
                      {formatDuration(session.durationMs)}
                    </span>
                    <button 
                      onClick={() => deleteWorkout(session.id)}
                      className="p-1 text-slate-500 hover:text-rose-450 hover:bg-slate-800 rounded cursor-pointer"
                      title="Delete activity"
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
