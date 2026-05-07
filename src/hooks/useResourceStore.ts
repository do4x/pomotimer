import { useState, useCallback, useEffect } from 'react';
import type { Resource } from '../types/resource';
import { SUBJECT_IDS } from '../types/subject';

const STORAGE_KEY = 'pomotimer-resources';

type ResourceStore = Record<string, Resource[]>;

function emptyStore(): ResourceStore {
  return SUBJECT_IDS.reduce<ResourceStore>((acc, id) => ({ ...acc, [id]: [] }), {});
}

function detectType(url: string): Resource['type'] {
  if (/youtube\.com|youtu\.be/.test(url)) return 'youtube';
  if (/\.pdf($|\?)/.test(url)) return 'pdf';
  return 'link';
}

function loadResources(): ResourceStore {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
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

export function useResourceStore() {
  const [resources, setResources] = useState<ResourceStore>(loadResources);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resources));
  }, [resources]);

  const addResource = useCallback((subjectId: string, url: string, title?: string) => {
    const resource: Resource = {
      id: crypto.randomUUID(),
      url,
      title: title || url,
      type: detectType(url),
      createdAt: Date.now(),
    };
    setResources(prev => ({
      ...prev,
      [subjectId]: [...(prev[subjectId] || []), resource],
    }));
  }, []);

  const removeResource = useCallback((subjectId: string, id: string) => {
    setResources(prev => ({
      ...prev,
      [subjectId]: (prev[subjectId] || []).filter(r => r.id !== id),
    }));
  }, []);

  const resourcesFor = useCallback(
    (subjectId: string): Resource[] => resources[subjectId] || [],
    [resources]
  );

  return { resources, addResource, removeResource, resourcesFor };
}
