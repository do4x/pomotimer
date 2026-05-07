export type DailySubjectRecord = Record<string, number>; // subjectId -> seconds

export interface StudyStats {
  dailyRecords: Record<string, DailySubjectRecord>; // YYYY-MM-DD -> per-subject seconds
  streakGoalMinutes: number;
}

export const DEFAULT_STREAK_GOAL = 30;
