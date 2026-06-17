import React, { useState } from "react";
import { Search, Calendar, Smile, Trash2, Edit3, Plus, X, BookOpen } from "lucide-react";
import { DatabaseState, DiaryEntry } from "../types";

interface DiaryProps {
  state: DatabaseState;
  updateState: (newState: DatabaseState) => void;
}

export default function DiaryView({ state, updateState }: DiaryProps) {
  const [search, setSearch] = useState("");
  const [filterMood, setFilterMood] = useState<string>("All");
  
  // Create / Edit diary states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<DiaryEntry["mood"]>("Calm");
  const [customDate, setCustomDate] = useState(new Date().toISOString().split("T")[0]);

  // Mood badge styling definitions
  const moodsConfig: { [key in DiaryEntry["mood"]]: { bg: string; text: string; icon: string } } = {
    Happy: { bg: "bg-emerald-950/40 border-emerald-800", text: "text-emerald-400", icon: "😊" },
    Calm: { bg: "bg-sky-950/40 border-sky-800", text: "text-sky-400", icon: "😌" },
    Focus: { bg: "bg-indigo-950/40 border-indigo-800", text: "text-indigo-400", icon: "👁️" },
    Tired: { bg: "bg-amber-950/40 border-amber-800", text: "text-amber-400", icon: "🥱" },
    Stressed: { bg: "bg-orange-950/40 border-orange-800", text: "text-orange-400", icon: "🤯" },
    Sad: { bg: "bg-[#2a133d] border-[#5a1b8c]", text: "text-[#aa66dd]", icon: "😢" }
  };

  const handleOpenNewForm = () => {
    setTitle("");
    setContent("");
    setMood("Calm");
    setCustomDate(new Date().toISOString().split("T")[0]);
    setEditId(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (entry: DiaryEntry) => {
    setTitle(entry.title);
    setContent(entry.content);
    setMood(entry.mood);
    setCustomDate(entry.date);
    setEditId(entry.id);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this diary entry? This is irreversible.")) return;
    const newState = { ...state };
    newState.diary = newState.diary.filter(d => d.id !== id);
    updateState(newState);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newState = { ...state };
    if (editId) {
      // Edit existing entry
      newState.diary = newState.diary.map(e => {
        if (e.id === editId) {
          return {
            ...e,
            title: title.trim(),
            content: content.trim(),
            mood,
            date: customDate
          };
        }
        return e;
      });
    } else {
      // Add new entry
      const newEntry: DiaryEntry = {
        id: `diary-${Date.now()}`,
        title: title.trim(),
        content: content.trim(),
        mood,
        date: customDate,
        timestamp: Date.now()
      };
      newState.diary.unshift(newEntry);
    }

    updateState(newState);
    setIsFormOpen(false);
  };

  // Filter entries
  const filteredEntries = state.diary.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(search.toLowerCase()) || 
                          entry.content.toLowerCase().includes(search.toLowerCase()) ||
                          entry.date.includes(search);
    const matchesMood = filterMood === "All" || entry.mood === filterMood;
    return matchesSearch && matchesMood;
  });

  return (
    <div className="space-y-6">
      {/* Dynamic Header Block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-100 to-indigo-300">Journal & Diary Entry</h1>
          <p className="text-xs text-slate-400 mt-1">Reflect, trace moods and cultivate daily clarity</p>
        </div>
        <button
          onClick={handleOpenNewForm}
          className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" /> New Diary Entry
        </button>
      </div>

      {/* Entry Editor Modal / Drawer */}
      {isFormOpen && (
        <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-6 relative glow-glow animator-fade-in transition-all">
          <button 
            onClick={() => setIsFormOpen(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <h2 className="text-lg font-semibold text-slate-100 mb-4">
            {editId ? "Edit Journal Entry" : "Craft New Daily Reflection"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs text-slate-400 font-mono block mb-1">JOURNAL HEADER / TITLE</label>
                <input 
                  type="text"
                  required
                  placeholder="E.g., Overcoming hurdles with architectural refactoring"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-mono block mb-1">SELECT DATE</label>
                <input 
                  type="date"
                  required
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Mood states picker */}
            <div>
              <label className="text-xs text-slate-400 font-mono block mb-1.5">EMOTIONAL MOOD BADGE</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {(Object.keys(moodsConfig) as DiaryEntry["mood"][]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMood(m)}
                    className={`py-2 px-3 border rounded-xl text-center text-xs flex flex-col items-center justify-center gap-1 cursor-pointer transition ${
                      mood === m 
                        ? `${moodsConfig[m].bg} border-indigo-500 text-slate-100 font-semibold ring-2 ring-indigo-500/20`
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
                    }`}
                  >
                    <span className="text-lg">{moodsConfig[m].icon}</span>
                    <span>{m}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-mono block mb-1">REFLECTIVE ENTRY CONTENT</label>
              <textarea
                required
                rows={5}
                placeholder="What occurred today? Reflection on progress, state of mind, obstacles faced, or ideas developed..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-650 hover:bg-indigo-700 text-white cursor-pointer"
              >
                {editId ? "Update Reflection" : "Consolidate Journal Entry"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Searching & Filter utilities */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input 
            type="text"
            placeholder="Search entries by title, key terms or date..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs font-sans text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono uppercase">Filter Mood:</span>
          <select
            value={filterMood}
            onChange={(e) => setFilterMood(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl focus:border-indigo-500 p-2 focus:outline-none cursor-pointer"
          >
            <option value="All">All</option>
            <option value="Happy">Happy</option>
            <option value="Calm">Calm</option>
            <option value="Focus">Focus</option>
            <option value="Tired">Tired</option>
            <option value="Stressed">Stressed</option>
            <option value="Sad">Sad</option>
          </select>
        </div>
      </div>

      {/* Diary logs listing */}
      {filteredEntries.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center text-slate-500">
          <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
          <p className="text-xs">No matching journal log is found. Start capturing your days.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredEntries.map(entry => {
            const config = moodsConfig[entry.mood] || moodsConfig.Calm;
            return (
              <div 
                key={entry.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{config.icon}</span>
                    <div>
                      <h3 className="font-semibold text-slate-200 text-sm">{entry.title}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[10px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" /> {entry.date}
                        </span>
                        <span className={`text-[9px] font-mono font-semibold uppercase px-2 py-0.5 border rounded-full ${config.bg} ${config.text}`}>
                          {entry.mood}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 self-end sm:self-auto">
                    <button 
                      onClick={() => handleOpenEditForm(entry)}
                      className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg cursor-pointer"
                      title="Edit journal entry"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(entry.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg cursor-pointer"
                      title="Delete journal entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-wrap">
                  {entry.content}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
