export const SUPPORTED_LOCALES = ['en', 'nl', 'de', 'fr', 'es', 'it'] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(locale);
}

export function resolveSupportedLocale(locale: string): SupportedLocale {
  return isSupportedLocale(locale) ? locale : 'en';
}
