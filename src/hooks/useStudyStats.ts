import { useState, useEffect, useRef, useCallback } from 'react';
import type { TimerPhase, TimerStatus } from '../types/timer';
import type { StudyStats } from '../types/stats';
import { DEFAULT_STREAK_GOAL } from '../types/stats';

const STORAGE_KEY = 'pomotimer-study-stats';

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function loadStats(): StudyStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        dailyRecords: parsed.dailyRecords || {},
        streakGoalMinutes: parsed.streakGoalMinutes ?? DEFAULT_STREAK_GOAL,
      };
    }
  } catch { /* ignore */ }
  return { dailyRecords: {}, streakGoalMinutes: DEFAULT_STREAK_GOAL };
}

function saveStats(stats: StudyStats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

function isStudyPhase(phase: TimerPhase): boolean {
  return phase === 'timerA' || phase === 'timerB';
}

export function useStudyStats(phase: TimerPhase, status: TimerStatus) {
  const [stats, setStats] = useState<StudyStats>(loadStats);
  const isStudying = isStudyPhase(phase) && status === 'running';
  const isStudyingRef = useRef(isStudying);
  isStudyingRef.current = isStudying;

  // Accumulate seconds while studying
  useEffect(() => {
    if (!isStudying) return;

    const interval = setInterval(() => {
      if (!isStudyingRef.current) return;
      setStats(prev => {
        const today = getTodayKey();
        const updated = {
          ...prev,
          dailyRecords: {
            ...prev.dailyRecords,
            [today]: (prev.dailyRecords[today] || 0) + 1,
          },
        };
        saveStats(updated);
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isStudying]);

  const todaySeconds = stats.dailyRecords[getTodayKey()] || 0;

  // Calculate streak
  const streak = calculateStreak(stats.dailyRecords, stats.streakGoalMinutes);

  const updateGoal = useCallback((minutes: number) => {
    setStats(prev => {
      const updated = { ...prev, streakGoalMinutes: minutes };
      saveStats(updated);
      return updated;
    });
  }, []);

  // Get last 7 days of data for the weekly view
  const weekData = getWeekData(stats.dailyRecords);

  return {
    todaySeconds,
    streak,
    streakGoalMinutes: stats.streakGoalMinutes,
    updateGoal,
    weekData,
    allRecords: stats.dailyRecords,
  };
}

function calculateStreak(records: Record<string, number>, goalMinutes: number): number {
  const goalSeconds = goalMinutes * 60;
  let streak = 0;
  const now = new Date();

  // Check if today meets the goal — if so, include it
  const todayKey = getTodayKey();
  const todayMet = (records[todayKey] || 0) >= goalSeconds;

  // Start checking from yesterday (or today if today meets goal)
  const startOffset = todayMet ? 0 : 1;

  for (let i = startOffset; ; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const seconds = records[key] || 0;

    if (i === 0 && todayMet) {
      streak++;
      continue;
    }
    if (i > 0 && seconds >= goalSeconds) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  return streak;
}

interface DayData {
  label: string;    // day abbreviation
  seconds: number;
  date: string;
}

function getWeekData(records: Record<string, number>): DayData[] {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const result: DayData[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    result.push({
      label: days[d.getDay()],
      seconds: records[key] || 0,
      date: key,
    });
  }

  return result;
}
