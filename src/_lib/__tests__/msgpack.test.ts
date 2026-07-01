import { encode } from '@msgpack/msgpack';

describe('loadDecodedMsgpack', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('loads and decodes MessagePack data', async () => {
    const payload = { greeting: 'Hallo' };
    const packed = encode(payload);
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

    const { loadDecodedMsgpack } = await import('../msgpack');
    const result = await loadDecodedMsgpack<typeof payload>(
      '/mocked-asset-url',
      'failed'
    );

    expect(result).toEqual(payload);
  });

  it('throws with the provided error message when fetch fails', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      arrayBuffer: async () => new ArrayBuffer(0)
    });

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
      writable: true
    });

    const { loadDecodedMsgpack } = await import('../msgpack');

    await expect(
      loadDecodedMsgpack('/mocked-asset-url', 'custom failure')
    ).rejects.toThrow('custom failure');
  });
});
