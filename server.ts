miport express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { DatabaseState } from "./src/types";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DB_PATH = path.join(process.cwd(), "data", "db.json");

// Ensure data directory exists
if (!fs.existsSync(path.join(process.cwd(), "data"))) {
  fs.mkdirSync(path.join(process.cwd(), "data"), { recursive: true });
}

// Format date as YYYY-MM-DD
function getTodayString() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Generate high-quality initial seed data
function getInitialData(): DatabaseState {
  const todayStr = getTodayString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const db: DatabaseState = {
    diary: [
      {
        id: "diary-1",
        date: yesterdayStr,
        mood: "Calm",
        title: "Productive evening session",
        content: "Completed two major tasks today. Enjoyed a long walk and stayed hydrated. Feeling aligned and ready for the week.",
        timestamp: Date.now() - 86400000
      },
      {
        id: "diary-2",
        date: todayStr,
        mood: "Focus",
        title: "Started Life OS setup",
        content: "Setting up my new second brain platform. It feels amazing to centralize my notes, trackers, finance, habits, and goals under one clean UI. Focused and ready.",
        timestamp: Date.now()
      }
    ],
    studySessions: [
      {
        id: "study-1",
        subject: "TypeScript & Software Architecture",
        startTime: Date.now() - 7200000,
        endTime: Date.now() - 3600000,
        durationMs: 3600000
      },
      {
        id: "study-2",
        subject: "Database Modeling",
        startTime: Date.now() - 18000000,
        endTime: Date.now() - 12600000,
        durationMs: 5400000
      }
    ],
    activeStudy: null,
    workoutSessions: [
      {
        id: "workout-1",
        type: "Strength Training",
        startTime: Date.now() - 86400000 - 3600000,
        endTime: Date.now() - 86400000,
        durationMs: 3600000
      }
    ],
    activeWorkout: null,
    productivitySessions: [
      {
        id: "prod-1",
        startTime: Date.now() - 86400000 - 7200000,
        endTime: Date.now() - 86400000 - 3600000,
        durationMs: 3600000
      }
    ],
    activeProductivity: null,
    habits: [
      { id: "h1", name: "Read 10 Pages", frequency: "daily", isActive: true },
      { id: "h2", name: "8 Hours Sleep", frequency: "daily", isActive: true },
      { id: "h3", name: "Drink 3L Water", frequency: "daily", isActive: true },
      { id: "h4", name: "Meditation 10 mins", frequency: "daily", isActive: true },
      { id: "h5", name: "Weekly Budget Review", frequency: "weekly", isActive: true }
    ],
    habitLogs: [
      { id: "hl-1", habitId: "h1", date: yesterdayStr, completed: true },
      { id: "hl-2", habitId: "h2", date: yesterdayStr, completed: true },
      { id: "hl-3", habitId: "h3", date: yesterdayStr, completed: false },
      { id: "hl-4", habitId: "h4", date: yesterdayStr, completed: true },
      { id: "hl-5", habitId: "h1", date: todayStr, completed: true },
      { id: "hl-6", habitId: "h3", date: todayStr, completed: true }
    ],
    expenses: [
      {
        id: "exp-1",
        type: "expense",
        amount: 14.50,
        category: "Food",
        description: "Specialty coffee and croissant",
        date: todayStr,
        source: "wallet",
        timestamp: Date.now()
      },
      {
        id: "exp-2",
        type: "expense",
        amount: 85.00,
        category: "Utilities",
        description: "Monthly internet subscription",
        date: yesterdayStr,
        source: "bank",
        timestamp: Date.now() - 86400000
      },
      {
        id: "exp-3",
        type: "income",
        amount: 2450.00,
        category: "Salary",
        description: "Bi-weekly consulting fee",
        date: yesterdayStr,
        source: "bank",
        timestamp: Date.now() - 86400000
      }
    ],
    walletBalance: 120.00,
    bankBalance: 4850.00,
    reminders: [
      {
        id: "rem-1",
        title: "Submit software architecture proposal",
        type: "task",
        date: todayStr,
        completed: false,
        priority: "high"
      },
      {
        id: "rem-2",
        title: "Database Design Midterm Exam",
        type: "exam",
        date: todayStr,
        time: "14:00",
        completed: false,
        priority: "high"
      },
      {
        id: "rem-3",
        title: "Evening community gym meet",
        type: "event",
        date: todayStr,
        time: "18:30",
        completed: false,
        priority: "medium"
      },
      {
        id: "rem-4",
        title: "Renew annual hosting subscription",
        type: "task",
        date: todayStr,
        completed: true,
        priority: "low"
      }
    ],
    entertainment: [
      {
        id: "ent-1",
        title: "Interstellar",
        type: "Movie",
        status: "Completed",
        rating: 10,
        review: "Masterpiece. The scoring, the visual effects, and the emotional core are absolute top tier.",
        timestamp: Date.now() - 172800000
      },
      {
        id: "ent-2",
        title: "Severance Season 1",
        type: "Series",
        status: "Watching",
        rating: 9,
        review: "Slick production and deeply eerie premise. Highly recommended watch.",
        timestamp: Date.now() - 86400000
      }
    ],
    waterIntake: {
      [yesterdayStr]: 2500,
      [todayStr]: 1500
    },
    steps: {
      [yesterdayStr]: 10250,
      [todayStr]: 6230
    },
    sleepHours: {
      [yesterdayStr]: 7.5,
      [todayStr]: 8.0
    },
    productivityMode: false,
    lastUpdated: Date.now()
  };
  return db;
}

