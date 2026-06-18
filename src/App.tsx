import React, { useState } from "react";

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

// SAFE INITIAL STATE
const EMPTY_STATE = {
  diary: [],
  studySessions: [],
  expenses: [],
  reminders: [],
  entertainment: [],
  calendar: {}
};

export default function App() {
  const [activeView, setActiveView] = useState("dashboard");
  const [state, setState] = useState<any>(EMPTY_STATE);

  // SAFE UPDATE
  const updateState = (newState: any) => {
    setState((prev: any) => ({
      ...EMPTY_STATE,
      ...prev,
      ...newState,
      lastUpdated: Date.now()
    }));
  };

  const safe = {
    ...EMPTY_STATE,
    ...(state || {})
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-white">

      {/* SIDEBAR */}
      <aside className="w-60 bg-slate-900 p-4 hidden md:block">
        <h1 className="text-sm font-bold mb-4">Life OS</h1>

        {[
          "dashboard",
          "diary",
          "study",
          "fitness",
          "finance",
          "habits",
          "entertainment",
          "calendar",
          "ai"
        ].map((id) => (
          <button
            key={id}
            onClick={() => setActiveView(id)}
            className="block w-full text-left py-2 px-3 hover:bg-slate-800 rounded"
          >
            {id}
          </button>
        ))}
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-4">

        {activeView === "dashboard" && (
          <DashboardView state={safe} updateState={updateState} />
        )}

        {activeView === "diary" && (
          <DiaryView state={safe} updateState={updateState} />
        )}

        {activeView === "study" && (
          <StudyView state={safe} updateState={updateState} />
        )}

        {activeView === "fitness" && (
          <FitnessView state={safe} updateState={updateState} />
        )}

        {activeView === "finance" && (
          <FinanceView state={safe} updateState={updateState} />
        )}

        {activeView === "habits" && (
          <HabitView state={safe} updateState={updateState} />
        )}

        {activeView === "entertainment" && (
          <EntertainmentView state={safe} updateState={updateState} />
        )}

        {activeView === "calendar" && (
          <CalendarView state={safe} updateState={updateState} />
        )}

        {activeView === "ai" && (
          <AiAnalystView state={safe} />
        )}

      </main>
    </div>
  );
}