import { decode } from '@msgpack/msgpack';

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

const countryMsgpackLoaders: Record<SupportedLocale, () => Promise<string>> = {
  en: async () => (await import('./countries/en.msgpack?url')).default,
  nl: async () => (await import('./countries/nl.msgpack?url')).default,
  de: async () => (await import('./countries/de.msgpack?url')).default,
  fr: async () => (await import('./countries/fr.msgpack?url')).default,
  es: async () => (await import('./countries/es.msgpack?url')).default,
  it: async () => (await import('./countries/it.msgpack?url')).default
};

async function loadCountryDataFromMsgpack(
  locale: SupportedLocale
): Promise<CountryEntry[]> {
  const assetUrl = await countryMsgpackLoaders[locale]();
  const response = await fetch(assetUrl);

  if (!response.ok) {
    throw new Error(`Failed to load country data for locale "${locale}"`);
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  return decode(bytes) as CountryEntry[];
}

/**
 * Lazily loads the country list for the given locale.
 * The result is cached so each locale file is only fetched once.
 *
 * To add a new locale, add its key to SUPPORTED_LOCALES and a corresponding
 * then place the locale JSON source file at `src/_lib/countries/<locale>.json`
 * and re-generate MessagePack assets with `npm run countries:pack`.
 */
export async function loadCountries(locale: string): Promise<CountryEntry[]> {
  const key: SupportedLocale = isSupportedLocale(locale) ? locale : 'en';

  if (cache.has(key)) {
    return cache.get(key)!;
  }

  const data = await loadCountryDataFromMsgpack(key);

  cache.set(key, data);
  return data;
}
