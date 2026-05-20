export interface Exam {
  id: 'bac' | 'poli';
  date: Date;
  color: string;
  glow: string;
  surface: string;
}

export const EXAMS: Exam[] = [
  {
    id: 'bac',
    date: new Date(2026, 5, 28),
    color: '#4F46E5',
    glow: '#818CF8',
    surface: 'rgba(79, 70, 229, 0.08)',
  },
  {
    id: 'poli',
    date: new Date(2026, 6, 24),
    color: '#14B8A6',
    glow: '#5EEAD4',
    surface: 'rgba(20, 184, 166, 0.08)',
  },
];

// Anchor for the progress arc — start of the 2025–2026 academic year.
export const PREP_START_DATE = new Date(2025, 8, 1);

export function daysUntil(target: Date, now: Date = new Date()): number {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const diff = Math.round((startOfTarget - startOfToday) / 86_400_000);
  return Math.max(0, diff);
}

/**
 * Fraction of preparation elapsed (0–1) for a given exam.
 * Uses raw timestamps so the arc moves smoothly through the day.
 */
export function examProgress(target: Date, now: Date = new Date()): number {
  const start = PREP_START_DATE.getTime();
  const end = target.getTime();
  const cur = now.getTime();
  if (end <= start) return 1;
  if (cur <= start) return 0;
  if (cur >= end) return 1;
  return (cur - start) / (end - start);
}

export function hasAnyUpcomingExam(now: Date = new Date()): boolean {
  return EXAMS.some(e => daysUntil(e.date, now) > 0);
}
