import { LocaleType } from '../types';

export const SUPPORTED_LOCALES = ['en', 'nl', 'de', 'fr', 'es', 'it'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(locale);
}

/**
 * Normalizes a locale string to one of the supported locale codes.
 * Accepts full BCP-47 locale codes (e.g. 'en-US', 'nl-NL', 'de_DE') and
 * returns just the supported language subtag. Falls back to 'en' if the
 * language is not supported or if the input is empty/null.
 */
export function normalizeLocale(locale: string | null | undefined): LocaleType {
  if (!locale) return 'en';
  const lang = locale.split(/[-_]/)[0].toLowerCase();
  if (isSupportedLocale(lang)) {
    return lang as LocaleType;
  }
  return 'en';
}
