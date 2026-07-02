import { buildPriceUrl, fetchPrice, PriceResponse } from '../price';
import { HTTPError } from 'ky';

// Explicit factory mock for the shared HTTP client so tests do not perform real HTTP requests.
jest.mock('../http_client', () => ({
  http: { get: jest.fn() }
}));
import { http } from '../http_client';

const mockHttp = http as jest.Mocked<typeof http>;

describe('price REST client', () => {
  const baseParams = {
    apiUrl: 'https://api.bukazu.com/graphql',
    portalCode: 'TEST',
    objectCode: 'HOUSE1',
    startsAt: '2025-06-01',
    endsAt: '2025-06-08'
  };

  describe('buildPriceUrl', () => {
    it('derives the REST origin from the GraphQL api_url and formats required params', () => {
      const url = new URL(buildPriceUrl(baseParams));

      expect(url.origin).toBe('https://api.bukazu.com');
      expect(url.pathname).toBe('/portal_api/v1/accommodations/price');
      expect(url.searchParams.get('portal_code')).toBe('TEST');
      expect(url.searchParams.get('object_code')).toBe('HOUSE1');
      expect(url.searchParams.get('starts_at')).toBe('2025-06-01');
      expect(url.searchParams.get('ends_at')).toBe('2025-06-08');
    });

    it('respects a custom (staging/local) api_url origin', () => {
      const url = new URL(
        buildPriceUrl({ ...baseParams, apiUrl: 'http://localhost:3000/graphql' })
      );

      expect(url.origin).toBe('http://localhost:3000');
      expect(url.pathname).toBe('/portal_api/v1/accommodations/price');
    });

    it('includes optional params only when provided', () => {
      const url = new URL(buildPriceUrl(baseParams));

      expect(url.searchParams.has('persons')).toBe(false);
      expect(url.searchParams.has('currency')).toBe(false);
      expect(url.searchParams.has('cancel_insurance')).toBe(false);
      expect(url.searchParams.has('discount')).toBe(false);
      expect(url.searchParams.has('discount_code')).toBe(false);
    });

    it('serialises optional params when provided', () => {
      const url = new URL(
        buildPriceUrl({
          ...baseParams,
          persons: 4,
          currency: 'EUR',
          cancelInsurance: 1,
          discount: 10,
          discountCode: 'CODE10',
          costs: { '12': 1, '34': '2' }
        })
      );

      expect(url.searchParams.get('persons')).toBe('4');
      expect(url.searchParams.get('currency')).toBe('EUR');
      expect(url.searchParams.get('cancel_insurance')).toBe('1');
      expect(url.searchParams.get('discount')).toBe('10');
      expect(url.searchParams.get('discount_code')).toBe('CODE10');
      expect(url.searchParams.get('costs[12]')).toBe('1');
      expect(url.searchParams.get('costs[34]')).toBe('2');
    });
  });

  describe('fetchPrice', () => {
    const response: PriceResponse = {
      arrival_date: '2025-06-01',
      departure_date: '2025-06-08',
      arrival_time: null,
      departure_time: null,
      currency: 'EUR',
      nights: 7,
      base_price: 1000,
      total_price: 1200,
      rent_price: 1000,
      discount: 0,
      discounted_price: 1000,
      insurances: {},
      on_site_house_costs: [],
      optional_house_costs: [],
      required_house_costs: [],
      person_percentages: {},
      night_percentages: {},
      total_costs: {
        sub_total: 1200,
        total_price: 1200,
        insurances: { cancel_insurance: 0, insurance_costs: 0 },
        required_costs: { not_on_site: [], on_site: [] },
        optional_costs: { not_on_site: [], on_site: [] }
      }
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('calls http.get with the correct URL and locale header, returning parsed JSON', async () => {
      const mockJson = jest.fn().mockResolvedValue(response);
      (mockHttp.get as jest.Mock).mockReturnValue({ json: mockJson });

      const result = await fetchPrice({ ...baseParams, locale: 'nl' });

      expect(result).toEqual(response);

      const [calledUrl, calledOptions] = (mockHttp.get as jest.Mock).mock
        .calls[0];
      expect(calledUrl).toContain('/portal_api/v1/accommodations/price');
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

      (mockHttp.get as jest.Mock).mockReturnValue({
        json: jest.fn().mockRejectedValue(httpError)
      });

      await expect(
        fetchPrice({ ...baseParams, locale: 'nl' })
      ).rejects.toThrow('404');
    });

    it('re-throws non-HTTP errors unchanged', async () => {
      const networkError = new Error('Network failure');
      (mockHttp.get as jest.Mock).mockReturnValue({
        json: jest.fn().mockRejectedValue(networkError)
      });

      await expect(
        fetchPrice({ ...baseParams, locale: 'nl' })
      ).rejects.toThrow('Network failure');
    });
  });
});
