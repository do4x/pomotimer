export interface DailyRecord {
  date: string;        // YYYY-MM-DD
  seconds: number;     // total study seconds
}

export interface StudyStats {
  dailyRecords: Record<string, number>;  // date -> seconds
  streakGoalMinutes: number;             // daily goal to count as "studied"
}

export const DEFAULT_STREAK_GOAL = 30; // 30 minutes minimum to count for streak
