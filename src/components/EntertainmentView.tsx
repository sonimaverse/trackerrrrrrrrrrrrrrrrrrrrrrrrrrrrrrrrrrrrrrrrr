import React, { useState } from "react";
import { Plus, Trash2, Film, Tv, Book, Star, PlusCircle } from "lucide-react";
import { DatabaseState, EntertainmentLog } from "../types";

interface EntProps {
  state: DatabaseState;
  updateState: (newState: DatabaseState) => void;
}

export default function EntertainmentView({ state, updateState }: EntProps) {
  // Catalog input states
  const [title, setTitle] = useState("");
  const [type, setType] = useState<EntertainmentLog["type"]>("Movie");
  const [status, setStatus] = useState<EntertainmentLog["status"]>("Completed");
  const [rating, setRating] = useState(8);
  const [review, setReview] = useState("");

  const handleCreateEntLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newState = { ...state };
    const newLog: EntertainmentLog = {
      id: `ent-${Date.now()}`,
      title: title.trim(),
      type,
      status,
      rating: Number(rating),
      review: review.trim(),
      timestamp: Date.now()
    };

    newState.entertainment.unshift(newLog);
    setTitle("");
    setReview("");
    updateState(newState);
  };

  const handleDeleteEntLog = (id: string) => {
    if (!confirm("Are you sure you want to delete this catalog card?")) return;
    const newState = { ...state };
    newState.entertainment = newState.entertainment.filter(e => e.id !== id);
    updateState(newState);
  };

  const getTypeIcon = (eType: EntertainmentLog["type"]) => {
    switch (eType) {
      case "Movie": return <Film className="w-4 h-4 text-[#5c93ff]" />;
      case "Series": return <Tv className="w-4 h-4 text-emerald-400" />;
      case "Book": return <Book className="w-4 h-4 text-amber-400" />;
      case "Anime": return <Film className="w-4 h-4 text-pink-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Block */}
      <div>
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-100 to-indigo-300">Media, Book & Entertainment Logs</h1>
        <p className="text-xs text-slate-400 mt-1">Catalog movies, weekly series, books or anime logs with notes and ratings</p>
      </div>

      {/* Grid: Catalogue list & Log Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Media Catalogue Card Logs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <h3 className="text-sm font-semibold text-slate-201 mb-4 uppercase tracking-wider font-sans">Media Ledger Logs</h3>
            {state.entertainment.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-500 font-sans">
                You haven't cataloged any media currently. Clear your watchlist!
              </div>
            ) : (
              <div className="space-y-3">
                {state.entertainment.map((ent) => (
                  <div 
                    key={ent.id}
                    className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-805 transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center mt-1">
                        {getTypeIcon(ent.type)}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-xs font-semibold text-slate-202">{ent.title}</h4>
                          <span className="text-[10px] text-slate-500 uppercase font-mono bg-slate-900 py-0.5 px-2 rounded-full border border-slate-800">
                            {ent.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[9px] font-mono font-semibold uppercase px-2 py-0.5 rounded-full ${
                            ent.status === 'Completed' ? 'bg-emerald-950/30 text-emerald-400' : ent.status === 'Watching' ? 'bg-indigo-950/30 text-indigo-400' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {ent.status}
                          </span>
                          <span className="text-slate-700 block text-[10px] font-mono">•</span>
                          <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current text-amber-500" /> {ent.rating}/10
                          </span>
                        </div>
                        {ent.review && (
                          <p className="text-[11px] text-slate-400 mt-2 font-sans italic leading-relaxed whitespace-pre-wrap">
                            "{ent.review}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-auto">
                      <button 
                        onClick={() => handleDeleteEntLog(ent.id)}
                        className="p-1.5 text-slate-550 hover:text-rose-400 hover:bg-slate-850 rounded-lg cursor-pointer"
                        title="Delete log item"
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

        {/* Media logger card */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <h3 className="text-sm font-semibold text-slate-203 mb-4 uppercase tracking-wider font-sans">Catalogue Item</h3>
          <form onSubmit={handleCreateEntLog} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 font-mono block mb-1">MEDIA EVENT TITLE</label>
              <input 
                type="text"
                required
                placeholder="E.g., Inception, Dune Part 2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-202 placeholder-slate-550 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 font-mono block mb-1">TYPE</label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value as EntertainmentLog["type"])}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-330 text-xs rounded-xl focus:border-indigo-500 p-2.5 focus:outline-none cursor-pointer"
                >
                  <option value="Movie">Movie</option>
                  <option value="Series">TV Series</option>
                  <option value="Book">Literary Book</option>
                  <option value="Anime">Japan Anime</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-mono block mb-1">STATUS</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value as EntertainmentLog["status"])}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-330 text-xs rounded-xl focus:border-indigo-500 p-2.5 focus:outline-none cursor-pointer"
                >
                  <option value="Completed">Completed</option>
                  <option value="Watching">Active Watch</option>
                  <option value="Plan to Watch">Watchlist Queue</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-mono block mb-1">SCORE / RATING (COUNT 1-10)</label>
              <div className="flex items-center gap-3">
                <input 
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
                <span className="font-mono text-sm text-amber-400 font-bold bg-slate-950 py-1 px-3 border border-slate-800 rounded-lg shrink-0">
                  ★ {rating}/10
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-mono block mb-1">CRITIQUE / REVIEW MEMO</label>
              <textarea 
                placeholder="Write your synopsis or immediate review logs..."
                rows={4}
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-202 placeholder-slate-550 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-indigo-650 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl cursor-pointer border border-indigo-600 flex items-center justify-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" /> Save Media Review
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
