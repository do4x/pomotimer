import type { Language } from '../i18n/i18n';

export interface Subject {
  id: string;
  color: string;
  glow: string;
}

export const SUBJECTS: Subject[] = [
  { id: 'math',   color: '#E67E22', glow: '#F0B27A' },
  { id: 'info',   color: '#5B8DEE', glow: '#93B5F8' },
  { id: 'romana', color: '#9B59B6', glow: '#C39BD3' },
];

export const SUBJECT_IDS = SUBJECTS.map(s => s.id);

export function getSubject(id: string | null | undefined): Subject | undefined {
  if (!id) return undefined;
  return SUBJECTS.find(s => s.id === id);
}

const SUBJECT_NAMES: Record<Language, Record<string, string>> = {
  en: { math: 'Math',        info: 'Computer Science', romana: 'Romanian' },
  ro: { math: 'Matematică',  info: 'Informatică',      romana: 'Română' },
};

export function subjectName(id: string, lang: Language = 'ro'): string {
  return SUBJECT_NAMES[lang][id] || id;
}

// Weekly target hours — defaults
export const DEFAULT_SUBJECT_GOALS: Record<string, number> = {
  math: 7,
  info: 7,
  romana: 5,
};

// Daily target hours — defaults
export const DEFAULT_SUBJECT_DAILY_GOALS: Record<string, number> = {
  math: 1,
  info: 1,
  romana: 1,
};
