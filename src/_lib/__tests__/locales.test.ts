import {
  isSupportedLocale,
  resolveSupportedLocale,
  SUPPORTED_LOCALES
} from '../locales';

describe('locales helpers', () => {
  it('lists the expected locales', () => {
    expect(SUPPORTED_LOCALES).toEqual(['en', 'nl', 'de', 'fr', 'es', 'it']);
  });

  it('detects supported locales', () => {
    expect(isSupportedLocale('nl')).toBe(true);
    expect(isSupportedLocale('sv')).toBe(false);
  });

  it('falls back to english for unsupported locales', () => {
    expect(resolveSupportedLocale('sv')).toBe('en');
    expect(resolveSupportedLocale('de')).toBe('de');
  });
});
