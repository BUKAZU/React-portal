import { encode } from '@msgpack/msgpack';

describe('loadCountries', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('loads and caches country data', async () => {
    const countries = [{ name: 'Netherlands', alpha2: 'NL' }];
    const packed = encode(countries);
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () =>
        packed.buffer.slice(
          packed.byteOffset,
          packed.byteOffset + packed.byteLength
        )
    });

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
      writable: true
    });

    const { loadCountries } = await import('../countries');

    const firstLoad = await loadCountries('nl');
    const secondLoad = await loadCountries('nl');

    expect(firstLoad).toEqual(countries);
    expect(secondLoad).toEqual(countries);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('falls back to English for unsupported locales', async () => {
    const countries = [{ name: 'United Kingdom', alpha2: 'GB' }];
    const packed = encode(countries);
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () =>
        packed.buffer.slice(
          packed.byteOffset,
          packed.byteOffset + packed.byteLength
        )
    });

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
      writable: true
    });

    const { loadCountries } = await import('../countries');
    const result = await loadCountries('sv');

    expect(result).toEqual(countries);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('throws when MessagePack asset cannot be fetched', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      arrayBuffer: async () => new ArrayBuffer(0)
    });

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
      writable: true
    });

    const { loadCountries } = await import('../countries');

    await expect(loadCountries('en')).rejects.toThrow(
      'Failed to load country data for locale "en"'
    );
  });
});
