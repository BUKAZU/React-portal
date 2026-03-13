import { format, parse, Locale } from 'date-fns';
import { enGB } from 'date-fns/locale/en-GB';
import { LocaleType } from '../types';

// enGB is always available as a synchronous fallback; all other locales are
// loaded on demand so they are excluded from the initial bundle.
const localeCache: Partial<Record<LocaleType, Locale>> = {
  en: enGB
};

/**
 * Lazily loads the date-fns locale for the given locale ID and caches it.
 * Call this at application startup with the active locale so that the
 * correct locale is available by the time FormatIntl is invoked on
 * subsequent renders.  Safe to call multiple times – it is a no-op if the
 * locale is already cached.
 */
async function loadLocale(localeId: LocaleType): Promise<void> {
  if (localeCache[localeId]) {
    return;
  }
  try {
    switch (localeId) {
      case 'nl': {
        const { nl } = await import('date-fns/locale/nl');
        localeCache['nl'] = nl;
        break;
      }
      case 'de': {
        const { de } = await import('date-fns/locale/de');
        localeCache['de'] = de;
        break;
      }
      case 'fr': {
        const { fr } = await import('date-fns/locale/fr');
        localeCache['fr'] = fr;
        break;
      }
      case 'it': {
        const { it } = await import('date-fns/locale/it');
        localeCache['it'] = it;
        break;
      }
      case 'es': {
        const { es } = await import('date-fns/locale/es');
        localeCache['es'] = es;
        break;
      }
      default:
        // 'en' is already in the cache; nothing to do.
        return;
    }
  } catch (err) {
    // If loading fails FormatIntl will fall back to enGB.
    console.error(`Failed to load date-fns locale "${localeId}":`, err);
  }
}

function FormatIntl(date: number, formatStr: string): string {
  const localeId = (
    typeof window !== 'undefined' ? window.__localeId__ : undefined
  ) as LocaleType | undefined;
  const locale =
    (localeId && localeCache[localeId]) || localeCache['en'] || enGB;
  return format(date, formatStr, { locale });
}

function Parse_EN_US(date_string: string) {
  return parse(date_string, 'yyyy-MM-dd', new Date());
}

const MONTH_FORMAT: string = 'MMMM yyyy';
const LONG_DATE_FORMAT: string = 'EEEE dd MMMM yyyy';

export { FormatIntl, Parse_EN_US, MONTH_FORMAT, LONG_DATE_FORMAT, loadLocale };
