import React, { useState } from "react";

export default function CalendarView({ state, updateState }: any) {
  const reminders = state?.reminders ?? [];

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const addReminder = (e: any) => {
    e.preventDefault();

    const newReminder = {
      id: Date.now(),
      title,
      date,
      completed: false
    };

    updateState({
      reminders: [...reminders, newReminder]
    });

    setTitle("");
  };

  return (
    <div className="p-4">
      <h2 className="text-xl mb-4">Calendar</h2>

      <form onSubmit={addReminder} className="space-y-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Reminder"
          className="p-2 bg-slate-800 w-full"
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="p-2 bg-slate-800 w-full"
        />

        <button className="bg-blue-600 px-4 py-2">
          Add
        </button>
      </form>

      <div className="mt-4 space-y-2">
        {reminders.map((r: any) => (
          <div key={r.id} className="p-2 bg-slate-800">
            {r.title} - {r.date}
          </div>
        ))}
      </div>
    </div>
  );
}