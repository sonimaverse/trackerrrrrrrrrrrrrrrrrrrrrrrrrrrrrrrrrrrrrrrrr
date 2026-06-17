export interface DiaryEntry {
  id: string;
  date: string; // YYYY-MM-DD
  mood: "Happy" | "Calm" | "Focus" | "Tired" | "Stressed" | "Sad";
  title: string;
  content: string;
  timestamp: number;
}

export interface StudySession {
  id: string;
  subject: string;
  startTime: number;
  endTime: number;
  durationMs: number; // Duration of the session in milliseconds
}

export interface ActiveStudy {
  startTime: number;
  subject: string;
}

export interface WorkoutSession {
  id: string;
  type: string;
  startTime: number;
  endTime: number;
  durationMs: number;
}

export interface ActiveWorkout {
  startTime: number;
  type: string;
}

export interface ProductivitySession {
  id: string;
  startTime: number;
  endTime: number;
  durationMs: number;
}

export interface ActiveProductivity {
  startTime: number;
}

export interface Habit {
  id: string;
  name: string;
  frequency: "daily" | "weekly";
  isActive: boolean;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
}

export interface Expense {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: string; // YYYY-MM-DD
  source: "wallet" | "bank";
  timestamp: number;
}

export interface Reminder {
  id: string;
  title: string;
  type: "task" | "event" | "exam";
  date: string; // YYYY-MM-DD
  time?: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
}

export interface EntertainmentLog {
  id: string;
  title: string;
  type: "Movie" | "Series" | "Book" | "Anime";
  status: "Completed" | "Plan to Watch" | "Watching";
  rating: number; // 1-10
  review: string;
  timestamp: number;
}

export interface DatabaseState {
  diary: DiaryEntry[];
  studySessions: StudySession[];
  activeStudy: ActiveStudy | null;
  workoutSessions: WorkoutSession[];
  activeWorkout: ActiveWorkout | null;
  habits: Habit[];
  habitLogs: HabitLog[];
  expenses: Expense[];
  walletBalance: number;
  bankBalance: number;
  reminders: Reminder[];
  entertainment: EntertainmentLog[];
  waterIntake: { [date: string]: number }; // date -> volume (ml) or glasses
  steps: { [date: string]: number }; // date -> count
  sleepHours: { [date: string]: number }; // date -> hours
  productivitySessions: ProductivitySession[];
  activeProductivity: ActiveProductivity | null;
  productivityMode: boolean; // Productivity mode toggle
  lastUpdated: number;
}
