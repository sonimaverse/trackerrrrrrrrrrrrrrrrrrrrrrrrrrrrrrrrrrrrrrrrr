import React, { useState } from "react";
import { Plus, Trash2, Check, Play } from "lucide-react";
import { DatabaseState, Habit } from "../types";

interface HabitProps {
  state: DatabaseState;
  updateState: (newState: DatabaseState) => void;
}

export default function HabitView({ state, updateState }: HabitProps) {
  const [habitName, setHabitName] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");

  const todayStr = new Date().toISOString().split("T")[0];

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitName.trim()) return;

    const newState = { ...state };
    const id = `habit-${Date.now()}`;
    const newHabit: Habit = {
      id,
      name: habitName.trim(),
      frequency,
      isActive: true
    };

    newState.habits.push(newHabit);
    setHabitName("");
    updateState(newState);
  };

  const handleDeleteHabit = (id: string) => {
    if (!confirm("Are you sure you want to delete this habit and all its logged history?")) return;
    const newState = { ...state };
    newState.habits = newState.habits.filter(h => h.id !== id);
    newState.habitLogs = newState.habitLogs.filter(l => l.habitId !== id);
    updateState(newState);
  };

  const toggleHabitOnDate = (habitId: string) => {
    const newState = { ...state };
    const logIdx = newState.habitLogs.findIndex(l => l.habitId === habitId && l.date === todayStr);

    if (logIdx > -1) {
      newState.habitLogs[logIdx].completed = !newState.habitLogs[logIdx].completed;
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

  // Calculate streaks: Consecutive active completed logs going backward
  const calculateStreak = (habitId: string) => {
    let count = 0;
    const searchDate = new Date();
    // Go back for up to 30 days
    for (let i = 0; i < 30; i++) {
      const dateKey = searchDate.toISOString().split("T")[0];
      const isCompleted = state.habitLogs.some(l => l.habitId === habitId && l.date === dateKey && l.completed);
      if (isCompleted) {
        count++;
      } else {
        // If they missed a day, and it's not today (since they could complete today later), streak breaks
        if (dateKey !== todayStr) {
          break;
        }
      }
      searchDate.setDate(searchDate.getDate() - 1);
    }
    return count;
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Header Block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-100 to-indigo-300">Habit Streaks Tracker</h1>
          <p className="text-xs text-slate-400 mt-1">Implement micro-rewards, track daily logs, and build long-term routines</p>
        </div>
      </div>

      {/* Grid: Toggles Checker and Creator Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Habit Checklist Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <h3 className="text-sm font-semibold text-slate-201 mb-4 uppercase tracking-wider font-sans">Momentum Grid Checklist (Today)</h3>
            {state.habits.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-500 font-sans">
                You haven't added any habits to track yet. Design your targets in the right card!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {state.habits.map((habit) => {
                  const completedText = state.habitLogs.some(l => l.habitId === habit.id && l.date === todayStr && l.completed);
                  const streakNum = calculateStreak(habit.id);

                  return (
                    <div 
                      key={habit.id}
                      onClick={() => toggleHabitOnDate(habit.id)}
                      className={`p-4 border rounded-2xl flex justify-between items-center cursor-pointer select-none transition-all duration-300 ${
                        completedText 
                          ? 'bg-emerald-950/20 border-emerald-800 hover:border-emerald-700' 
                          : 'bg-slate-950/40 border-slate-850 hover:border-slate-800'
                      }`}
                    >
                      <div className="space-y-1 truncate pr-3">
                        <span className={`text-sm font-medium font-sans truncate block ${completedText ? 'text-emerald-300' : 'text-slate-300'}`}>
                          {habit.name}
                        </span>
                        <p className="text-[10px] text-slate-500 font-mono flex items-center gap-2">
                          <span className="uppercase">{habit.frequency} TRACK</span>
                          <span>•</span>
                          <span className={`${streakNum > 0 ? 'text-orange-400 font-medium' : 'text-slate-500'}`}>
                            🔥 {streakNum}d Current Streak
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <div className={`p-2 rounded-xl border flex items-center justify-center ${
                          completedText 
                            ? 'bg-emerald-600/30 border-emerald-500 text-emerald-400' 
                            : 'bg-slate-850 border-slate-800 text-slate-650'
                        }`}>
                          {completedText ? <Check className="w-4 h-4 text-emerald-400 font-bold" /> : <Play className="w-4 h-4 text-slate-400" />}
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteHabit(habit.id);
                          }}
                          className="p-1.5 text-slate-550 hover:text-rose-400 hover:bg-slate-850 rounded-lg cursor-pointer"
                          title="Delete habit"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Create Habit card */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <h3 className="text-sm font-semibold text-slate-202 mb-4 uppercase tracking-wider font-sans">Form Routine</h3>
          <form onSubmit={handleCreateHabit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 font-mono block mb-1">ROUTINE NAME</label>
              <input 
                type="text"
                required
                placeholder="E.g., Morning workout, read 10 minutes"
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-202 placeholder-slate-550 focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-mono block mb-1">LOG RATE (FREQUENCY)</label>
              <select 
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as "daily" | "weekly")}
                className="w-full bg-slate-950 border border-slate-800 text-slate-330 text-xs rounded-xl focus:border-indigo-500 p-2.5 focus:outline-none"
              >
                <option value="daily">Daily Target Checklist</option>
                <option value="weekly">Weekly Checklist Target</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-indigo-650 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl cursor-pointer border border-indigo-600 flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Save Routine Target
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
