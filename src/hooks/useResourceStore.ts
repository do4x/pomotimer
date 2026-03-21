import { useState, useCallback, useEffect } from 'react';
import type { Resource } from '../types/resource';
import type { TimerTarget } from '../types/task';

const STORAGE_KEY = 'pomotimer-resources';

interface ResourceStore {
  A: Resource[];
  B: Resource[];
}

function detectType(url: string): Resource['type'] {
  if (/youtube\.com|youtu\.be/.test(url)) return 'youtube';
  if (/\.pdf($|\?)/.test(url)) return 'pdf';
  return 'link';
}

function loadResources(): ResourceStore {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return { A: [], B: [] };
}

export function useResourceStore() {
  const [resources, setResources] = useState<ResourceStore>(loadResources);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resources));
  }, [resources]);

  const addResource = useCallback((timer: TimerTarget, url: string, title?: string) => {
    const resource: Resource = {
      id: crypto.randomUUID(),
      url,
      title: title || url,
      type: detectType(url),
      createdAt: Date.now(),
    };
    setResources(prev => ({
      ...prev,
      [timer]: [...prev[timer], resource],
    }));
  }, []);

  const removeResource = useCallback((timer: TimerTarget, id: string) => {
    setResources(prev => ({
      ...prev,
      [timer]: prev[timer].filter(r => r.id !== id),
    }));
  }, []);

  return { resources, addResource, removeResource };
}
