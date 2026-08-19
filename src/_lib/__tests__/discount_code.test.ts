import {
  buildDiscountCodeUrl,
  fetchDiscountCode,
  DiscountCodeError,
  DiscountCodeResponse
} from '../discount_code';
import { HTTPError } from 'ky';

// Explicit factory mock for the shared HTTP client so tests do not perform real HTTP requests.
jest.mock('../http_client', () => ({
  http: { get: jest.fn() }
}));
import { http } from '../http_client';

const mockHttp = http as jest.Mocked<typeof http>;

function httpErrorWithStatus(status: number): HTTPError {
  const fakeResponse = { status } as Response;
  const fakeRequest = { method: 'GET', url: 'https://example.com' } as Request;
  return new HTTPError(fakeResponse, fakeRequest, {} as never);
}

describe('discount code REST client', () => {
  const baseParams = {
    apiUrl: 'https://api.bukazu.com/graphql',
    portalCode: 'TEST',
    objectCode: 'HOUSE1',
    code: 'SUMMER20'
  };

  describe('buildDiscountCodeUrl', () => {
    it('derives the REST origin from the GraphQL api_url and formats the params', () => {
      const url = new URL(buildDiscountCodeUrl(baseParams));

      expect(url.origin).toBe('https://api.bukazu.com');
      expect(url.pathname).toBe('/portal_api/v1/accommodations/discount-code');
      expect(url.searchParams.get('portal_code')).toBe('TEST');
      expect(url.searchParams.get('object_code')).toBe('HOUSE1');
      expect(url.searchParams.get('code')).toBe('SUMMER20');
    });

    it('respects a custom (staging/local) api_url origin', () => {
      const url = new URL(
        buildDiscountCodeUrl({
          ...baseParams,
          apiUrl: 'http://localhost:3000/graphql'
        })
      );

      expect(url.origin).toBe('http://localhost:3000');
      expect(url.pathname).toBe('/portal_api/v1/accommodations/discount-code');
    });

    it('escapes a code containing URL-unsafe characters', () => {
      const url = new URL(
        buildDiscountCodeUrl({ ...baseParams, code: 'SUMMER 20&X' })
      );

      expect(url.searchParams.get('code')).toBe('SUMMER 20&X');
    });
  });

  describe('fetchDiscountCode', () => {
    const response: DiscountCodeResponse = {
      name: 'Summer discount',
      use_price: true,
      percentage: 10,
      price: 200,
      currency: 'EUR'
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('calls http.get with the correct URL and locale header, returning parsed JSON', async () => {
      const mockJson = jest.fn().mockResolvedValue(response);
      (mockHttp.get as jest.Mock).mockReturnValue({ json: mockJson });

      const result = await fetchDiscountCode({ ...baseParams, locale: 'nl' });

      expect(result).toEqual(response);

      const [calledUrl, calledOptions] = (mockHttp.get as jest.Mock).mock
        .calls[0];
      expect(calledUrl).toContain(
        '/portal_api/v1/accommodations/discount-code'
      );
      expect(
        (calledOptions as { headers: Record<string, string> }).headers.locale
      ).toBe('nl');
    });

    it('throws a DiscountCodeError flagged as notFound on a 404', async () => {
      (mockHttp.get as jest.Mock).mockReturnValue({
        json: jest.fn().mockRejectedValue(httpErrorWithStatus(404))
      });

      await expect(
        fetchDiscountCode({ ...baseParams, locale: 'nl' })
      ).rejects.toMatchObject({
        name: 'DiscountCodeError',
        status: 404,
        notFound: true
      });
    });

    it('throws a DiscountCodeError that is not notFound on other statuses', async () => {
      (mockHttp.get as jest.Mock).mockReturnValue({
        json: jest.fn().mockRejectedValue(httpErrorWithStatus(500))
      });

      await expect(
        fetchDiscountCode({ ...baseParams, locale: 'nl' })
      ).rejects.toMatchObject({
        name: 'DiscountCodeError',
        status: 500,
        notFound: false
      });
    });

    it('re-throws non-HTTP errors unchanged', async () => {
      const networkError = new Error('Network failure');
      (mockHttp.get as jest.Mock).mockReturnValue({
        json: jest.fn().mockRejectedValue(networkError)
      });

      await expect(
        fetchDiscountCode({ ...baseParams, locale: 'nl' })
      ).rejects.toThrow('Network failure');
    });
  });
});
