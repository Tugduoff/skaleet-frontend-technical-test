import { useSyncExternalStore } from 'react';

import { en } from './en';
import { fr } from './fr';

export type TranslationKey = keyof typeof en;
export type Language = 'en' | 'fr';

const dictionaries: Record<Language, Record<TranslationKey, string>> = {
  en,
  fr,
};

/** Device locale, e.g. "en-US", resolved once through Intl. */
export const deviceLocale: string =
  Intl.NumberFormat().resolvedOptions().locale || 'en';

// Only French and English ship for now; every other locale falls back to
// English.
let currentLanguage: Language = deviceLocale.toLowerCase().startsWith('fr')
  ? 'fr'
  : 'en';

const listeners = new Set<() => void>();

export const getLanguage = (): Language => currentLanguage;

export const setLanguage = (language: Language) => {
  if (language === currentLanguage) {
    return;
  }
  currentLanguage = language;
  listeners.forEach(listener => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/**
 * Current UI language as React state: any component using it re-renders on
 * change, and the t() calls in its render pick up the new dictionary.
 */
export const useLanguage = (): Language =>
  useSyncExternalStore(subscribe, getLanguage);

/**
 * Translates key into the current language (English fallback for unsupported
 * locales) and interpolates {{placeholders}} with the given values.
 */
export const t = (
  key: TranslationKey,
  values?: Record<string, string>,
): string => {
  const template = dictionaries[currentLanguage][key];
  if (!values) {
    return template;
  }
  return Object.entries(values).reduce(
    (result, [name, value]) => result.replaceAll(`{{${name}}}`, value),
    template,
  );
};
