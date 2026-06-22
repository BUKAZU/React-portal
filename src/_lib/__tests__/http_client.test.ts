/**
 * @jest-environment node
 *
 * This file runs in the Node environment so that the WHATWG Fetch API globals
 * (`Response`, `Request`, `Headers`, `fetch`) are available without polyfills.
 * ky is built on these globals and needs them to behave correctly in tests.
 */
import { http, clearCache } from '../http_client';

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

describe('http_client', () => {
  describe('first request – no conditional headers', () => {
    it('does not send If-None-Match or If-Modified-Since on a fresh URL', async () => {
      const fetchMock = jest.fn().mockResolvedValue(
        makeResponse(JSON.stringify({ data: 'hello' }), 200, {
          'Content-Type': 'application/json',
        })
      );
      globalThis.fetch = fetchMock;

      await http.get(TEST_URL).json();

      const request: Request = fetchMock.mock.calls[0][0];
      expect(request.headers.get('If-None-Match')).toBeNull();
      expect(request.headers.get('If-Modified-Since')).toBeNull();
    });
  });

  describe('ETag caching', () => {
    it('stores an ETag from the first response and sends it on the next request', async () => {
      const payload = JSON.stringify({ data: 'cached' });
      const fetchMock = jest
        .fn()
        // First call: respond with an ETag.
        .mockResolvedValueOnce(
          makeResponse(payload, 200, {
            'Content-Type': 'application/json',
            ETag: '"v1"',
          })
        )
        // Second call: respond with a fresh 200 (no change needed for this test).
        .mockResolvedValueOnce(
          makeResponse(payload, 200, {
            'Content-Type': 'application/json',
          })
        );
      globalThis.fetch = fetchMock;

      await http.get(TEST_URL).json();
      await http.get(TEST_URL).json();

      const secondRequest: Request = fetchMock.mock.calls[1][0];
      expect(secondRequest.headers.get('If-None-Match')).toBe('"v1"');
      expect(secondRequest.headers.get('If-Modified-Since')).toBeNull();
    });

    it('stores a Last-Modified from the first response and sends it on the next request', async () => {
      const payload = JSON.stringify({ data: 'modified' });
      const lastMod = 'Wed, 01 Jan 2025 00:00:00 GMT';
      const fetchMock = jest
        .fn()
        .mockResolvedValueOnce(
          makeResponse(payload, 200, {
            'Content-Type': 'application/json',
            'Last-Modified': lastMod,
          })
        )
        .mockResolvedValueOnce(
          makeResponse(payload, 200, { 'Content-Type': 'application/json' })
        );
      globalThis.fetch = fetchMock;

      await http.get(TEST_URL).json();
      await http.get(TEST_URL).json();

      const secondRequest: Request = fetchMock.mock.calls[1][0];
      expect(secondRequest.headers.get('If-Modified-Since')).toBe(lastMod);
      expect(secondRequest.headers.get('If-None-Match')).toBeNull();
    });
  });

  describe('304 Not Modified', () => {
    it('returns the cached body as a 200 response when the server replies 304', async () => {
      const payload = JSON.stringify({ data: 'from-cache' });
      const fetchMock = jest
        .fn()
        .mockResolvedValueOnce(
          makeResponse(payload, 200, {
            'Content-Type': 'application/json',
            ETag: '"abc"',
          })
        )
        .mockResolvedValueOnce(
          // Server says nothing changed — body must be null for status 304.
          makeResponse(null, 304, {})
        );
      globalThis.fetch = fetchMock;

      await http.get(TEST_URL).json();
      const result = await http.get(TEST_URL).json();

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

      await expect(http.get(TEST_URL).json()).rejects.toBeInstanceOf(HTTPError);
    });
  });

  describe('clearCache', () => {
    it('removes stored entries so the next request sends no conditional headers', async () => {
      const payload = JSON.stringify({ ok: true });
      const fetchMock = jest
        .fn()
        .mockResolvedValueOnce(
          makeResponse(payload, 200, {
            'Content-Type': 'application/json',
            ETag: '"xyz"',
          })
        )
        .mockResolvedValueOnce(
          makeResponse(payload, 200, { 'Content-Type': 'application/json' })
        );
      globalThis.fetch = fetchMock;

      await http.get(TEST_URL).json();
      clearCache();
      await http.get(TEST_URL).json();

      const secondRequest: Request = fetchMock.mock.calls[1][0];
      expect(secondRequest.headers.get('If-None-Match')).toBeNull();
    });
  });
});
