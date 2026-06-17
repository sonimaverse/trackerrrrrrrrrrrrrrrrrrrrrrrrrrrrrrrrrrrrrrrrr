import React, { useState } from "react";
import { Trash2, Calendar, Clock, PlusCircle } from "lucide-react";
import { DatabaseState, Reminder } from "../types";

interface CalendarProps {
  state: DatabaseState;
  updateState: (newState: DatabaseState) => void;
}

export default function CalendarView({ state, updateState }: CalendarProps) {
  // Reminder adding states
  const [title, setTitle] = useState("");
  const [type, setType] = useState<Reminder["type"]>("task");
  const [priority, setPriority] = useState<Reminder["priority"]>("medium");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("");

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newState = { ...state };
    const newRem: Reminder = {
      id: `rem-${Date.now()}`,
      title: title.trim(),
      type,
      priority,
      date,
      time: time.trim() || undefined,
      completed: false
    };

    newState.reminders.push(newRem);
    setTitle("");
    setTime("");
    updateState(newState);
  };

  const toggleReminderComplete = (id: string) => {
    const newState = { ...state };
    const idx = newState.reminders.findIndex(r => r.id === id);
    if (idx > -1) {
      newState.reminders[idx].completed = !newState.reminders[idx].completed;
    }
    updateState(newState);
  };

  const handleDeleteReminder = (id: string) => {
    if (!confirm("Are you sure you want to delete this reminder event?")) return;
    const newState = { ...state };
    newState.reminders = newState.reminders.filter(r => r.id !== id);
    updateState(newState);
  };

  const getPriorityColor = (p: Reminder["priority"]) => {
    switch (p) {
      case "high": return "bg-rose-950/30 border-rose-800 text-rose-300";
      case "medium": return "bg-amber-950/30 border-amber-800 text-amber-300";
      case "low": return "bg-slate-800 text-slate-400";
    }
  };

  const getTypeBadge = (t: Reminder["type"]) => {
    switch (t) {
      case "task": return "bg-indigo-950/20 text-[#5c93ff] border border-blue-900/30";
      case "exam": return "bg-rose-950/20 text-rose-300 border border-rose-900/30";
      case "event": return "bg-emerald-950/20 text-emerald-300 border border-emerald-900/30";
    }
  };

  // Sort reminders chronologically
  const sortedReminders = [...state.reminders].sort((a, b) => {
    const dateComparison = a.date.localeCompare(b.date);
    if (dateComparison !== 0) return dateComparison;
    return (a.time || "").localeCompare(b.time || "");
  });

  return (
    <div className="space-y-6">
      {/* Header Block */}
      <div>
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-100 to-indigo-300">Agenda, Milestone & Task Scheduler</h1>
        <p className="text-xs text-slate-400 mt-1">Configure study deadlines, exam milestones, lifestyle goals and upcoming meetings</p>
      </div>

      {/* Grid: Agenda logs & log form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agenda Events Ledger */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <h3 className="text-sm font-semibold text-slate-201 mb-4 uppercase tracking-wider font-sans">Milestone Agenda</h3>
            {sortedReminders.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-500 font-sans">
                No scheduled milestones in agenda. Keep targets clear!
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1" id="calendar-reminders-list">
                {sortedReminders.map((rem) => (
                  <div 
                    key={rem.id}
                    className={`p-3.5 border rounded-xl flex items-center justify-between gap-4 transition-all ${
                      rem.completed 
                        ? 'bg-slate-950/20 border-slate-900 opacity-55' 
                        : 'bg-slate-950/50 border-slate-850 hover:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <input 
                        type="checkbox"
                        checked={rem.completed}
                        onChange={() => toggleReminderComplete(rem.id)}
                        className="rounded border-slate-800 text-indigo-500 focus:ring-slate-800 w-4.5 h-4.5 cursor-pointer shrink-0"
                      />
                      <div className="truncate">
                        <span className={`text-xs block font-sans truncate text-slate-202 ${rem.completed ? 'line-through text-slate-500' : ''}`}>
                          {rem.title}
                        </span>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-[9.5px] font-mono text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-500" /> {rem.date}
                          </span>
                          {rem.time && (
                            <span className="text-[9.5px] font-mono text-[#5c93ff] bg-blue-950/40 px-1.5 py-0.5 rounded border border-blue-900/10 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {rem.time}
                            </span>
                          )}
                          <span className={`text-[9px] font-mono font-semibold uppercase px-2 py-0.5 rounded border ${getTypeBadge(rem.type)}`}>
                            {rem.type}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-[9px] font-mono font-semibold uppercase px-2 py-0.5 border rounded-full ${getPriorityColor(rem.priority)}`}>
                        {rem.priority}
                      </span>
                      <button 
                        onClick={() => handleDeleteReminder(rem.id)}
                        className="p-1 text-slate-550 hover:text-rose-400 hover:bg-slate-850 rounded cursor-pointer"
                        title="Delete agenda task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create Milestone Event Form */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <h3 className="text-sm font-semibold text-slate-205 mb-4 uppercase tracking-wider font-sans">Book Event Milestone</h3>
          <form onSubmit={handleCreateReminder} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 font-mono block mb-1">EVENT / MILESTONE TITLE</label>
              <input 
                type="text"
                required
                placeholder="E.g., Complete backend draft design"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-202 placeholder-slate-550 focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 font-mono block mb-1">CATEGORY</label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value as Reminder["type"])}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-330 text-xs rounded-xl focus:border-indigo-500 p-2.5 focus:outline-none cursor-pointer"
                >
                  <option value="task">General Task</option>
                  <option value="exam">Mid/Final Exam</option>
                  <option value="event">Calendar Event</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-mono block mb-1">PRIORITY</label>
                <select 
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Reminder["priority"])}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-330 text-xs rounded-xl focus:border-indigo-500 p-2.5 focus:outline-none cursor-pointer"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 font-mono block mb-1">DATE SCHEDULER</label>
                <input 
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-202 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-mono block mb-1">TIME (OPTIONAL)</label>
                <input 
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-202 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-indigo-650 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl cursor-pointer border border-indigo-600 flex items-center justify-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" /> Save Agenda Event
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
