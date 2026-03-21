import { useState, useCallback, useEffect } from 'react';
import type { Task, TimerTarget } from '../types/task';

const STORAGE_KEY = 'pomotimer-tasks';

interface TaskStore {
  A: Task[];
  B: Task[];
}

function loadTasks(): TaskStore {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return { A: [], B: [] };
}

function saveTasks(store: TaskStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function useTaskStore() {
  const [tasks, setTasks] = useState<TaskStore>(loadTasks);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const addTask = useCallback((timer: TimerTarget, text: string) => {
    const task: Task = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      createdAt: Date.now(),
    };
    setTasks(prev => ({
      ...prev,
      [timer]: [...prev[timer], task],
    }));
  }, []);

  const completeTask = useCallback((timer: TimerTarget, id: string) => {
    setTasks(prev => ({
      ...prev,
      [timer]: prev[timer].map(t => t.id === id ? { ...t, completed: true } : t),
    }));
  }, []);

  const deleteTask = useCallback((timer: TimerTarget, id: string) => {
    setTasks(prev => ({
      ...prev,
      [timer]: prev[timer].filter(t => t.id !== id),
    }));
  }, []);

  const allCompleted = useCallback((timer: TimerTarget): boolean => {
    const list = tasks[timer];
    return list.length > 0 && list.every(t => t.completed);
  }, [tasks]);

  return { tasks, addTask, completeTask, deleteTask, allCompleted };
}
