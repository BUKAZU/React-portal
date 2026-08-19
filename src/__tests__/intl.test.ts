import { encode } from '@msgpack/msgpack';

describe('intl MessagePack translations', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    window.__localeId__ = 'en';
  });

  it('loads and caches locale translations from MessagePack', async () => {
    const messages = { greeting: 'Hallo' };
    const packed = encode(messages);
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

    const intl = await import('../intl');

    await intl.loadTranslations('nl');
    await intl.loadTranslations('nl');
    window.__localeId__ = 'nl';

    expect(intl.t('greeting')).toBe('Hallo');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('falls back to english when locale is unsupported', async () => {
    const fetchMock = jest.fn();
    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
      writable: true
    });

    const intl = await import('../intl');
    await intl.loadTranslations('sv');

    expect(intl.t('something_went_wrong_please_try_again')).toBe(
      'Oops, something went wrong, please try again later.'
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns english fallback when translation fetch fails', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      arrayBuffer: async () => new ArrayBuffer(0)
    });

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
      writable: true
    });

    const intl = await import('../intl');
    await intl.loadTranslations('nl');
    window.__localeId__ = 'nl';

    expect(intl.t('something_went_wrong_please_try_again')).toBe(
      'Oops, something went wrong, please try again later.'
    );
  });

  it('deduplicates concurrent requests for the same locale', async () => {
    const messages = { greeting: 'Hallo' };
    const packed = encode(messages);
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

    const intl = await import('../intl');
    const [first, second] = await Promise.all([
      intl.loadTranslations('nl'),
      intl.loadTranslations('nl')
    ]);

    expect(first).toEqual(messages);
    expect(second).toEqual(messages);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('returns english fallback when fetch is unavailable', async () => {
    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: undefined,
      writable: true
    });

    const intl = await import('../intl');
    await intl.loadTranslations('nl');
    window.__localeId__ = 'nl';

    expect(intl.t('something_went_wrong_please_try_again')).toBe(
      'Oops, something went wrong, please try again later.'
    );
  });
});
