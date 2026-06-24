import {
  FormatIntl,
  loadLocale,
  Parse_EN_US,
  MONTH_FORMAT,
  LONG_DATE_FORMAT,
  formatDateKey,
  addDays,
  subDays,
  addMonths,
  subMonths,
  addYears,
  subYears,
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
} from '../date_helper';

const TEST_DATE = new Date(2024, 0, 15); // 15 January 2024 (Monday)
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
  it('parses a yyyy-MM-dd string into a local-time Date', () => {
    const result = Parse_EN_US(TEST_DATE_STRING);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(15);
  });

  it('returns midnight local time (no UTC offset issue)', () => {
    const result = Parse_EN_US('2024-01-15');
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
  });
});

describe('formatDateKey', () => {
  it('formats a date as yyyy-MM-dd', () => {
    expect(formatDateKey(TEST_DATE)).toBe('2024-01-15');
  });

  it('zero-pads single-digit month and day', () => {
    expect(formatDateKey(new Date(2024, 2, 5))).toBe('2024-03-05');
  });
});

describe('MONTH_FORMAT / LONG_DATE_FORMAT', () => {
  it('MONTH_FORMAT is an Intl.DateTimeFormatOptions object with month and year', () => {
    expect(MONTH_FORMAT).toEqual(
      expect.objectContaining({ month: 'long', year: 'numeric' })
    );
  });

  it('LONG_DATE_FORMAT is an Intl.DateTimeFormatOptions object with weekday, day, month, year', () => {
    expect(LONG_DATE_FORMAT).toEqual(
      expect.objectContaining({
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    );
  });
});

describe('FormatIntl', () => {
  it('formats a month name using the en-GB locale', () => {
    (window as any).__localeId__ = 'en';
    const result = FormatIntl(TEST_TIMESTAMP, { month: 'long' });
    expect(result).toBe('January');
  });

  it('falls back to en-GB when __localeId__ is not set', () => {
    delete (window as any).__localeId__;
    const result = FormatIntl(TEST_TIMESTAMP, { month: 'long' });
    expect(result).toBe('January');
  });

  it('formats a day number', () => {
    const result = FormatIntl(TEST_DATE, { day: 'numeric' });
    expect(result).toBe('15');
  });

  it('uses the nl-NL locale when __localeId__ is nl', () => {
    (window as any).__localeId__ = 'nl';
    // In nl-NL, January is "januari"
    const result = FormatIntl(TEST_TIMESTAMP, { month: 'long' });
    expect(result).toBe('januari');
  });

  it('uses the de-DE locale when __localeId__ is de', () => {
    (window as any).__localeId__ = 'de';
    const result = FormatIntl(TEST_TIMESTAMP, { month: 'long' });
    expect(result).toBe('Januar');
  });
});

describe('loadLocale', () => {
  it('is a no-op for the built-in "en" locale', async () => {
    await expect(loadLocale('en')).resolves.toBeUndefined();
  });

  it('resolves for nl without throwing', async () => {
    await expect(loadLocale('nl')).resolves.toBeUndefined();
  });

  it('resolves for de without throwing', async () => {
    await expect(loadLocale('de')).resolves.toBeUndefined();
  });

  it('resolves for fr without throwing', async () => {
    await expect(loadLocale('fr')).resolves.toBeUndefined();
  });

  it('resolves for it without throwing', async () => {
    await expect(loadLocale('it')).resolves.toBeUndefined();
  });

  it('resolves for es without throwing', async () => {
    await expect(loadLocale('es')).resolves.toBeUndefined();
  });

  it('is idempotent – calling twice does not throw', async () => {
    await loadLocale('nl');
    await expect(loadLocale('nl')).resolves.toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Date arithmetic helpers
// ---------------------------------------------------------------------------

describe('addDays / subDays', () => {
  it('adds days correctly', () => {
    const result = addDays(new Date(2024, 0, 15), 3);
    expect(result.getDate()).toBe(18);
    expect(result.getMonth()).toBe(0);
  });

  it('crosses a month boundary when adding days', () => {
    const result = addDays(new Date(2024, 0, 30), 5);
    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(4);
  });

  it('subtracts days correctly', () => {
    const result = subDays(new Date(2024, 0, 15), 3);
    expect(result.getDate()).toBe(12);
  });

  it('does not mutate the original date', () => {
    const original = new Date(2024, 0, 15);
    addDays(original, 5);
    expect(original.getDate()).toBe(15);
  });
});

describe('addMonths / subMonths', () => {
  it('adds months correctly', () => {
    const result = addMonths(new Date(2024, 0, 15), 2);
    expect(result.getMonth()).toBe(2);
    expect(result.getFullYear()).toBe(2024);
  });

  it('clamps to the end of the target month when needed (leap year)', () => {
    const result = addMonths(new Date(2024, 0, 31), 1);
    expect(formatDateKey(result)).toBe('2024-02-29');
  });

  it('clamps to the end of the target month when needed (non-leap year)', () => {
    const result = addMonths(new Date(2023, 0, 31), 1);
    expect(formatDateKey(result)).toBe('2023-02-28');
  });

  it('crosses a year boundary when adding months', () => {
    const result = addMonths(new Date(2024, 11, 15), 1);
    expect(result.getMonth()).toBe(0);
    expect(result.getFullYear()).toBe(2025);
  });

  it('subtracts months correctly', () => {
    const result = subMonths(new Date(2024, 2, 15), 2);
    expect(result.getMonth()).toBe(0);
  });
});

describe('addYears / subYears', () => {
  it('adds years correctly', () => {
    const result = addYears(new Date(2024, 0, 15), 1);
    expect(result.getFullYear()).toBe(2025);
  });

  it('clamps Feb 29 to Feb 28 when the target year is not a leap year', () => {
    const result = addYears(new Date(2024, 1, 29), 1);
    expect(formatDateKey(result)).toBe('2025-02-28');
  });

  it('subtracts years correctly', () => {
    const result = subYears(new Date(2024, 0, 15), 18);
    expect(result.getFullYear()).toBe(2006);
  });
});

describe('startOfToday', () => {
  it('returns today with time zeroed', () => {
    const today = startOfToday();
    const now = new Date();
    expect(today.getFullYear()).toBe(now.getFullYear());
    expect(today.getMonth()).toBe(now.getMonth());
    expect(today.getDate()).toBe(now.getDate());
    expect(today.getHours()).toBe(0);
    expect(today.getMinutes()).toBe(0);
    expect(today.getSeconds()).toBe(0);
  });
});

describe('startOfMonth / endOfMonth', () => {
  it('startOfMonth returns first day of month', () => {
    const result = startOfMonth(new Date(2024, 0, 15));
    expect(result.getDate()).toBe(1);
    expect(result.getMonth()).toBe(0);
    expect(result.getFullYear()).toBe(2024);
  });

  it('endOfMonth returns last day of month', () => {
    const result = endOfMonth(new Date(2024, 0, 15));
    expect(result.getDate()).toBe(31);
    expect(result.getMonth()).toBe(0);
  });

  it('endOfMonth handles February in a leap year', () => {
    const result = endOfMonth(new Date(2024, 1, 1));
    expect(result.getDate()).toBe(29);
  });
});

describe('startOfWeek / endOfWeek', () => {
  it('startOfWeek returns the preceding Sunday', () => {
    // 2024-01-15 is a Monday → preceding Sunday is 2024-01-14
    const result = startOfWeek(new Date(2024, 0, 15));
    expect(result.getDay()).toBe(0); // Sunday
    expect(result.getDate()).toBe(14);
  });

  it('startOfWeek on a Sunday returns the same day', () => {
    const sunday = new Date(2024, 0, 14); // 14 Jan 2024 is a Sunday
    const result = startOfWeek(sunday);
    expect(result.getDate()).toBe(14);
    expect(result.getDay()).toBe(0);
  });

  it('endOfWeek returns the following Saturday', () => {
    const result = endOfWeek(new Date(2024, 0, 15));
    expect(result.getDay()).toBe(6); // Saturday
    expect(result.getDate()).toBe(20);
  });
});

describe('isSameDay', () => {
  it('returns true for the same date', () => {
    expect(isSameDay(new Date(2024, 0, 15), new Date(2024, 0, 15))).toBe(true);
  });

  it('returns true regardless of time component', () => {
    expect(
      isSameDay(new Date(2024, 0, 15, 0, 0), new Date(2024, 0, 15, 23, 59))
    ).toBe(true);
  });

  it('returns false for different dates', () => {
    expect(isSameDay(new Date(2024, 0, 15), new Date(2024, 0, 16))).toBe(false);
  });
});

describe('isSameMonth', () => {
  it('returns true for dates in the same month', () => {
    expect(isSameMonth(new Date(2024, 0, 1), new Date(2024, 0, 31))).toBe(true);
  });

  it('returns false for dates in different months', () => {
    expect(isSameMonth(new Date(2024, 0, 31), new Date(2024, 1, 1))).toBe(
      false
    );
  });
});

describe('isAfter / isBefore', () => {
  const earlier = new Date(2024, 0, 10);
  const later = new Date(2024, 0, 20);

  it('isAfter returns true when first date is later', () => {
    expect(isAfter(later, earlier)).toBe(true);
  });

  it('isAfter returns false when first date is earlier', () => {
    expect(isAfter(earlier, later)).toBe(false);
  });

  it('isAfter returns false for equal dates', () => {
    expect(isAfter(earlier, new Date(earlier.getTime()))).toBe(false);
  });

  it('isBefore returns true when first date is earlier', () => {
    expect(isBefore(earlier, later)).toBe(true);
  });

  it('isBefore returns false when first date is later', () => {
    expect(isBefore(later, earlier)).toBe(false);
  });
});

describe('differenceInCalendarDays', () => {
  it('returns positive days when first date is after second', () => {
    expect(
      differenceInCalendarDays(new Date(2024, 0, 20), new Date(2024, 0, 15))
    ).toBe(5);
  });

  it('returns negative days when first date is before second', () => {
    expect(
      differenceInCalendarDays(new Date(2024, 0, 10), new Date(2024, 0, 15))
    ).toBe(-5);
  });

  it('returns 0 for the same day', () => {
    expect(
      differenceInCalendarDays(new Date(2024, 0, 15), new Date(2024, 0, 15))
    ).toBe(0);
  });

  it('ignores time component', () => {
    const a = new Date(2024, 0, 16, 23, 59);
    const b = new Date(2024, 0, 15, 0, 0);
    expect(differenceInCalendarDays(a, b)).toBe(1);
  });
});
