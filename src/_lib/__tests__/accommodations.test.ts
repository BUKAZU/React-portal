import {
  buildSearchUrl,
  fetchAccommodations,
  AccommodationsResponse
} from '../accommodations';
import { HTTPError } from 'ky';

// Explicit factory mock for the shared HTTP client so tests do not perform real HTTP requests.
jest.mock('../http_client', () => ({
  http: { get: jest.fn() }
}));
import { http } from '../http_client';

const mockHttp = http as jest.Mocked<typeof http>;

const baseParams = {
  apiUrl: 'https://api.bukazu.com/graphql',
  portalCode: 'TEST',
  params: { limit: '12', skip: '0' }
};

const response: AccommodationsResponse = {
  items: [],
  meta: { total_count: 0, limit: 12, skip: 0 }
};

describe('accommodations REST client', () => {
  describe('buildSearchUrl', () => {
    it('derives the REST origin from the GraphQL api_url', () => {
      const url = new URL(buildSearchUrl(baseParams));

      expect(url.origin).toBe('https://api.bukazu.com');
      expect(url.pathname).toBe('/portal_api/v1/accommodations');
      expect(url.searchParams.get('portal_code')).toBe('TEST');
    });

    it('respects a custom (staging/local) api_url origin', () => {
      const url = new URL(
        buildSearchUrl({
          ...baseParams,
          apiUrl: 'http://localhost:3000/graphql'
        })
      );

      expect(url.origin).toBe('http://localhost:3000');
      expect(url.pathname).toBe('/portal_api/v1/accommodations');
    });

    it('appends the search params it was given', () => {
      const url = new URL(
        buildSearchUrl({
          ...baseParams,
          params: {
            limit: '12',
            skip: '24',
            persons_min: '4',
            properties: '3,7',
            starts_at: '2026-06-01'
          }
        })
      );

      expect(url.searchParams.get('limit')).toBe('12');
      expect(url.searchParams.get('skip')).toBe('24');
      expect(url.searchParams.get('persons_min')).toBe('4');
      expect(url.searchParams.get('properties')).toBe('3,7');
      expect(url.searchParams.get('starts_at')).toBe('2026-06-01');
    });

    it('sends no filter it was not given', () => {
      const url = new URL(buildSearchUrl(baseParams));

      expect(url.searchParams.has('persons_min')).toBe(false);
      expect(url.searchParams.has('extra_search')).toBe(false);
      expect(url.searchParams.has('starts_at')).toBe(false);
    });
  });

  describe('fetchAccommodations', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('requests the search URL with the locale header and returns the payload', async () => {
      const json = jest.fn().mockResolvedValue(response);
      mockHttp.get.mockReturnValue({ json } as never);

      const result = await fetchAccommodations({ ...baseParams, locale: 'nl' });

      expect(mockHttp.get).toHaveBeenCalledWith(buildSearchUrl(baseParams), {
        headers: { locale: 'nl' },
        signal: undefined
      });
      expect(result).toBe(response);
    });

    it('passes the abort signal through to the client', async () => {
      const json = jest.fn().mockResolvedValue(response);
      mockHttp.get.mockReturnValue({ json } as never);
      const controller = new AbortController();

      await fetchAccommodations({
        ...baseParams,
        locale: 'en',
        signal: controller.signal
      });

      expect(mockHttp.get).toHaveBeenCalledWith(expect.any(String), {
        headers: { locale: 'en' },
        signal: controller.signal
      });
    });

    it('turns an HTTP error into an error carrying the status', async () => {
      const fakeResponse = { status: 503 } as Response;
      const fakeRequest = {
        method: 'GET',
        url: 'https://example.com'
      } as Request;
      const httpError = new HTTPError(fakeResponse, fakeRequest, {} as never);
      mockHttp.get.mockReturnValue({
        json: jest.fn().mockRejectedValue(httpError)
      } as never);

      await expect(
        fetchAccommodations({ ...baseParams, locale: 'en' })
      ).rejects.toThrow('Search request failed (503)');
    });

    it('rethrows a non-HTTP error unchanged', async () => {
      const aborted = new DOMException(
        'The operation was aborted',
        'AbortError'
      );
      mockHttp.get.mockReturnValue({
        json: jest.fn().mockRejectedValue(aborted)
      } as never);

      await expect(
        fetchAccommodations({ ...baseParams, locale: 'en' })
      ).rejects.toBe(aborted);
    });
  });
});
