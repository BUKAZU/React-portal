import { normalizeLocale } from '../locale';

describe('normalizeLocale', () => {
  it('returns supported locale codes unchanged', () => {
    expect(normalizeLocale('en')).toBe('en');
    expect(normalizeLocale('nl')).toBe('nl');
    expect(normalizeLocale('de')).toBe('de');
    expect(normalizeLocale('fr')).toBe('fr');
    expect(normalizeLocale('es')).toBe('es');
    expect(normalizeLocale('it')).toBe('it');
  });

  it('normalizes BCP-47 codes with a hyphen-separated region subtag', () => {
    expect(normalizeLocale('en-US')).toBe('en');
    expect(normalizeLocale('en-GB')).toBe('en');
    expect(normalizeLocale('nl-NL')).toBe('nl');
    expect(normalizeLocale('de-DE')).toBe('de');
    expect(normalizeLocale('fr-FR')).toBe('fr');
    expect(normalizeLocale('es-ES')).toBe('es');
    expect(normalizeLocale('it-IT')).toBe('it');
  });

  it('normalizes BCP-47 codes with an underscore-separated region subtag', () => {
    expect(normalizeLocale('en_US')).toBe('en');
    expect(normalizeLocale('nl_NL')).toBe('nl');
    expect(normalizeLocale('de_DE')).toBe('de');
  });

  it('is case-insensitive', () => {
    expect(normalizeLocale('EN')).toBe('en');
    expect(normalizeLocale('NL')).toBe('nl');
    expect(normalizeLocale('EN-US')).toBe('en');
  });

  it('falls back to "en" for unsupported language codes', () => {
    expect(normalizeLocale('pt')).toBe('en');
    expect(normalizeLocale('ja')).toBe('en');
    expect(normalizeLocale('zh-CN')).toBe('en');
    expect(normalizeLocale('ar')).toBe('en');
  });

  it('falls back to "en" for null, undefined or empty string', () => {
    expect(normalizeLocale(null)).toBe('en');
    expect(normalizeLocale(undefined)).toBe('en');
    expect(normalizeLocale('')).toBe('en');
  });
});

