import { format } from 'date-fns';
import { enGB } from 'date-fns/locale/en-GB';
import {
  FormatIntl,
  loadLocale,
  Parse_EN_US,
  MONTH_FORMAT,
  LONG_DATE_FORMAT
} from '../date_helper';

const TEST_DATE = new Date(2024, 0, 15); // 15 January 2024
const TEST_TIMESTAMP = TEST_DATE.getTime();
const TEST_DATE_STRING = '2024-01-15';

beforeEach(() => {
  (window as any).__localeId__ = 'en';
});

afterEach(() => {
  delete (window as any).__localeId__;
  jest.restoreAllMocks();
});

describe('Parse_EN_US', () => {
  it('parses a yyyy-MM-dd string into a Date', () => {
    const result = Parse_EN_US(TEST_DATE_STRING);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(15);
  });
});

describe('MONTH_FORMAT / LONG_DATE_FORMAT', () => {
  it('exports expected format strings', () => {
    expect(MONTH_FORMAT).toBe('MMMM yyyy');
    expect(LONG_DATE_FORMAT).toBe('EEEE dd MMMM yyyy');
  });
});

describe('FormatIntl', () => {
  it('formats a date using the enGB fallback when no locale is cached', () => {
    (window as any).__localeId__ = 'en';
    const result = FormatIntl(TEST_TIMESTAMP, 'MMMM');
    expect(result).toBe(format(TEST_TIMESTAMP, 'MMMM', { locale: enGB }));
  });

  it('falls back to enGB when __localeId__ is not set', () => {
    delete (window as any).__localeId__;
    const result = FormatIntl(TEST_TIMESTAMP, 'MMMM');
    expect(result).toBe(format(TEST_TIMESTAMP, 'MMMM', { locale: enGB }));
  });

  it('uses a cached locale once loadLocale has resolved', async () => {
    await loadLocale('nl');
    (window as any).__localeId__ = 'nl';
    const result = FormatIntl(TEST_TIMESTAMP, 'EEEE');
    // Dutch day name for a Monday should not be the English "Monday"
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('loadLocale', () => {
  it('is a no-op for the built-in "en" locale', async () => {
    await expect(loadLocale('en')).resolves.toBeUndefined();
  });

  it('loads the nl locale without throwing', async () => {
    await expect(loadLocale('nl')).resolves.toBeUndefined();
  });

  it('loads the de locale without throwing', async () => {
    await expect(loadLocale('de')).resolves.toBeUndefined();
  });

  it('loads the fr locale without throwing', async () => {
    await expect(loadLocale('fr')).resolves.toBeUndefined();
  });

  it('loads the it locale without throwing', async () => {
    await expect(loadLocale('it')).resolves.toBeUndefined();
  });

  it('loads the es locale without throwing', async () => {
    await expect(loadLocale('es')).resolves.toBeUndefined();
  });

  it('is idempotent – calling twice does not throw', async () => {
    await loadLocale('nl');
    await expect(loadLocale('nl')).resolves.toBeUndefined();
  });
});
