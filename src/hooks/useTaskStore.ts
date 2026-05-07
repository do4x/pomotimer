import { useState, useCallback, useEffect } from 'react';
import type { Task } from '../types/task';
import { SUBJECT_IDS } from '../types/subject';

const STORAGE_KEY = 'pomotimer-tasks';

type TaskStore = Record<string, Task[]>;

function emptyStore(): TaskStore {
  return SUBJECT_IDS.reduce<TaskStore>((acc, id) => ({ ...acc, [id]: [] }), {});
}

function loadTasks(): TaskStore {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ignore old A/B-shaped data; start fresh.
      if (parsed && (Array.isArray(parsed.A) || Array.isArray(parsed.B))) return emptyStore();
      const result = emptyStore();
      for (const id of SUBJECT_IDS) {
        if (Array.isArray(parsed[id])) result[id] = parsed[id];
      }
      return result;
    }
  } catch { /* ignore */ }
  return emptyStore();
}

export function useTaskStore() {
  const [tasks, setTasks] = useState<TaskStore>(loadTasks);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = useCallback((subjectId: string, text: string) => {
    const task: Task = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      createdAt: Date.now(),
    };
    setTasks(prev => ({
      ...prev,
      [subjectId]: [...(prev[subjectId] || []), task],
    }));
  }, []);

  const completeTask = useCallback((subjectId: string, id: string) => {
    setTasks(prev => ({
      ...prev,
      [subjectId]: (prev[subjectId] || []).map(t => (t.id === id ? { ...t, completed: true } : t)),
    }));
  }, []);

  const deleteTask = useCallback((subjectId: string, id: string) => {
    setTasks(prev => ({
      ...prev,
      [subjectId]: (prev[subjectId] || []).filter(t => t.id !== id),
    }));
  }, []);

  const tasksFor = useCallback(
    (subjectId: string): Task[] => tasks[subjectId] || [],
    [tasks]
  );

  const allCompleted = useCallback(
    (subjectId: string): boolean => {
      const list = tasks[subjectId] || [];
      return list.length > 0 && list.every(t => t.completed);
    },
    [tasks]
  );

  return { tasks, addTask, completeTask, deleteTask, tasksFor, allCompleted };
}
