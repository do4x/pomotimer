import { useEffect, useCallback } from 'react';

export function useNotifier() {
  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => { /* ignore */ });
    }
  }, []);

  const notify = useCallback((title: string, body: string) => {
    try {
      if (typeof Notification === 'undefined') return;
      if (Notification.permission !== 'granted') return;
      new Notification(title, { body, silent: false });
    } catch { /* ignore */ }
  }, []);

  const notifyPreEnd = useCallback(
    (subjectName: string, secondsLeft: number) => {
      notify('Pomotimer', `${subjectName} ends in ${secondsLeft}s — break next`);
    },
    [notify]
  );

  return { notify, notifyPreEnd };
}
