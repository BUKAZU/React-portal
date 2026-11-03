import {
  normalizeCurrencies,
  readStoredCurrency,
  storeCurrency
} from '../currencies';

describe('normalizeCurrencies', () => {
  it('falls back to single-currency EUR when the field is absent (older backends)', () => {
    expect(normalizeCurrencies(undefined)).toEqual({
      multi_currency: false,
      default: 'EUR',
      allowed: ['EUR']
    });
    expect(normalizeCurrencies(null)).toEqual({
      multi_currency: false,
      default: 'EUR',
      allowed: ['EUR']
    });
  });

  it('passes a complete configuration through', () => {
    expect(
      normalizeCurrencies({
        multi_currency: true,
        default: 'EUR',
        allowed: ['USD', 'EUR']
      })
    ).toEqual({
      multi_currency: true,
      default: 'EUR',
      allowed: ['USD', 'EUR']
    });
  });

  it('always includes the default in the allowed list', () => {
    expect(
      normalizeCurrencies({
        multi_currency: true,
        default: 'EUR',
        allowed: ['USD']
      }).allowed
    ).toEqual(['USD', 'EUR']);
  });

  it('drops duplicates and empty entries from the allowed list', () => {
    expect(
      normalizeCurrencies({
        multi_currency: true,
        default: 'EUR',
        allowed: ['USD', 'USD', '', 'EUR']
      }).allowed
    ).toEqual(['USD', 'EUR']);
  });

  it('tolerates partial input', () => {
    expect(normalizeCurrencies({ multi_currency: true })).toEqual({
      multi_currency: true,
      default: 'EUR',
      allowed: ['EUR']
    });
    expect(normalizeCurrencies({ default: '' }).default).toBe('EUR');
    expect(
      normalizeCurrencies({ allowed: 'USD' as unknown as string[] }).allowed
    ).toEqual(['EUR']);
  });
});

describe('stored currency', () => {
  afterEach(() => {
    window.localStorage.clear();
    jest.restoreAllMocks();
  });

  it('round-trips the visitor choice through localStorage', () => {
    expect(readStoredCurrency()).toBeNull();
    storeCurrency('USD');
    expect(readStoredCurrency()).toBe('USD');
  });

  it('treats a throwing storage as empty', () => {
    jest
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation(() => {
        throw new Error('blocked');
      });
    jest
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('blocked');
      });

    expect(readStoredCurrency()).toBeNull();
    expect(() => {
      storeCurrency('USD');
    }).not.toThrow();
  });
});
