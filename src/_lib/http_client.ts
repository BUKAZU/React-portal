import ky, { type KyInstance } from 'ky';
import { decode } from '@msgpack/msgpack';

/** Cached response metadata keyed by request URL. */
type CacheEntry = {
  etag?: string;
  lastModified?: string;
  /** Serialised response body — string for JSON, Uint8Array for msgpack. */
  body: string | Uint8Array;
  contentType: string;
};

// Module-level ETag / Last-Modified cache.
const responseCache = new Map<string, CacheEntry>();

/**
 * Clears all entries from the response cache.
 * Exposed for testing; not intended for production use.
 */
export function clearCache(): void {
  responseCache.clear();
}

// Set to true to fall back to JSON (useful during development/debugging).
const USE_JSON = false;

/**
 * Deserialize a Response body as either JSON or MessagePack, depending on the
 * `Content-Type` returned by the server.  Use this instead of `.json<T>()` on
 * any request where MessagePack support is desired.
 */
export async function parseResponse<T>(response: Response): Promise<T> {
  const ct = response.headers.get('Content-Type') ?? '';
  if (ct.includes('msgpack')) {
    const buf = await response.arrayBuffer();
    return decode(new Uint8Array(buf)) as T;
  }
  return response.json() as Promise<T>;
}

/**
 * Shared HTTP client built on `ky`.
 *
 * Features:
 * - Automatic retry (limit 3) on transient network failures and common
 *   server-error status codes (408, 429, 500, 502, 503, 504).  POST is
 *   excluded from the retry methods list, keeping GraphQL mutations safe from
 *   duplicate execution.
 * - ETag / Last-Modified caching via `beforeRequest` / `afterResponse` hooks.
 *   On the second request to the same URL the client sends conditional headers
 *   (`If-None-Match` / `If-Modified-Since`).  When the server responds with
 *   `304 Not Modified`, the hook transparently returns the previously cached
 *   body as a `200 OK` response so callers never see a 304.
 * - MessagePack serialization by default: set `USE_JSON = true` to fall back
 *   to JSON (development/debugging). Use `parseResponse` to decode responses.
 */
export const http: KyInstance = ky.create({
  retry: {
    limit: 3,
    // Retry only idempotent methods. POST is intentionally excluded so that
    // GraphQL mutations are never re-sent automatically, preventing duplicate
    // side-effects.
    methods: ['get', 'put', 'head', 'delete', 'options', 'trace'],
    statusCodes: [408, 429, 500, 502, 503, 504]
  },
  hooks: {
    beforeRequest: [
      ({ request }) => {
        // Dynamic Accept header so callers can switch serialization at runtime.
        request.headers.set(
          'Accept',
          USE_JSON ? 'application/json' : 'application/msgpack'
        );

        if (request.method !== 'GET') return;
        const entry = responseCache.get(request.url);
        if (!entry) return;
        if (entry.etag) {
          request.headers.set('If-None-Match', entry.etag);
        }
        if (entry.lastModified) {
          request.headers.set('If-Modified-Since', entry.lastModified);
        }
      }
    ],
    afterResponse: [
      async ({ request, response }) => {
        if (request.method !== 'GET') {
          return response;
        }
        // Transparent cache hit: serve the stored body as 200 OK.
        if (response.status === 304) {
          const entry = responseCache.get(request.url);
          if (entry) {
            return new Response(entry.body, {
              status: 200,
              headers: { 'Content-Type': entry.contentType }
            });
          }
        }

        // Store ETag / Last-Modified whenever the server sends them.
        if (response.ok) {
          const etag = response.headers.get('ETag') ?? undefined;
          const lastModified =
            response.headers.get('Last-Modified') ?? undefined;
          if (etag !== undefined || lastModified !== undefined) {
            const contentType =
              response.headers.get('Content-Type') ?? 'application/json';
            let body: string | Uint8Array;
            if (contentType.includes('msgpack')) {
              const buf = await response.clone().arrayBuffer();
              body = new Uint8Array(buf);
            } else {
              body = await response.clone().text();
            }
            responseCache.set(request.url, {
              etag,
              lastModified,
              body,
              contentType
            });
          }
        }

        return response;
      }
    ]
  }
});
