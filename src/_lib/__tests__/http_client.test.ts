/**
 * @jest-environment node
 *
 * This file runs in the Node environment so that the WHATWG Fetch API globals
 * (`Response`, `Request`, `Headers`, `fetch`) are available without polyfills.
 * ky is built on these globals and needs them to behave correctly in tests.
 */
import { http, clearCache, parseResponse } from '../http_client';
import { encode } from '@msgpack/msgpack';

const TEST_URL = 'https://api.bukazu.com/test-endpoint';

// Save and restore global.fetch around each test.
let savedFetch: typeof globalThis.fetch;

beforeAll(() => {
  savedFetch = globalThis.fetch;
});

afterAll(() => {
  globalThis.fetch = savedFetch;
});

beforeEach(() => {
  clearCache();
  jest.clearAllMocks();
});

/** Helper: create a Response that ky will treat as a proper Response instance. */
function makeResponse(
  body: string | null,
  status: number,
  headers: Record<string, string> = {}
): Response {
  return new Response(body, { status, headers });
}

function makeMsgpackResponse(data: unknown, status = 200): Response {
  const encoded = encode(data);
  return new Response(encoded, {
    status,
    headers: { 'Content-Type': 'application/msgpack' }
  });
}

describe('http_client', () => {
  describe('Accept header', () => {
    it('sends Accept: application/msgpack by default (USE_JSON = false)', async () => {
      const fetchMock = jest.fn().mockResolvedValue(
        makeMsgpackResponse({ ok: true })
      );
      globalThis.fetch = fetchMock;

      await http.get(TEST_URL);

      const request: Request = fetchMock.mock.calls[0][0];
      expect(request.headers.get('Accept')).toBe('application/msgpack');
    });
  });

  describe('parseResponse', () => {
    it('decodes a JSON response', async () => {
      const payload = { hello: 'world' };
      const response = makeResponse(JSON.stringify(payload), 200, {
        'Content-Type': 'application/json'
      });
      const result = await parseResponse<typeof payload>(response);
      expect(result).toEqual(payload);
    });

    it('decodes a msgpack response', async () => {
      const payload = { hello: 'world', n: 42 };
      const response = makeMsgpackResponse(payload);
      const result = await parseResponse<typeof payload>(response);
      expect(result).toEqual(payload);
    });
  });

  describe('first request – no conditional headers', () => {
    it('does not send If-None-Match or If-Modified-Since on a fresh URL', async () => {
      const fetchMock = jest.fn().mockResolvedValue(
        makeMsgpackResponse({ data: 'hello' })
      );
      globalThis.fetch = fetchMock;

      await http.get(TEST_URL);

      const request: Request = fetchMock.mock.calls[0][0];
      expect(request.headers.get('If-None-Match')).toBeNull();
      expect(request.headers.get('If-Modified-Since')).toBeNull();
    });
  });

  describe('ETag caching', () => {
    it('stores an ETag from the first response and sends it on the next request', async () => {
      const encoded = encode({ data: 'cached' });
      const fetchMock = jest
        .fn()
        .mockResolvedValueOnce(
          new Response(encoded, {
            status: 200,
            headers: { 'Content-Type': 'application/msgpack', ETag: '"v1"' }
          })
        )
        .mockResolvedValueOnce(
          new Response(encoded, {
            status: 200,
            headers: { 'Content-Type': 'application/msgpack' }
          })
        );
      globalThis.fetch = fetchMock;

      await http.get(TEST_URL);
      await http.get(TEST_URL);

      const secondRequest: Request = fetchMock.mock.calls[1][0];
      expect(secondRequest.headers.get('If-None-Match')).toBe('"v1"');
      expect(secondRequest.headers.get('If-Modified-Since')).toBeNull();
    });

    it('stores a Last-Modified from the first response and sends it on the next request', async () => {
      const encoded = encode({ data: 'modified' });
      const lastMod = 'Wed, 01 Jan 2025 00:00:00 GMT';
      const fetchMock = jest
        .fn()
        .mockResolvedValueOnce(
          new Response(encoded, {
            status: 200,
            headers: {
              'Content-Type': 'application/msgpack',
              'Last-Modified': lastMod
            }
          })
        )
        .mockResolvedValueOnce(
          new Response(encoded, {
            status: 200,
            headers: { 'Content-Type': 'application/msgpack' }
          })
        );
      globalThis.fetch = fetchMock;

      await http.get(TEST_URL);
      await http.get(TEST_URL);

      const secondRequest: Request = fetchMock.mock.calls[1][0];
      expect(secondRequest.headers.get('If-Modified-Since')).toBe(lastMod);
      expect(secondRequest.headers.get('If-None-Match')).toBeNull();
    });

    it('caches and replays a msgpack response body on 304', async () => {
      const payload = { data: 'msgpack-cached' };
      const encoded = encode(payload);
      const fetchMock = jest
        .fn()
        .mockResolvedValueOnce(
          new Response(encoded, {
            status: 200,
            headers: { 'Content-Type': 'application/msgpack', ETag: '"mp1"' }
          })
        )
        .mockResolvedValueOnce(new Response(null, { status: 304 }));
      globalThis.fetch = fetchMock;

      await http.get(TEST_URL);
      const response = await http.get(TEST_URL);
      const result = await parseResponse<typeof payload>(response);

      expect(result).toEqual(payload);
    });
  });

  describe('304 Not Modified – JSON fallback', () => {
    it('returns the cached JSON body as a 200 response when the server replies 304', async () => {
      const payload = JSON.stringify({ data: 'from-cache' });
      const fetchMock = jest
        .fn()
        .mockResolvedValueOnce(
          makeResponse(payload, 200, {
            'Content-Type': 'application/json',
            ETag: '"abc"'
          })
        )
        .mockResolvedValueOnce(makeResponse(null, 304, {}));
      globalThis.fetch = fetchMock;

      await http.get(TEST_URL);
      const response = await http.get(TEST_URL);
      const result = await parseResponse<{ data: string }>(response);

      expect(result).toEqual({ data: 'from-cache' });
    });
  });

  describe('non-2xx errors', () => {
    it('throws an HTTPError for 404 responses', async () => {
      const { HTTPError } = await import('ky');
      const fetchMock = jest
        .fn()
        .mockResolvedValue(makeResponse('Not Found', 404, {}));
      globalThis.fetch = fetchMock;

      await expect(http.get(TEST_URL)).rejects.toBeInstanceOf(HTTPError);
    });
  });

  describe('clearCache', () => {
    it('removes stored entries so the next request sends no conditional headers', async () => {
      const encoded = encode({ ok: true });
      const fetchMock = jest
        .fn()
        .mockResolvedValueOnce(
          new Response(encoded, {
            status: 200,
            headers: { 'Content-Type': 'application/msgpack', ETag: '"xyz"' }
          })
        )
        .mockResolvedValueOnce(
          new Response(encoded, {
            status: 200,
            headers: { 'Content-Type': 'application/msgpack' }
          })
        );
      globalThis.fetch = fetchMock;

      await http.get(TEST_URL);
      clearCache();
      await http.get(TEST_URL);

      const secondRequest: Request = fetchMock.mock.calls[1][0];
      expect(secondRequest.headers.get('If-None-Match')).toBeNull();
    });
  });
});
