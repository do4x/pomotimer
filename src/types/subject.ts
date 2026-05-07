export interface Subject {
  id: string;
  name: string;
  color: string;
  glow: string;
}

export const SUBJECTS: Subject[] = [
  { id: 'math', name: 'Math', color: '#E67E22', glow: '#F0B27A' },
  { id: 'info', name: 'Informatică', color: '#5B8DEE', glow: '#93B5F8' },
  { id: 'romana', name: 'Română', color: '#9B59B6', glow: '#C39BD3' },
];

export const SUBJECT_IDS = SUBJECTS.map(s => s.id);

export function getSubject(id: string | null | undefined): Subject | undefined {
  if (!id) return undefined;
  return SUBJECTS.find(s => s.id === id);
}

export const DEFAULT_SUBJECT_GOALS: Record<string, number> = {
  math: 7,
  info: 7,
  romana: 5,
};