// Load database from file
function loadDB(): DatabaseState {
  try {
    if (fs.existsSync(DB_PATH)) {
      const content = fs.readFileSync(DB_PATH, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Failed to read database, seeding default data instead:", err);
  }
  const defaultData = getInitialData();
  saveDB(defaultData);
  return defaultData;
}

// Save database to file
function saveDB(state: DatabaseState) {
  try {
    state.lastUpdated = Date.now();
    fs.writeFileSync(DB_PATH, JSON.stringify(state, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write database file:", err);
  }
}

app.use(express.json());

// API Endpoints
app.get("/api/state", (req: Request, res: Response) => {
  const db = loadDB();
  res.json(db);
});

// Full state replacement or synchronization
app.post("/api/state", (req: Request, res: Response) => {
  const clientState = req.body;
  if (!clientState) {
    res.status(400).json({ error: "Invalid state provided" });
    return;
  }
  saveDB(clientState);
  res.json({ success: true, lastUpdated: clientState.lastUpdated });
});

// Long Poll / SSE lightweight check for syncing
app.get("/api/sync-check", (req: Request, res: Response) => {
  const clientVersion = parseInt(req.query.version as string || "0");
  const db = loadDB();
  if (db.lastUpdated > clientVersion) {
    res.json({ outOfSync: true, latest: db });
  } else {
    res.json({ outOfSync: false });
  }
});

// Personalized productivity summary engine
app.post("/api/ai-summary", async (req: Request, res: Response) => {
  const db = loadDB();
  const today = getTodayString();

  // Extract statistics
  const currentSteps = db.steps[today] || 0;
  const currentWater = db.waterIntake[today] || 0;
  const currentSleep = db.sleepHours[today] || 0;

  // Filter study sessions for today
  const todayStudyMs = db.studySessions
    .filter(s => new Date(s.startTime).toISOString().startsWith(today))
    .reduce((sum, s) => sum + s.durationMs, 0);
  const todayStudyHours = (todayStudyMs / 3600000).toFixed(1);

  // Filter workout sessions for today
  const todayWorkouts = db.workoutSessions
    .filter(s => new Date(s.startTime).toISOString().startsWith(today))
    .map(w => w.type)
    .join(", ") || "None";

  // Financial status
  const todayTx = db.expenses
    .filter(e => e.date === today)
    .map(e => `${e.type.toUpperCase()}: $${e.amount.toFixed(2)} (${e.category} - ${e.description})`)
    .join("\n") || "No expenses logged today";

  // Completed tasks
  const completedTasks = db.reminders
    .filter(r => r.date === today && r.completed)
    .map(r => r.title)
    .join(", ") || "None";

  const ongoingTasks = db.reminders
    .filter(r => r.date === today && !r.completed)
    .map(r => r.title)
    .join(", ") || "None";

  // Last diary entry
  const latestDiary = db.diary.length > 0 ? db.diary[db.diary.length - 1] : null;
  const diaryContext = latestDiary
    ? `Diary Topic: ${latestDiary.title}\nContent: ${latestDiary.content}\nMood state: ${latestDiary.mood}`
    : "No diary written today";

  // Construct prompt
  const prompt = `You are "Aura", a highly polished, supportive personal Life OS productivity coach and second-brain analyst for Shishir Bhusal.
Analyze index data for Shishir's day:
Date: ${today}
Steps Today: ${currentSteps}
Water Intake: ${currentWater}ml
Sleep Logged: ${currentSleep} hours
Total Study Tracked Today: ${todayStudyHours} hours
Completed Workout Actions: ${todayWorkouts}
Finances Tracker Logged:
${todayTx}
Completed Reminders/Tasks: ${completedTasks}
Remaining Pending Tasks: ${ongoingTasks}
Journal Entry details:
${diaryContext}

Please deliver a beautiful, inspiring, and concise daily life synthesis and a set of custom actionable productivity metrics.
Provide your response in high-fidelity markdown with sections:
1. **Coach Aura's Core Synergy Synthesis**: Warm, motivational greeting and 3-sentence summary of the user's day, pointing out areas of alignment and balance.
2. **Habit & Momentum Analytics**: Highlighting streaks, sleep score, study momentum, or workout stats.
3. **Weekly Strategic Coach Recommendations**: 2 specific, realistic micro-habits or scheduling adjustments to make their tomorrow even more balanced and high-focus.

Keep the tone encouraging, structured, intellectual yet human, and extremely professional. Avoid lists of technical debug details.`;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      res.json({
        summary: `### Aura Coach Setup Required\n\nTo activate your personal Second Brain Analyst, please configure a valid API key in your environment settings.\n\n*Currently showing Shishir's local metrics overview:*\n- **Daily Study**: ${todayStudyHours} hrs\n- **Physical Movement**: ${currentSteps} steps (${todayWorkouts})\n- **Hydration & Sleep**: ${currentWater}ml water / ${currentSleep} hrs sleep.`
      });
      return;
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.json({ summary: response.text || "No response received from Aura." });
  } catch (error: any) {
    console.error("Summary generation failure:", error);
    res.status(500).json({ error: "Failed to generate productivity report: " + error.message });
  }
});

// Configure Vite or Static server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Life OS Server running on http://localhost:${PORT}`);
  });
}

startServer();
