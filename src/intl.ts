import { decode } from '@msgpack/msgpack';
import en from './locales/en.json';

type Messages = { [key: string]: string };

const SUPPORTED_LOCALES = ['en', 'nl', 'de', 'fr', 'es', 'it'] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

function isSupportedLocale(locale: string): locale is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(locale);
}

const messages = new Map<SupportedLocale, Messages>([['en', en]]);
const loadingPromises = new Map<SupportedLocale, Promise<Messages>>();

const localeMsgpackLoaders: Record<SupportedLocale, () => Promise<string>> = {
  en: async () => (await import('./locales/en.msgpack?url')).default,
  nl: async () => (await import('./locales/nl.msgpack?url')).default,
  de: async () => (await import('./locales/de.msgpack?url')).default,
  fr: async () => (await import('./locales/fr.msgpack?url')).default,
  es: async () => (await import('./locales/es.msgpack?url')).default,
  it: async () => (await import('./locales/it.msgpack?url')).default
};

async function loadMessagesFromMsgpack(
  locale: SupportedLocale
): Promise<Messages> {
  if (typeof fetch !== 'function') {
    return messages.get('en') ?? {};
  }

  const assetUrl = await localeMsgpackLoaders[locale]();
  const response = await fetch(assetUrl);

  if (!response.ok) {
    throw new Error(`Failed to load translations for locale "${locale}"`);
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  return decode(bytes) as Messages;
}

export async function loadTranslations(locale: string): Promise<Messages> {
  const key: SupportedLocale = isSupportedLocale(locale) ? locale : 'en';
  const cachedMessages = messages.get(key);

  if (cachedMessages) {
    return cachedMessages;
  }

  const inFlight = loadingPromises.get(key);
  if (inFlight) {
    return inFlight;
  }

  const loadingPromise = loadMessagesFromMsgpack(key)
    .then((loadedMessages) => {
      messages.set(key, loadedMessages);
      return loadedMessages;
    })
    .catch(() => messages.get('en') ?? {})
    .finally(() => {
      loadingPromises.delete(key);
    });

  loadingPromises.set(key, loadingPromise);
  return loadingPromise;
}

export function t(
  id: string,
  values?: Record<string, string | number>
): string {
  const locale = (typeof window !== 'undefined' && window.__localeId__) || 'en';
  const key: SupportedLocale = isSupportedLocale(locale) ? locale : 'en';
  const localeMessages = messages.get(key) ?? messages.get('en') ?? {};

  if (!messages.has(key)) {
    void loadTranslations(key);
  }

  let message = localeMessages[id] || id;

  if (values) {
    Object.entries(values).forEach(([key, value]) => {
      message = message.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
    });
  }

  return message;
}

export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions
): string {
  const locale = (typeof window !== 'undefined' && window.__localeId__) || 'en';
  return new Intl.NumberFormat(locale, options).format(value);
}

export function useLocale() {
  return {
    formatMessage: (
      descriptor: { id: string },
      values?: Record<string, string | number>
    ) => t(descriptor.id, values)
  };
}

void loadTranslations('en');
