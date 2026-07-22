import { en } from './en';
import { fr } from './fr';

export type TranslationKey = keyof typeof en;

const dictionaries: Record<string, Record<TranslationKey, string>> = { en, fr };

/** Device locale, e.g. "en-US", resolved once through Intl. */
export const deviceLocale: string =
  Intl.NumberFormat().resolvedOptions().locale || 'en';

// Only French and English ship for now; every other locale falls back to
// English.
const language = deviceLocale.toLowerCase().startsWith('fr') ? 'fr' : 'en';

/**
 * Translates key into the device language (English fallback for unsupported
 * locales) and interpolates {{placeholders}} with the given values.
 */
export const t = (
  key: TranslationKey,
  values?: Record<string, string>,
): string => {
  const template = dictionaries[language][key];
  if (!values) {
    return template;
  }
  return Object.entries(values).reduce(
    (result, [name, value]) => result.replaceAll(`{{${name}}}`, value),
    template,
  );
};
