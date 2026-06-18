import React, { useState } from "react";
import { Trash2, Calendar, Clock, PlusCircle } from "lucide-react";
import { DatabaseState, Reminder } from "../types";

interface CalendarProps {
  state: DatabaseState;
  updateState: (newState: DatabaseState) => void;
}

export default function CalendarView({ state, updateState }: CalendarProps) {
  // SAFE DATA (IMPORTANT FIX)
  const reminders = state?.reminders ?? [];

  // Input states
  const [title, setTitle] = useState("");
  const [type, setType] = useState<Reminder["type"]>("task");
  const [priority, setPriority] = useState<Reminder["priority"]>("medium");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("");

  // CREATE
  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newRem: Reminder = {
      id: `rem-${Date.now()}`,
      title: title.trim(),
      type,
      priority,
      date,
      time: time.trim() || undefined,
      completed: false
    };

    const newState = {
      ...state,
      reminders: [...reminders, newRem]
    };

    setTitle("");
    setTime("");
    updateState(newState);
  };

  // TOGGLE
  const toggleReminderComplete = (id: string) => {
    const updated = reminders.map((r) =>
      r.id === id ? { ...r, completed: !r.completed } : r
    );

    updateState({
      ...state,
      reminders: updated
    });
  };

  // DELETE
  const handleDeleteReminder = (id: string) => {
    if (!confirm("Delete this reminder?")) return;

    const filtered = reminders.filter((r) => r.id !== id);

    updateState({
      ...state,
      reminders: filtered
    });
  };

  // COLORS
  const getPriorityColor = (p: Reminder["priority"]) => {
    switch (p) {
      case "high":
        return "bg-rose-950/30 border-rose-800 text-rose-300";
      case "medium":
        return "bg-amber-950/30 border-amber-800 text-amber-300";
      default:
        return "bg-slate-800 text-slate-400";
    }
  };

  const getTypeBadge = (t: Reminder["type"]) => {
    switch (t) {
      case "task":
        return "bg-indigo-950/20 text-blue-300 border border-blue-900/30";
      case "exam":
        return "bg-rose-950/20 text-rose-300 border border-rose-900/30";
      case "event":
        return "bg-emerald-950/20 text-emerald-300 border border-emerald-900/30";
      default:
        return "";
    }
  };

  // SORT SAFE
  const sortedReminders = [...reminders].sort((a, b) => {
    const d = a.date.localeCompare(b.date);
    if (d !== 0) return d;
    return (a.time || "").localeCompare(b.time || "");
  });

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Agenda & Calendar
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage tasks, exams and events safely
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LIST */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-4 rounded-xl">

          <h3 className="text-sm font-semibold mb-3 text-slate-300">
            Reminders
          </h3>

          {sortedReminders.length === 0 ? (
            <p className="text-xs text-slate-500">
              No reminders yet
            </p>
          ) : (
            <div className="space-y-2">
              {sortedReminders.map((rem) => (
                <div
                  key={rem.id}
                  className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800"
                >

                  <div>
                    <p className={`text-sm ${rem.completed ? "line-through text-slate-500" : ""}`}>
                      {rem.title}
                    </p>

                    <div className="flex gap-2 text-[10px] text-slate-400 mt-1">
                      <span><Calendar className="inline w-3 h-3" /> {rem.date}</span>
                      {rem.time && (
                        <span><Clock className="inline w-3 h-3" /> {rem.time}</span>
                      )}
                      <span className={getTypeBadge(rem.type)}>
                        {rem.type}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 items-center">

                    <button
                      onClick={() => toggleReminderComplete(rem.id)}
                      className="text-xs text-blue-400"
                    >
                      ✓
                    </button>

                    <button
                      onClick={() => handleDeleteReminder(rem.id)}
                      className="text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FORM */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">

          <h3 className="text-sm font-semibold mb-3 text-slate-300">
            Add Reminder
          </h3>

          <form onSubmit={handleCreateReminder} className="space-y-3">

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-sm"
            />

            <select
              value={type}
              onChange={(e) => setType(e.target.value as Reminder["type"])}
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-sm"
            >
              <option value="task">Task</option>
              <option value="exam">Exam</option>
              <option value="event">Event</option>
            </select>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Reminder["priority"])}
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-sm"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-sm"
            />

            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-sm"
            />

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 p-2 rounded text-white text-sm flex items-center justify-center gap-2"
            >
              <PlusCircle size={16} /> Add
            </button>

          </form>
        </div>

      </div>
    </div>
  );
}