import React, { useState, useEffect } from "react";
import {
  Home, Book, BookOpen, Dumbbell, CreditCard, CheckCircle,
  Film, Calendar, Brain
} from "lucide-react";

// Views
import DashboardView from "./components/DashboardView";
import DiaryView from "./components/DiaryView";
import StudyView from "./components/StudyView";
import FitnessView from "./components/FitnessView";
import FinanceView from "./components/FinanceView";
import HabitView from "./components/HabitView";
import EntertainmentView from "./components/EntertainmentView";
import CalendarView from "./components/CalendarView";
import AiAnalystView from "./components/AiAnalystView";

// SAFE DEFAULT STATE (NO BACKEND REQUIRED)
const DEFAULT_STATE = {
  lastUpdated: Date.now(),
  diary: [],
  studySessions: [],
  expenses: [],
  reminders: [],
  entertainment: []
};

export default function App() {
  const [activeView, setActiveView] = useState("dashboard");
  const [isDarkMode, setIsDarkMode] = useState(true);

  const [state, setState] = useState(DEFAULT_STATE);

  // Load from localStorage ONLY
  useEffect(() => {
    const local = localStorage.getItem("lifeos-state");
    if (local) {
      try {
        setState(JSON.parse(local));
      } catch {
        setState(DEFAULT_STATE);
      }
    }
  }, []);

  // Save state automatically
  useEffect(() => {
    localStorage.setItem("lifeos-state", JSON.stringify(state));
  }, [state]);

  // Update state safely
  const updateState = (newState: any) => {
    const updated = { ...newState, lastUpdated: Date.now() };
    setState(updated);
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "diary", label: "Journal", icon: Book },
    { id: "study", label: "Study", icon: BookOpen },
    { id: "fitness", label: "Fitness", icon: Dumbbell },
    { id: "finance", label: "Finance", icon: CreditCard },
    { id: "habits", label: "Habits", icon: CheckCircle },
    { id: "entertainment", label: "Media", icon: Film },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "ai", label: "AI", icon: Brain }
  ];

  return (
    <div className={`${isDarkMode ? "bg-slate-950 text-white" : "bg-white text-black"} min-h-screen flex`}>

      {/* SIDEBAR */}
      <aside className="w-60 bg-slate-900 p-4 hidden md:block">
        <h1 className="text-sm font-bold mb-4">Life OS</h1>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className="flex items-center gap-2 py-2 px-3 w-full hover:bg-slate-800 rounded text-sm"
            >
              <Icon size={16} />
              {item.label}
            </button>
          );
        })}
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-4">

        {activeView === "dashboard" && (
          <DashboardView state={state} updateState={updateState} />
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

      </main>
    </div>
  );
}