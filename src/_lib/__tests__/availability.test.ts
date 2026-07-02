import {
  buildAvailabilityUrl,
  fetchAvailability,
  AvailabilityResponse
} from '../availability';
import { HTTPError } from 'ky';

// Explicit factory mock for the shared HTTP client so tests do not perform real HTTP requests.
jest.mock('../http_client', () => ({
  http: { get: jest.fn() },
  parseResponse: jest.fn()
}));
import { http, parseResponse } from '../http_client';

const mockHttp = http as jest.Mocked<typeof http>;
const mockParseResponse = parseResponse as jest.Mock;

describe('availability REST client', () => {
  const baseParams = {
    apiUrl: 'https://api.bukazu.com/graphql',
    portalCode: 'TEST',
    objectCode: 'HOUSE1',
    startsDate: new Date(2025, 5, 1), // 2025-06-01
    endDate: new Date(2025, 5, 30) // 2025-06-30
  };

  describe('buildAvailabilityUrl', () => {
    it('derives the REST origin from the GraphQL api_url and formats params', () => {
      const url = new URL(buildAvailabilityUrl(baseParams));

      expect(url.origin).toBe('https://api.bukazu.com');
      expect(url.pathname).toBe('/portal_api/v1/accommodations/availability');
      expect(url.searchParams.get('portal_code')).toBe('TEST');
      expect(url.searchParams.get('object_code')).toBe('HOUSE1');
      expect(url.searchParams.get('starts_date')).toBe('2025-06-01');
      expect(url.searchParams.get('end_date')).toBe('2025-06-30');
    });

    it('respects a custom (staging/local) api_url origin', () => {
      const url = new URL(
        buildAvailabilityUrl({
          ...baseParams,
          apiUrl: 'http://localhost:3000/graphql'
        })
      );

      expect(url.origin).toBe('http://localhost:3000');
      expect(url.pathname).toBe('/portal_api/v1/accommodations/availability');
    });
  });

  describe('fetchAvailability', () => {
    const response: AvailabilityResponse = {
      name: 'Test House',
      last_minute_days: 14,
      availabilities: [
        {
          date: '2025-06-01',
          arrival: true,
          arrival_time_from: '14:00',
          arrival_time_to: '17:00',
          departure: false,
          departure_time: null,
          min_nights: 2,
          max_nights: 7,
          special_offer: 0
        }
      ],
      discounts: []
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('calls http.get with the correct URL and locale header, returning parsed JSON', async () => {
      (mockHttp.get as jest.Mock).mockResolvedValue({});
      mockParseResponse.mockResolvedValue(response);

      const result = await fetchAvailability({ ...baseParams, locale: 'nl' });

      expect(result).toEqual(response);

      const [calledUrl, calledOptions] = (mockHttp.get as jest.Mock).mock
        .calls[0];
      expect(calledUrl).toContain('/portal_api/v1/accommodations/availability');
      expect(
        (calledOptions as { headers: Record<string, string> }).headers.locale
      ).toBe('nl');
    });

    it('re-throws an HTTPError as a plain Error containing the status code', async () => {
      const fakeResponse = { status: 404 } as Response;
      const fakeRequest = {
        method: 'GET',
        url: 'https://example.com'
      } as Request;
      const httpError = new HTTPError(fakeResponse, fakeRequest, {} as never);

      (mockHttp.get as jest.Mock).mockRejectedValue(httpError);

      await expect(
        fetchAvailability({ ...baseParams, locale: 'nl' })
      ).rejects.toThrow('404');
    });

    it('re-throws non-HTTP errors unchanged', async () => {
      const networkError = new Error('Network failure');
      (mockHttp.get as jest.Mock).mockRejectedValue(networkError);

      await expect(
        fetchAvailability({ ...baseParams, locale: 'nl' })
      ).rejects.toThrow('Network failure');
    });
  });
});
