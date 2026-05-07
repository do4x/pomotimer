import { useState, useCallback, useEffect } from 'react';
import { SUBJECTS } from '../types/subject';

const STORAGE_KEY = 'pomotimer-active-subject';

function loadActive(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUBJECTS.some(s => s.id === stored)) return stored;
  } catch { /* ignore */ }
  return SUBJECTS[0].id;
}

export function useActiveSubject() {
  const [activeId, setActiveId] = useState<string>(loadActive);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, activeId);
  }, [activeId]);

  const setActive = useCallback((id: string) => {
    if (SUBJECTS.some(s => s.id === id)) setActiveId(id);
  }, []);

  return { activeId, setActive };
}
