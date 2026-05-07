import { DEFAULT_SUBJECT_GOALS, DEFAULT_SUBJECT_DAILY_GOALS } from './subject';
import type { Language } from '../i18n/i18n';

export interface AppSettings {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  cyclesBeforeLongBreak: number;
  autoStartTimers: boolean;
  autoStartBreaks: boolean;
  autoLoopCycles: boolean;
  soundEnabled: boolean;
  soundVolume: number;
  subjectGoals: Record<string, number>;        // weekly target hours per subject
  subjectDailyGoals: Record<string, number>;   // daily target hours per subject
  language: Language;
}

export const DEFAULT_SETTINGS: AppSettings = {
  focusDuration: 50,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  cyclesBeforeLongBreak: 4,
  autoStartTimers: true,
  autoStartBreaks: true,
  autoLoopCycles: true,
  soundEnabled: true,
  soundVolume: 0.7,
  subjectGoals: { ...DEFAULT_SUBJECT_GOALS },
  subjectDailyGoals: { ...DEFAULT_SUBJECT_DAILY_GOALS },
  language: 'ro',
};
