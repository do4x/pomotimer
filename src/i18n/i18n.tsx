import { createContext, useContext, useCallback, type ReactNode } from 'react';

export type Language = 'en' | 'ro';

const LanguageContext = createContext<Language>('ro');

export function LanguageProvider({ value, children }: { value: Language; children: ReactNode }) {
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang(): Language {
  return useContext(LanguageContext);
}

/**
 * Returns t(en, ro) — picks the right string for the active language.
 * Args interpolation: t('Studied for {0} min', 'Studiat {0} min').replace('{0}', '5').
 */
export function useT() {
  const lang = useContext(LanguageContext);
  return useCallback((en: string, ro: string) => (lang === 'ro' ? ro : en), [lang]);
}
