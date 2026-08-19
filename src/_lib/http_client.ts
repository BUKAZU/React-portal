import ky, { type KyInstance } from 'ky';

/** Cached response metadata keyed by request URL. */
type CacheEntry = {
  etag?: string;
  lastModified?: string;
  /** Serialised response body, stored so it can be replayed on a 304. */
  body: string;
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
  headers: {
    Accept: 'application/json'
  },
  hooks: {
    beforeRequest: [
      ({ request }) => {
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
              headers: { 'Content-Type': 'application/json' }
            });
          }
        }

        // Store ETag / Last-Modified whenever the server sends them.
        if (response.ok) {
          const etag = response.headers.get('ETag') ?? undefined;
          const lastModified =
            response.headers.get('Last-Modified') ?? undefined;
          if (etag !== undefined || lastModified !== undefined) {
            const body = await response.clone().text();
            responseCache.set(request.url, { etag, lastModified, body });
          }
        }

        return response;
      }
    ]
  }
});
