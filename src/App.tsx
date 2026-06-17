import React, { useState, useEffect, useRef } from "react";
import { 
  Home, Book, BookOpen, Dumbbell, CreditCard, CheckCircle, Film, Calendar, Brain, 
  Search, Download, Upload, Server, X, Sun, Moon, Sparkles, ChevronRight
} from "lucide-react";
import { DatabaseState } from "./types";

// Import separate Views
import DashboardView from "./components/DashboardView";
import DiaryView from "./components/DiaryView";
import StudyView from "./components/StudyView";
import FitnessView from "./components/FitnessView";
import FinanceView from "./components/FinanceView";
import HabitView from "./components/HabitView";
import EntertainmentView from "./components/EntertainmentView";
import CalendarView from "./components/CalendarView";
import AiAnalystView from "./components/AiAnalystView";

export default function App() {
  const [activeView, setActiveView] = useState("dashboard");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global search states
  const [searchOpen, setSearchOpen] = useState(false);
  const [globalQuery, setGlobalQuery] = useState("");

  // Backup & Import modal displays
  const [backupOpen, setBackupOpen] = useState(false);
  const [jsonPaste, setJsonPaste] = useState("");

  // Base state of Life OS
  const [state, setState] = useState<DatabaseState | null>(null);
  const stateRef = useRef<DatabaseState | null>(null);

  // Synchronize state references for callbacks
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Initial Fetch of Database State
  const fetchAndSetState = async () => {
    try {
      const res = await fetch("/api/state");
      if (res.ok) {
        const clientData = await res.json();
        setState(clientData);
      }
    } catch (err) {
      console.error("Initialization sync failed:", err);
    }
  };

  useEffect(() => {
    fetchAndSetState();
  }, []);

  // Real-Time Cross-Device Sync Polling Loop (Matches "Instantly synchronized between devices" goals)
  useEffect(() => {
    const syncTimer = setInterval(async () => {
      const currentState = stateRef.current;
      if (!currentState) return;

      try {
        const checkRes = await fetch(`/api/sync-check?version=${currentState.lastUpdated}`);
        if (checkRes.ok) {
          const checkData = await checkRes.json();
          if (checkData.outOfSync && checkData.latest) {
            console.log("Device out-of-sync. Applying updates from server...");
            setState(checkData.latest);
          }
        }
      } catch (err) {
        console.error("Auto polling sync check failed:", err);
      }
    }, 2500); // 2.5 seconds loop is exceptionally responsive and highly stable

    return () => clearInterval(syncTimer);
  }, []);

  // Dynamic state update pipeline (Sends state back to server immediately on write)
  const updateState = async (newState: DatabaseState) => {
    const updatedState = { ...newState, lastUpdated: Date.now() };
    setState(updatedState); // Optimistic Update

    try {
      await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedState)
      });
    } catch (err) {
      console.error("Persistent cloud sync failure:", err);
    }
  };

  // Export JSON backups
  const handleBackupDownload = () => {
    if (!state) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `life_os_backup_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Restore state from Paste JSON text
  const handleRestoreImport = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(jsonPaste);
      if (parsed && typeof parsed === "object" && Array.isArray(parsed.diary)) {
        updateState(parsed);
        alert("Life OS Second Brain state restored successfully!");
        setJsonPaste("");
        setBackupOpen(false);
      } else {
        alert("Invalid database configuration structure. Please verify backup schema.");
      }
    } catch (err: any) {
      alert("Malformed configuration string: " + err.message);
    }
  };

  // Generate generic browser CSV string downloads
  const handleExportCSV = (table: keyof DatabaseState, list: any[], headers: string[], rowMapper: (item: any) => string[]) => {
    if (!state || list.length === 0) {
      alert(`No records in ${String(table)} logged yet.`);
      return;
    }
    const csvRows = [headers.join(",")];
    list.forEach(item => {
      const values = rowMapper(item).map(val => `"${String(val).replace(/"/g, '""')}"`);
      csvRows.push(values.join(","));
    });
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(csvRows.join("\n"));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", csvContent);
    downloadAnchor.setAttribute("download", `life_os_export_${String(table)}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDiaryCSV = () => {
    if (!state) return;
    handleExportCSV(
      "diary",
      state.diary,
      ["ID", "Date", "Mood", "Title", "Content"],
      (d) => [d.id, d.date, d.mood, d.title, d.content]
    );
  };

  const handleFinanceCSV = () => {
    if (!state) return;
    handleExportCSV(
      "expenses",
      state.expenses,
      ["ID", "Type", "Amount", "Category", "Description", "Date", "Source"],
      (e) => [e.id, e.type, String(e.amount), e.category, e.description, e.date, e.source]
    );
  };

  const mainNavItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "diary", label: "Journal Diary", icon: Book },
    { id: "study", label: "Study Eng", icon: BookOpen },
    { id: "fitness", label: "Fitness Bio", icon: Dumbbell },
    { id: "finance", label: "Finance Ledger", icon: CreditCard },
    { id: "habits", label: "Habit Streaks", icon: CheckCircle },
    { id: "entertainment", label: "Media Logs", icon: Film },
    { id: "calendar", label: "Scheduler", icon: Calendar },
    { id: "ai", label: "Aura Coach", icon: Brain }
  ];

  if (!state) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-sans space-y-4">
        <div className="relative w-12 h-12">
          <div className="absolute top-0 left-0 w-full h-full rounded-full border-t-2 border-indigo-500 animate-spin" />
        </div>
        <p className="text-xs text-indigo-400 font-mono tracking-widest uppercase animate-pulse">Initializing Shishir Bhusal's Life OS...</p>
      </div>
    );
  }

  // Handle global search matches
  const getSearchResults = () => {
    if (!globalQuery.trim()) return [];
    const q = globalQuery.toLowerCase();
    const results: { type: string; title: string; subtitle: string; targetView: string }[] = [];

    // Search diary
    state.diary.forEach(d => {
      if (d.title.toLowerCase().includes(q) || d.content.toLowerCase().includes(q)) {
        results.push({ type: "Diary Entry", title: d.title, subtitle: `${d.date} - Mood: ${d.mood}`, targetView: "diary" });
      }
    });

    // Search focus topics
    state.studySessions.forEach(s => {
      if (s.subject.toLowerCase().includes(q)) {
        results.push({ type: "Study Block", title: s.subject, subtitle: `${new Date(s.startTime).toLocaleDateString()} - Study Session`, targetView: "study" });
      }
    });

    // Search ledger expenses
    state.expenses.forEach(e => {
      if (e.description.toLowerCase().includes(q) || e.category.toLowerCase().includes(q)) {
        results.push({ type: "Financial Entry", title: `${e.type.toUpperCase()}: ${e.description}`, subtitle: `$${e.amount.toFixed(2)} [${e.category}]`, targetView: "finance" });
      }
    });

    // Search reminder cards
    state.reminders.forEach(r => {
      if (r.title.toLowerCase().includes(q)) {
        results.push({ type: "Reminders", title: r.title, subtitle: `${r.date} [Priority: ${r.priority}]`, targetView: "calendar" });
      }
    });

    // Search watchlist catalog
    state.entertainment.forEach(ent => {
      if (ent.title.toLowerCase().includes(q) || ent.review.toLowerCase().includes(q)) {
        results.push({ type: "Media Log", title: ent.title, subtitle: `${ent.status} - ★ ${ent.rating}/10`, targetView: "entertainment" });
      }
    });

    return results;
  };

  const searchResults = getSearchResults();

  return (
    <div className={`${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} min-h-screen flex flex-col md:flex-row transition-all duration-300 font-sans`}>
      
      {/* LAPTOP DESKTOP SIDEBAR - Sleek Swiss Modern Rail */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-slate-900 border-r border-slate-800 p-5 justify-between min-h-screen select-none sticky top-0">
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-2 py-1">
            <span className="p-2 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
              <Brain className="w-5 h-5" />
            </span>
            <div>
              <span className="font-bold text-slate-100 block tracking-tight font-sans text-sm">Shishir Bhusal</span>
              <span className="text-[10px] text-slate-400 font-mono uppercase block mt-0.5">LIFE OS • SECOND BRAIN</span>
            </div>
          </div>

          <div className="border-t border-slate-800/80 my-4" />

          {/* Navigation Items */}
          <nav className="space-y-1.5" id="desktop-sidebar-nav">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isSelected = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors cursor-pointer ${
                    isSelected 
                      ? 'bg-indigo-650 hover:bg-indigo-705 text-white' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" /> {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Desktop Sidebar Bottom widgets */}
        <div className="space-y-4">
          <div className="flex justify-between items-center gap-2 px-2">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl cursor-pointer"
              title="Toggle Light/Dark Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => setSearchOpen(true)}
              className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl cursor-pointer"
              title="Global System Search"
            >
              <Search className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setBackupOpen(true)}
              className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl cursor-pointer"
              title="System Import / Export backups"
            >
              <Server className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-slate-850 rounded-xl p-3 border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shrink-0" />
              <div className="truncate">
                <span className="text-[10px] uppercase font-mono tracking-wide text-emerald-400 font-semibold block">SYNCED STATE</span>
                <span className="text-[9.5px] text-slate-500 block truncate font-mono">Ver: {state.lastUpdated}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE HEADER BAR */}
      <header className="md:hidden flex items-center justify-between px-5 py-3.5 bg-slate-900 border-b border-slate-800 select-none">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <Brain className="w-4 h-4" />
          </span>
          <span className="font-bold text-slate-100 tracking-tight text-xs uppercase font-mono">Shishir Bhusal • Life OS</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setSearchOpen(true)}
            className="p-2 text-slate-400"
            title="Search"
          >
            <Search className="w-4.5 h-4.5" />
          </button>
          <button 
            onClick={() => setBackupOpen(true)}
            className="p-2 text-slate-400"
            title="Cloud Ledger File"
          >
            <Server className="w-4.5 h-4.5" />
          </button>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 text-slate-400"
            title="Theme"
          >
            {isDarkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>
        </div>
      </header>

      {/* MOBILE FLOATING ACTION MENU */}
      <div className="md:hidden fixed bottom-18 right-4 z-40">
        <button 
          onClick={() => {
            setActiveView("dashboard");
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="bg-indigo-600 hover:bg-indigo-750 text-white rounded-full p-3.5 shadow-xl flex items-center justify-center"
        >
          <Sparkles className="w-5.5 h-5.5" />
        </button>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR (Matches responsive/touchscreen rules) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900 border-t border-slate-800/80 px-2 flex justify-around items-center z-40 select-none">
        {mainNavItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isSelected = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex flex-col items-center justify-center gap-1.5 py-1 px-3 rounded-xl cursor-pointer ${
                isSelected ? 'text-[#8eaeff] font-bold' : 'text-slate-400'
              }`}
            >
              <Icon className="w-4.5 h-4.5 shrink-0" />
              <span className="text-[9px] font-sans tracking-wide block">{item.label.split(" ")[0]}</span>
            </button>
          );
        })}
        {/* Toggle secondary view drawer list for remaining categories */}
        <select
          value={activeView}
          onChange={(e) => setActiveView(e.target.value)}
          className="bg-transparent border-none text-[9px] text-slate-400 focus:outline-none focus:ring-0 cursor-pointer font-sans py-1 py-1.5 px-1 truncate w-14 max-w-16"
        >
          <option value="" disabled className="bg-slate-900">More</option>
          {mainNavItems.slice(5).map(item => (
            <option key={item.id} value={item.id} className="bg-slate-900 text-slate-200">
              {item.label}
            </option>
          ))}
        </select>
      </nav>

      {/* MASTER CENTRAL VIEWS PLATFORM */}
      <main className="flex-1 overflow-x-hidden p-4 md:p-8 pb-24 md:pb-8">
        
        {/* Render Active View component dynamically */}
        <div id="active-view-canvas">
          {activeView === "dashboard" && (
            <DashboardView state={state} updateState={updateState} triggerView={setActiveView} />
          )}
          {activeView === "diary" && (
            <DiaryView state={state} updateState={updateState} />
          )}
          {activeView === "study" && (
            <StudyView state={state} updateState={updateState} />
          )}
          {activeView === "fitness" && (
            <FitnessView state={state} updateState={updateState} />
          )}
          {activeView === "finance" && (
            <FinanceView state={state} updateState={updateState} />
          )}
          {activeView === "habits" && (
            <HabitView state={state} updateState={updateState} />
          )}
          {activeView === "entertainment" && (
            <EntertainmentView state={state} updateState={updateState} />
          )}
          {activeView === "calendar" && (
            <CalendarView state={state} updateState={updateState} />
          )}
          {activeView === "ai" && (
            <AiAnalystView state={state} />
          )}
        </div>
      </main>

      {/* GLOBAL SEARCH DIALOG OVERLAY (Matches "Global Search across all data") */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-4 pt-16 md:pt-24 select-none animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-5 shadow-2xl relative">
            <button 
              onClick={() => {
                setSearchOpen(false);
                setGlobalQuery("");
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-semibold text-slate-100 text-sm mb-4 flex items-center gap-1.5 uppercase font-mono">
              <Search className="w-4 h-4 text-indigo-400" /> Global Second-Brain Query Search
            </h3>

            <input 
              type="text"
              autoFocus
              placeholder="Search diary entries, topics, budgets, milestones..."
              value={globalQuery}
              onChange={(e) => setGlobalQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-202 placeholder-slate-550 focus:outline-none focus:border-indigo-500 font-sans mb-4"
            />

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1" id="global-search-results">
              {globalQuery.trim() === "" ? (
                <div className="text-center py-6 text-xs text-slate-500">
                  Input a query to scan your Second Brain index database.
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500">
                  No matches found for "{globalQuery}" in index data.
                </div>
              ) : (
                searchResults.map((res, i) => (
                  <div 
                    key={i}
                    onClick={() => {
                      setActiveView(res.targetView);
                      setSearchOpen(false);
                      setGlobalQuery("");
                    }}
                    className="p-2.5 bg-slate-950/60 border border-slate-850 hover:border-slate-800/80 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <span className="text-[9px] font-semibold tracking-wider font-mono uppercase bg-slate-900 py-0.5 px-2 rounded-full border border-slate-800 text-[#5c93ff]">
                        {res.type}
                      </span>
                      <h4 className="text-xs font-semibold text-slate-300 mt-1">{res.title}</h4>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{res.subtitle}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* IMPORT / EXPORT CODES BACKUP OVERLAY */}
      {backupOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-4 pt-16 select-none animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-5 shadow-2xl relative">
            <button 
              onClick={() => {
                setBackupOpen(false);
                setJsonPaste("");
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-semibold text-slate-100 text-sm mb-4 flex items-center gap-1.5 uppercase font-mono">
              <Server className="w-4 h-4 text-emerald-400" /> Database Backup & Local Export Center
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-slate-800 mb-4">
              {/* Backups Column */}
              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Backup Raw Data State</span>
                <button 
                  onClick={handleBackupDownload}
                  className="w-full py-2 px-3 bg-slate-950 hover:bg-slate-900 text-emerald-400 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-950"
                >
                  <Download className="w-3.5 h-3.5" /> Back Up JSON Database
                </button>
              </div>

              {/* CSV exports Column */}
              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Generate Spreadsheet Reports</span>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={handleDiaryCSV}
                    className="py-2 px-3 bg-slate-950 hover:bg-slate-900 text-indigo-400 font-semibold text-[10.5px] rounded-xl flex items-center justify-center gap-1 cursor-pointer border border-indigo-950"
                  >
                    <Download className="w-3.5 h-3.5 shrink-0" /> Diaries CSV
                  </button>
                  <button 
                    onClick={handleFinanceCSV}
                    className="py-2 px-3 bg-slate-950 hover:bg-slate-900 text-amber-400 font-semibold text-[10.5px] rounded-xl flex items-center justify-center gap-1 cursor-pointer border border-amber-950"
                  >
                    <Download className="w-3.5 h-3.5 shrink-0" /> ledger CSV
                  </button>
                </div>
              </div>
            </div>

            {/* Restore Column */}
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block mb-2">Import / Restore Life OS State</span>
              <form onSubmit={handleRestoreImport} className="space-y-3">
                <textarea 
                  required
                  rows={4}
                  placeholder='Paste your backup files JSON structure string code here...'
                  value={jsonPaste}
                  onChange={(e) => setJsonPaste(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-202 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                />
                <button 
                  type="submit"
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-4 h-4" /> Import and Replace Local Sync Database
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
