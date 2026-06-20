import {
  buildAvailabilityUrl,
  fetchAvailability,
  AvailabilityResponse
} from '../availability';

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

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('sends the locale header and returns parsed JSON on success', async () => {
      const fetchMock = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(response)
      });
      global.fetch = fetchMock as unknown as typeof fetch;

      const result = await fetchAvailability({ ...baseParams, locale: 'nl' });

      expect(result).toEqual(response);
      const [, init] = fetchMock.mock.calls[0];
      expect(init.headers.locale).toBe('nl');
    });

    it('throws when the response is not ok', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404
      }) as unknown as typeof fetch;

      await expect(
        fetchAvailability({ ...baseParams, locale: 'nl' })
      ).rejects.toThrow('404');
    });
  });
});
