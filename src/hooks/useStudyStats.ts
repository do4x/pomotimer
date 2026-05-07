import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { TimerPhase, TimerStatus } from '../types/timer';
import type { StudyStats, DailySubjectRecord } from '../types/stats';
import { DEFAULT_STREAK_GOAL } from '../types/stats';
import { SUBJECT_IDS } from '../types/subject';

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
      const records: Record<string, DailySubjectRecord> = {};
      // Migrate old flat-seconds schema → put under first subject id
      for (const [date, value] of Object.entries(parsed.dailyRecords || {})) {
        if (typeof value === 'number') {
          records[date] = { [SUBJECT_IDS[0]]: value };
        } else if (value && typeof value === 'object') {
          records[date] = value as DailySubjectRecord;
        }
      }
      return {
        dailyRecords: records,
        streakGoalMinutes: parsed.streakGoalMinutes ?? DEFAULT_STREAK_GOAL,
      };
    }
  } catch { /* ignore */ }
  return { dailyRecords: {}, streakGoalMinutes: DEFAULT_STREAK_GOAL };
}

function saveStats(stats: StudyStats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

function dailyTotal(record: DailySubjectRecord | undefined): number {
  if (!record) return 0;
  return Object.values(record).reduce((acc, v) => acc + (v || 0), 0);
}

export function useStudyStats(phase: TimerPhase, status: TimerStatus, activeSubjectId: string, overtime: boolean = false) {
  const [stats, setStats] = useState<StudyStats>(loadStats);
  // Credit ticks during focus AND overtime (overtime keeps phase = 'focus' in our reducer,
  // so this reduces to a check on focus + running, but we accept the explicit flag for clarity).
  const isStudying = (phase === 'focus' || overtime) && status === 'running';
  const isStudyingRef = useRef(isStudying);
  isStudyingRef.current = isStudying;
  const subjectRef = useRef(activeSubjectId);
  subjectRef.current = activeSubjectId;

  // Per-tick: increment active subject's seconds. Skip never reaches here
  // because skip changes phase out of `focus` instantly.
  useEffect(() => {
    if (!isStudying) return;

    const interval = setInterval(() => {
      if (!isStudyingRef.current) return;
      const subjectId = subjectRef.current;
      if (!subjectId) return;
      setStats(prev => {
        const today = getTodayKey();
        const dayRecord = { ...(prev.dailyRecords[today] || {}) };
        dayRecord[subjectId] = (dayRecord[subjectId] || 0) + 1;
        const updated: StudyStats = {
          ...prev,
          dailyRecords: { ...prev.dailyRecords, [today]: dayRecord },
        };
        saveStats(updated);
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isStudying]);

  const todayRecord = stats.dailyRecords[getTodayKey()];
  const todaySeconds = dailyTotal(todayRecord);

  const streak = useMemo(
    () => calculateStreak(stats.dailyRecords, stats.streakGoalMinutes),
    [stats.dailyRecords, stats.streakGoalMinutes]
  );

  const updateGoal = useCallback((minutes: number) => {
    setStats(prev => {
      const updated = { ...prev, streakGoalMinutes: minutes };
      saveStats(updated);
      return updated;
    });
  }, []);

  /** Manually credit study time (e.g. session done outside the app). */
  const addManualSeconds = useCallback((dateKey: string, subjectId: string, seconds: number) => {
    if (!subjectId || seconds <= 0) return;
    setStats(prev => {
      const dayRecord = { ...(prev.dailyRecords[dateKey] || {}) };
      dayRecord[subjectId] = (dayRecord[subjectId] || 0) + seconds;
      const updated: StudyStats = {
        ...prev,
        dailyRecords: { ...prev.dailyRecords, [dateKey]: dayRecord },
      };
      saveStats(updated);
      return updated;
    });
  }, []);

  const weekData = useMemo(() => getWeekData(stats.dailyRecords), [stats.dailyRecords]);

  // Flat totals (for backward-compat consumers like the heatmap)
  const allRecords = useMemo(() => {
    const flat: Record<string, number> = {};
    for (const [date, record] of Object.entries(stats.dailyRecords)) {
      flat[date] = dailyTotal(record);
    }
    return flat;
  }, [stats.dailyRecords]);

  return {
    todaySeconds,
    todayBySubject: todayRecord || {},
    streak,
    streakGoalMinutes: stats.streakGoalMinutes,
    updateGoal,
    addManualSeconds,
    weekData,
    allRecords,
    dailyRecords: stats.dailyRecords,
  };
}

function calculateStreak(
  records: Record<string, DailySubjectRecord>,
  goalMinutes: number
): number {
  const goalSeconds = goalMinutes * 60;
  let streak = 0;
  const now = new Date();
  const todayKey = getTodayKey();
  const todayMet = dailyTotal(records[todayKey]) >= goalSeconds;
  const startOffset = todayMet ? 0 : 1;

  for (let i = startOffset; ; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const seconds = dailyTotal(records[key]);

    if (i === 0 && todayMet) { streak++; continue; }
    if (i > 0 && seconds >= goalSeconds) streak++;
    else if (i > 0) break;
  }

  return streak;
}

interface DayData {
  label: string;
  seconds: number;
  date: string;
  bySubject: DailySubjectRecord;
}

function getWeekData(records: Record<string, DailySubjectRecord>): DayData[] {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const result: DayData[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const record = records[key];
    result.push({
      label: days[d.getDay()],
      seconds: dailyTotal(record),
      date: key,
      bySubject: record || {},
    });
  }

  return result;
}
