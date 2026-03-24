import { LocaleType } from '../types';

const SUPPORTED_LOCALES = ['en', 'nl', 'de', 'fr', 'es', 'it'] as const;

/**
 * Normalizes a locale string to one of the supported locale codes.
 * Accepts full BCP-47 locale codes (e.g. 'en-US', 'nl-NL', 'de_DE') and
 * returns just the supported language subtag. Falls back to 'en' if the
 * language is not supported or if the input is empty/null.
 */
export function normalizeLocale(locale: string | null | undefined): LocaleType {
  if (!locale) return 'en';
  const lang = locale.split(/[-_]/)[0].toLowerCase();
  if ((SUPPORTED_LOCALES as readonly string[]).includes(lang)) {
    return lang as LocaleType;
  }
  return 'en';
}

