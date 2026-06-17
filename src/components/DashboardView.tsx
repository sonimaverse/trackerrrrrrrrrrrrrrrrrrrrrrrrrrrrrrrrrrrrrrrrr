import React, { useState, useEffect } from "react";
import { 
  Play, Square, Plus, Droplet, Footprints, Moon, CreditCard, 
  CheckCircle, BookOpen, Dumbbell, Zap, TrendingUp, Focus, Timer
} from "lucide-react";
import { DatabaseState, Habit } from "../types";

interface DashboardProps {
  state: DatabaseState;
  updateState: (newState: DatabaseState) => void;
  triggerView: (view: string) => void;
}

export default function DashboardView({ state, updateState, triggerView }: DashboardProps) {
  const [time, setTime] = useState(new Date());
  
  // Quick-add modal or inline states
  const [quickTask, setQuickTask] = useState("");
  const [quickExpAmount, setQuickExpAmount] = useState("");
  const [quickExpCat, setQuickExpCat] = useState("Food");
  const [quickExpDesc, setQuickExpDesc] = useState("");
  const [quickSubject, setQuickSubject] = useState("Coding");
  const [quickWorkout, setQuickWorkout] = useState("Cardio");

  // Running session timer tickers
  const [studyElapsed, setStudyElapsed] = useState("");
  const [workoutElapsed, setWorkoutElapsed] = useState("");
  const [productivityElapsed, setProductivityElapsed] = useState("");

  // Clock effect
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Timers ticking code
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      if (state.activeStudy) {
        const diff = now - state.activeStudy.startTime;
        const hrs = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setStudyElapsed(`${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`);
      } else {
        setStudyElapsed("");
      }

      if (state.activeWorkout) {
        const diff = now - state.activeWorkout.startTime;
        const hrs = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setWorkoutElapsed(`${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`);
      } else {
        setWorkoutElapsed("");
      }

      if (state.activeProductivity) {
        const diff = now - state.activeProductivity.startTime;
        const hrs = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setProductivityElapsed(`${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`);
      } else {
        setProductivityElapsed("");
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [state.activeStudy, state.activeWorkout, state.activeProductivity]);

  const todayStr = new Date().toISOString().split("T")[0];

  // Calculated Stats
  const todaySteps = state.steps[todayStr] || 0;
  const todayWater = state.waterIntake[todayStr] || 0;
  const todaySleep = state.sleepHours[todayStr] || 0;

  const todayStudyMs = state.studySessions
    .filter(s => new Date(s.startTime).toISOString().startsWith(todayStr))
    .reduce((sum, s) => sum + s.durationMs, 0);
  const studyHours = (todayStudyMs / 3600000).toFixed(1);

  const walletTotal = state.walletBalance;
  const bankTotal = state.bankBalance;

  // Toggle active study session
  const toggleStudy = () => {
    const newState = { ...state };
    if (newState.activeStudy) {
      // STOP study
      const session = {
        id: `study-${Date.now()}`,
        subject: newState.activeStudy.subject,
        startTime: newState.activeStudy.startTime,
        endTime: Date.now(),
        durationMs: Date.now() - newState.activeStudy.startTime
      };
      newState.studySessions.unshift(session);
      newState.activeStudy = null;
    } else {
      // START study
      newState.activeStudy = {
        startTime: Date.now(),
        subject: quickSubject || "General Study"
      };
    }
    updateState(newState);
  };

  // Toggle productivity mode session
  const toggleProductivity = () => {
    const newState = { ...state };
    if (newState.activeProductivity) {
      // STOP productivity mode
      const session = {
        id: `prod-${Date.now()}`,
        startTime: newState.activeProductivity.startTime,
        endTime: Date.now(),
        durationMs: Date.now() - newState.activeProductivity.startTime
      };
      newState.productivitySessions.unshift(session);
      newState.activeProductivity = null;
      newState.productivityMode = false;
    } else {
      // START productivity mode
      newState.activeProductivity = {
        startTime: Date.now()
      };
      newState.productivityMode = true;
    }
    updateState(newState);
  };

  // Toggle active workout session
  const toggleWorkout = () => {
    const newState = { ...state };
    if (newState.activeWorkout) {
      // STOP workout
      const session = {
        id: `workout-${Date.now()}`,
        type: newState.activeWorkout.type,
        startTime: newState.activeWorkout.startTime,
        endTime: Date.now(),
        durationMs: Date.now() - newState.activeWorkout.startTime
      };
      newState.workoutSessions.unshift(session);
      newState.activeWorkout = null;
    } else {
      // START workout
      newState.activeWorkout = {
        startTime: Date.now(),
        type: quickWorkout || "General Training"
      };
    }
    updateState(newState);
  };

  // Toggle dynamic habit log complete for today
  const toggleHabitToday = (habitId: string) => {
    const newState = { ...state };
    const existingIndex = newState.habitLogs.findIndex(l => l.habitId === habitId && l.date === todayStr);
    
    if (existingIndex > -1) {
      newState.habitLogs[existingIndex].completed = !newState.habitLogs[existingIndex].completed;
    } else {
      newState.habitLogs.push({
        id: `hl-${Date.now()}`,
        habitId,
        date: todayStr,
        completed: true
      });
    }
    updateState(newState);
  };

  // Quick increments
  const addWater = (amountMs: number) => {
    const newState = { ...state };
    newState.waterIntake[todayStr] = (newState.waterIntake[todayStr] || 0) + amountMs;
    updateState(newState);
  };

  const addSteps = (stepCount: number) => {
    const newState = { ...state };
    newState.steps[todayStr] = (newState.steps[todayStr] || 0) + stepCount;
    updateState(newState);
  };

  const addSleep = (hours: number) => {
    const newState = { ...state };
    newState.sleepHours[todayStr] = +(Math.min(24, (newState.sleepHours[todayStr] || 0) + hours)).toFixed(1);
    updateState(newState);
  };

  const handleAddQuickTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTask.trim()) return;
    const newState = { ...state };
    newState.reminders.push({
      id: `rem-${Date.now()}`,
      title: quickTask.trim(),
      type: "task",
      date: todayStr,
      completed: false,
      priority: "medium"
    });
    setQuickTask("");
    updateState(newState);
  };

  const handleAddQuickExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(quickExpAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;
    const newState = { ...state };
    
    newState.expenses.unshift({
      id: `exp-${Date.now()}`,
      type: "expense",
      amount: amountNum,
      category: quickExpCat,
      description: quickExpDesc || `Quick ${quickExpCat}`,
      date: todayStr,
      source: "wallet",
      timestamp: Date.now()
    });

    newState.walletBalance = +(newState.walletBalance - amountNum).toFixed(2);
    setQuickExpAmount("");
    setQuickExpDesc("");
    updateState(newState);
  };

  const formatTimeStr = (t: Date) => {
    return t.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
  };

  const formatDateStr = (t: Date) => {
    return t.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Filter today's reminders
  const todaysReminders = state.reminders.filter(r => r.date === todayStr);

  return (
    <div className="space-y-6" id="dashboard-container">
      {/* Dynamic Header Banner with Time & Date */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 glow-glow transition-all">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#5c93ff] font-semibold bg-blue-950/50 px-2.5 py-1 rounded-full">SYSTEM HEALTH: SYNCHRONIZED</span>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight mt-3 mb-1">
            Welcome back, Shishir
          </h1>
          <p className="text-slate-400 text-sm font-sans">{formatDateStr(time)}</p>
        </div>
        <div className="flex flex-col items-end justify-center">
          <div className="font-mono text-3xl font-medium tracking-tight text-[#5c93ff]" id="global-digital-clock">
            {formatTimeStr(time)}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono uppercase">UTC SECOND-BRAIN STATE</div>
        </div>
      </div>

      {/* CORE TIMER ON/OFF TRACKS (STRENGTH / STUDY / PRODUCTIVITY ENGINES) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Study Engine ON/OFF Toggle */}
        <div className={`p-6 rounded-2xl border transition-all duration-300 ${state.activeStudy ? 'bg-indigo-950/20 border-indigo-700 pulse-border' : 'bg-slate-900 border-slate-800'}`}>
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${state.activeStudy ? 'bg-indigo-900/50 text-indigo-400' : 'bg-slate-800 text-slate-400'}`}>
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-200">Study Engine</h2>
                <p className="text-xs text-slate-400">Track and lock focus sessions</p>
              </div>
            </div>
            {state.activeStudy && (
              <span className="animate-pulse flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
            )}
          </div>

          <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/80 mb-4 text-center">
            {state.activeStudy ? (
              <div>
                <span className="text-xs text-indigo-400 font-mono tracking-wider uppercase block">CURRENT SESSION: {state.activeStudy.subject}</span>
                <span className="text-4xl font-mono font-medium text-slate-100 mt-1 block">{studyElapsed || "00:00:00"}</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <input 
                  type="text" 
                  value={quickSubject}
                  onChange={(e) => setQuickSubject(e.target.value)}
                  placeholder="Subject / Topic (e.g., Coding)"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-sans text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}
          </div>

          <button 
            onClick={toggleStudy}
            className={`w-full py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 border cursor-pointer transition-all ${
              state.activeStudy 
                ? 'bg-rose-950/30 border-rose-800 text-rose-300 hover:bg-rose-900/40' 
                : 'bg-indigo-650 hover:bg-indigo-700 border-indigo-600 text-white'
            }`}
          >
            {state.activeStudy ? (
              <>
                <Square className="w-4 h-4 fill-current" /> Stop Study Session
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" /> Start Study Session
              </>
            )}
          </button>
        </div>

        {/* Workout Engine ON/OFF Toggle */}
        <div className={`p-6 rounded-2xl border transition-all duration-300 ${state.activeWorkout ? 'bg-emerald-950/20 border-emerald-700 pulse-border' : 'bg-slate-900 border-slate-800'}`}>
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${state.activeWorkout ? 'bg-emerald-900/50 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                <Dumbbell className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-200">Workout Session</h2>
                <p className="text-xs text-slate-400">Log fitness and activity metrics</p>
              </div>
            </div>
            {state.activeWorkout && (
              <span className="animate-pulse flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </div>

          <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/80 mb-4 text-center">
            {state.activeWorkout ? (
              <div>
                <span className="text-xs text-emerald-400 font-mono tracking-wider uppercase block">ACTIVE LOAD: {state.activeWorkout.type}</span>
                <span className="text-4xl font-mono font-medium text-slate-100 mt-1 block">{workoutElapsed || "00:00:00"}</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <input 
                  type="text" 
                  value={quickWorkout}
                  onChange={(e) => setQuickWorkout(e.target.value)}
                  placeholder="Workout Type (e.g., Strength)"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-sans text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}
          </div>

          <button 
            onClick={toggleWorkout}
            className={`w-full py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 border cursor-pointer transition-all ${
              state.activeWorkout 
                ? 'bg-rose-950/30 border-rose-800 text-rose-300 hover:bg-rose-900/40' 
                : 'bg-emerald-600 hover:bg-emerald-700 border-emerald-500 text-white'
            }`}
          >
            {state.activeWorkout ? (
              <>
                <Square className="w-4 h-4 fill-current" /> Stop Workout Session
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" /> Start Workout Session
              </>
            )}
          </button>
        </div>

        {/* Productivity Mode ON/OFF Toggle */}
        <div className={`p-6 rounded-2xl border transition-all duration-300 ${state.activeProductivity ? 'bg-amber-950/20 border-amber-700 pulse-border' : 'bg-slate-900 border-slate-800'}`}>
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${state.activeProductivity ? 'bg-amber-900/50 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                <Focus className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-200">Productivity Mode</h2>
                <p className="text-xs text-slate-400">Deep focus & flow state tracker</p>
              </div>
            </div>
            {state.activeProductivity && (
              <span className="animate-pulse flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
            )}
          </div>

          <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/80 mb-4 text-center">
            {state.activeProductivity ? (
              <div>
                <span className="text-xs text-amber-400 font-mono tracking-wider uppercase block">FOCUS MODE ACTIVE</span>
                <span className="text-4xl font-mono font-medium text-slate-100 mt-1 block">{productivityElapsed || "00:00:00"}</span>
              </div>
            ) : (
              <div className="py-3">
                <Timer className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <span className="text-xs text-slate-500 font-sans block">Toggle ON to enter deep focus mode</span>
              </div>
            )}
          </div>

          <button 
            onClick={toggleProductivity}
            className={`w-full py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 border cursor-pointer transition-all ${
              state.activeProductivity 
                ? 'bg-rose-950/30 border-rose-800 text-rose-300 hover:bg-rose-900/40' 
                : 'bg-amber-600 hover:bg-amber-700 border-amber-500 text-white'
            }`}
          >
            {state.activeProductivity ? (
              <>
                <Square className="w-4 h-4 fill-current" /> End Focus Session
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" /> Activate Focus Mode
              </>
            )}
          </button>
        </div>
      </div>

      {/* QUICK STATUS DASHBOARD METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Study Hours Card */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition" onClick={() => triggerView("study")}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-400 font-sans">Study Hours</span>
            <BookOpen className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <span className="font-mono text-2xl font-bold text-slate-100">{studyHours}</span>
            <span className="text-[10px] text-slate-500 block mt-1 font-mono">TODAY'S SUM</span>
          </div>
        </div>

        {/* Steps Card */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition" onClick={() => triggerView("fitness")}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-400 font-sans">Steps Taken</span>
            <Footprints className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <span className="font-mono text-2xl font-bold text-slate-100">{todaySteps.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500 block mt-1 font-mono">{(todaySteps * 0.00075).toFixed(2)} KM WALKED</span>
          </div>
        </div>

        {/* Hydration Card */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition" onClick={() => triggerView("fitness")}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-400 font-sans">Hydration</span>
            <Droplet className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <span className="font-mono text-2xl font-bold text-slate-100">{todayWater}</span>
            <span className="text-slate-400 text-xs font-mono ml-0.5">ml</span>
            <span className="text-[10px] text-slate-500 block mt-1 font-mono">{(todayWater / 250).toFixed(0)} / 12 GLASSES</span>
          </div>
        </div>

        {/* Sleep Card */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition" onClick={() => triggerView("fitness")}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-400 font-sans">Sleep Session</span>
            <Moon className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <span className="font-mono text-2xl font-bold text-slate-100">{todaySleep}</span>
            <span className="text-slate-400 text-xs font-mono ml-0.5">hrs</span>
            <span className="text-[10px] text-slate-500 block mt-1 font-mono">8h RECOMMENDED TARGET</span>
          </div>
        </div>
      </div>

      {/* QUICK ADDS & INLINE CAPTURE CONTROLS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Metric Multi-Adder */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <h3 className="text-slate-200 text-sm font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" /> Increment Health Counters
          </h3>
          <div className="space-y-4">
            {/* Water adds */}
            <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
              <span className="text-xs text-slate-300 font-sans">Logging Hydration</span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => addWater(250)} className="px-2.5 py-1 text-[10px] font-mono text-[#5c93ff] bg-blue-950/40 rounded border border-blue-900/30 hover:bg-blue-900/50 cursor-pointer">+250ml</button>
                <button onClick={() => addWater(500)} className="px-2.5 py-1 text-[10px] font-mono text-[#5c93ff] bg-blue-950/40 rounded border border-blue-900/30 hover:bg-blue-900/50 cursor-pointer">+500ml</button>
              </div>
            </div>

            {/* Step logs */}
            <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
              <span className="text-xs text-slate-300 font-sans">Movement Walker</span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => addSteps(1000)} className="px-2.5 py-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 rounded border border-emerald-900/30 hover:bg-emerald-900/50 cursor-pointer">+1k</button>
                <button onClick={() => addSteps(5000)} className="px-2.5 py-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 rounded border border-emerald-900/30 hover:bg-emerald-900/50 cursor-pointer">+5k</button>
              </div>
            </div>

            {/* Sleep logs */}
            <div className="flex justify-between items-center py-2">
              <span className="text-xs text-slate-300 font-sans">Sleep Log</span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => addSleep(0.5)} className="px-2.5 py-1 text-[10px] font-mono text-violet-400 bg-violet-950/40 rounded border border-violet-900/30 hover:bg-violet-900/50 cursor-pointer">+0.5 hrs</button>
                <button onClick={() => addSleep(1.0)} className="px-2.5 py-1 text-[10px] font-mono text-violet-400 bg-violet-950/40 rounded border border-violet-900/30 hover:bg-violet-900/50 cursor-pointer">+1 hr</button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Task Capture */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <h3 className="text-slate-200 text-sm font-semibold mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-indigo-400" /> Quick Add Goals
          </h3>
          <form onSubmit={handleAddQuickTask} className="space-y-4">
            <input 
              type="text" 
              value={quickTask}
              onChange={(e) => setQuickTask(e.target.value)}
              placeholder="What do we need to log next?"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <button 
              type="submit"
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer px-4 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Save Target Reminder
            </button>
          </form>
        </div>

        {/* Quick Finance Expense */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <h3 className="text-slate-200 text-sm font-semibold mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-amber-400" /> Ledger Entry Expense
          </h3>
          <form onSubmit={handleAddQuickExpense} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <input 
                type="number" 
                step="0.01"
                required
                value={quickExpAmount}
                onChange={(e) => setQuickExpAmount(e.target.value)}
                placeholder="Amount ($)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-sm font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <select 
                value={quickExpCat}
                onChange={(e) => setQuickExpCat(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-xl focus:border-amber-500 p-1.5 focus:outline-none"
              >
                <option value="Food">Food</option>
                <option value="Transport">Transport</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Utilities">Utilities</option>
                <option value="Shopping">Shopping</option>
              </select>
            </div>
            <input 
              type="text" 
              value={quickExpDesc}
              onChange={(e) => setQuickExpDesc(e.target.value)}
              placeholder="Description (e.g. coffee)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <button 
              type="submit"
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer px-4 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Book-in Wallet Expense
            </button>
          </form>
        </div>
      </div>

      {/* COMPACT TODAY'S TASK AGENDA & DAILY HABITS PROGRESS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Agenda */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-slate-200 text-sm">Today's Agenda Goals ({todaysReminders.length})</h3>
            <button onClick={() => triggerView("calendar")} className="text-xs text-[#5c93ff] hover:underline">View Calendar</button>
          </div>
          {todaysReminders.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs">
              All targets clear for today! Add high-priority tasks to get started.
            </div>
          ) : (
            <div className="space-y-2">
              {todaysReminders.map(rem => (
                <div 
                  key={rem.id}
                  className={`flex justify-between items-center p-3 rounded-xl border ${
                    rem.completed ? 'bg-slate-950/20 border-slate-800/50 opacity-60' : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox"
                      checked={rem.completed}
                      onChange={() => {
                        const newState = { ...state };
                        const idx = newState.reminders.findIndex(r => r.id === rem.id);
                        if (idx > -1) {
                          newState.reminders[idx].completed = !newState.reminders[idx].completed;
                        }
                        updateState(newState);
                      }}
                      className="rounded border-slate-800 text-indigo-500 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className={`text-slate-200 text-xs font-sans ${rem.completed ? 'line-through text-slate-500' : ''}`}>
                        {rem.title}
                      </span>
                      {rem.time && <span className="ml-2 font-mono text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">{rem.time}</span>}
                    </div>
                  </div>
                  <div>
                    <span className={`text-[9px] font-mono uppercase font-semibold px-2 py-0.5 rounded-full ${
                      rem.priority === 'high' ? 'bg-rose-950/40 text-rose-300' : rem.priority === 'medium' ? 'bg-amber-950/40 text-amber-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {rem.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Habits Checklist for Today */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-slate-200 text-sm">Habit Streaks Tracker</h3>
            <button onClick={() => triggerView("habits")} className="text-xs text-[#5c93ff] hover:underline">Manage Habits</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {state.habits.map(habit => {
              const completedTextToday = state.habitLogs.some(l => l.habitId === habit.id && l.date === todayStr && l.completed);
              
              // Calculate simple score
              const completedCount = state.habitLogs.filter(l => l.habitId === habit.id && l.completed).length;

              return (
                <div 
                  key={habit.id}
                  onClick={() => toggleHabitToday(habit.id)}
                  className={`flex justify-between items-center p-3 rounded-xl border transition-all cursor-pointer ${
                    completedTextToday
                      ? 'bg-emerald-950/15 border-emerald-900 hover:border-emerald-800'
                      : 'bg-slate-950/30 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="truncate pr-2">
                    <span className={`text-xs block font-sans truncate ${completedTextToday ? 'text-emerald-300 font-medium' : 'text-slate-300'}`}>
                      {habit.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Completed: {completedCount}x</span>
                  </div>
                  <div className={`p-1.5 rounded-lg border ${
                    completedTextToday ? 'bg-emerald-800/20 border-emerald-500/50 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-600'
                  }`}>
                    {completedTextToday ? <Zap className="w-4 h-4 fill-current animate-bounce" /> : <Play className="w-4 h-4" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
