import { LocaleType } from '../types';

/** Maps app locale IDs to BCP-47 language tags for Intl APIs. */
const BCP47_LOCALE: Record<LocaleType, string> = {
  en: 'en-GB',
  nl: 'nl-NL',
  de: 'de-DE',
  fr: 'fr-FR',
  it: 'it-IT',
  es: 'es-ES'
};

function getLocaleString(): string {
  const localeId = (
    typeof window !== 'undefined' ? window.__localeId__ : undefined
  ) as LocaleType | undefined;
  return (localeId && BCP47_LOCALE[localeId]) ?? 'en-GB';
}

/**
 * No-op kept for backward compatibility.  Previously this lazily loaded
 * date-fns locale modules; with Intl.DateTimeFormat the browser/engine
 * handles locale data natively so no pre-loading is required.
 */
async function loadLocale(_localeId: LocaleType): Promise<void> {
  // Nothing to load – Intl.DateTimeFormat resolves locales at call time.
}

/**
 * Formats a date using the locale stored in `window.__localeId__`,
 * falling back to en-GB when the locale is absent or unrecognised.
 *
 * Pass an `Intl.DateTimeFormatOptions` object to control the output:
 *
 * ```ts
 * // Month name + year  →  "January 2024"
 * FormatIntl(date, { month: 'long', year: 'numeric' });
 *
 * // Short weekday name  →  "Mon"
 * FormatIntl(date, { weekday: 'short' });
 *
 * // Day of month  →  "15"
 * FormatIntl(date, { day: 'numeric' });
 * ```
 *
 * To produce a locale-independent `yyyy-MM-dd` key string, use
 * `formatDateKey(date)` instead.
 */
const DATE_TIME_FORMAT_CACHE = new Map<string, Intl.DateTimeFormat>();

function FormatIntl(
  date: Date | number,
  options: Intl.DateTimeFormatOptions
): string {
  const locale = getLocaleString();
  const cacheKey = `${locale}:${JSON.stringify(options)}`;

  let formatter = DATE_TIME_FORMAT_CACHE.get(cacheKey);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    DATE_TIME_FORMAT_CACHE.set(cacheKey, formatter);
  }

  return formatter.format(date);
}

/**
 * Parses a `yyyy-MM-dd` string into a local-time Date.
 * Unlike `new Date(string)`, this avoids UTC-midnight off-by-one errors in
 * non-UTC timezones.
 */
function Parse_EN_US(date_string: string): Date {
  const [year, month, day] = date_string.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Formats a Date as a `yyyy-MM-dd` local-date key string (e.g. "2024-01-15").
 * Suitable for use as React keys or for matching availability date strings.
 */
function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// ---------------------------------------------------------------------------
// Date arithmetic helpers (replacements for the date-fns functions previously
// used directly in calendar components and booking helpers).
// ---------------------------------------------------------------------------

function addDays(date: Date, amount: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + amount);
  return d;
}

function subDays(date: Date, amount: number): Date {
  return addDays(date, -amount);
}

function addMonths(date: Date, amount: number): Date {
  const d = new Date(date);
  const dayOfMonth = d.getDate();

  // Prevent month overflow (e.g. Jan 31 + 1 month) from skipping months.
  d.setDate(1);
  d.setMonth(d.getMonth() + amount);

  const daysInTargetMonth = new Date(
    d.getFullYear(),
    d.getMonth() + 1,
    0
  ).getDate();

  d.setDate(Math.min(dayOfMonth, daysInTargetMonth));
  return d;
}

function subMonths(date: Date, amount: number): Date {
  return addMonths(date, -amount);
}

function addYears(date: Date, amount: number): Date {
  const d = new Date(date);
  const month = d.getMonth();
  const dayOfMonth = d.getDate();

  // Prevent overflow on dates like Feb 29 when the target year is not a leap year.
  d.setDate(1);
  d.setFullYear(d.getFullYear() + amount);
  d.setMonth(month);

  const daysInTargetMonth = new Date(
    d.getFullYear(),
    d.getMonth() + 1,
    0
  ).getDate();

  d.setDate(Math.min(dayOfMonth, daysInTargetMonth));
  return d;
}

function subYears(date: Date, amount: number): Date {
  return addYears(date, -amount);
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfToday(): Date {
  return startOfDay(new Date());
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
 * Returns the Sunday that starts the calendar week containing `date`.
 * Matches date-fns default (weekStartsOn: 0).
 */
function startOfWeek(date: Date): Date {
  const d = startOfDay(date);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function endOfWeek(date: Date): Date {
  const d = startOfDay(date);
  d.setDate(d.getDate() + (6 - d.getDay()));
  return d;
}

function isSameDay(dateLeft: Date, dateRight: Date): boolean {
  return (
    dateLeft.getFullYear() === dateRight.getFullYear() &&
    dateLeft.getMonth() === dateRight.getMonth() &&
    dateLeft.getDate() === dateRight.getDate()
  );
}

function isSameMonth(dateLeft: Date, dateRight: Date): boolean {
  return (
    dateLeft.getFullYear() === dateRight.getFullYear() &&
    dateLeft.getMonth() === dateRight.getMonth()
  );
}

function isAfter(date: Date, dateToCompare: Date): boolean {
  return date.getTime() > dateToCompare.getTime();
}

function isBefore(date: Date, dateToCompare: Date): boolean {
  return date.getTime() < dateToCompare.getTime();
}

/**
 * Returns the number of full calendar days between two dates (ignores time).
 * Positive when `dateLeft` is after `dateRight`, negative when before.
 */
function differenceInCalendarDays(dateLeft: Date, dateRight: Date): number {
  const left = startOfDay(dateLeft).getTime();
  const right = startOfDay(dateRight).getTime();
  return Math.round((left - right) / (24 * 60 * 60 * 1000));
}

// ---------------------------------------------------------------------------
// Format-options constants (replaces the old date-fns format strings).
// ---------------------------------------------------------------------------

const MONTH_FORMAT: Intl.DateTimeFormatOptions = {
  month: 'long',
  year: 'numeric'
};
const LONG_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  year: 'numeric'
};
const REVIEW_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
};

/**
 * Formats a `yyyy-MM-dd` date string for display in review-related UI.
 * Uses the app locale (`window.__localeId__`) with an `en-GB` fallback so
 * the output is stable across timezones (no UTC off-by-one) and consistent
 * with the rest of the app.
 */
function formatReviewDate(date: string): string {
  // The API may return a full ISO datetime; Parse_EN_US only handles yyyy-MM-dd.
  return FormatIntl(Parse_EN_US(date.slice(0, 10)), REVIEW_DATE_FORMAT);
}

export {
  FormatIntl,
  Parse_EN_US,
  formatDateKey,
  formatReviewDate,
  MONTH_FORMAT,
  LONG_DATE_FORMAT,
  REVIEW_DATE_FORMAT,
  loadLocale,
  // date arithmetic
  addDays,
  subDays,
  addMonths,
  subMonths,
  addYears,
  subYears,
  startOfDay,
  startOfToday,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameDay,
  isSameMonth,
  isAfter,
  isBefore,
  differenceInCalendarDays
};
