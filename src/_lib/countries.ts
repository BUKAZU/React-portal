export type CountryEntry = {
  name: string;
  alpha2: string;
};

const SUPPORTED_LOCALES = ['en', 'nl', 'de', 'fr', 'es', 'it'] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

function isSupportedLocale(locale: string): locale is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(locale);
}

const cache = new Map<SupportedLocale, CountryEntry[]>();

/**
 * Lazily loads the country list for the given locale.
 * The result is cached so each locale file is only fetched once.
 *
 * To add a new locale, add its key to SUPPORTED_LOCALES and a corresponding
 * case in the switch statement below, then place the JSON file at
 * `src/_lib/countries/<locale>.json`.
 */
export async function loadCountries(locale: string): Promise<CountryEntry[]> {
  const key: SupportedLocale = isSupportedLocale(locale) ? locale : 'en';

  if (cache.has(key)) {
    return cache.get(key)!;
  }

  let data: CountryEntry[];

  switch (key) {
    case 'nl':
      data = (
        (await import('./countries/nl.json')) as { default: CountryEntry[] }
      ).default;
      break;
    case 'de':
      data = (
        (await import('./countries/de.json')) as { default: CountryEntry[] }
      ).default;
      break;
    case 'fr':
      data = (
        (await import('./countries/fr.json')) as { default: CountryEntry[] }
      ).default;
      break;
    case 'es':
      data = (
        (await import('./countries/es.json')) as { default: CountryEntry[] }
      ).default;
      break;
    case 'it':
      data = (
        (await import('./countries/it.json')) as { default: CountryEntry[] }
      ).default;
      break;
    default:
      data = (
        (await import('./countries/en.json')) as { default: CountryEntry[] }
      ).default;
  }

  cache.set(key, data);
  return data;
}
