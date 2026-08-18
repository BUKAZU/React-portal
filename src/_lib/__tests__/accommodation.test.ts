import {
  buildAccommodationDetailUrl,
  fetchAccommodationDetail,
  AccommodationDetailError,
  AccommodationDetail
} from '../accommodation';
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

describe('accommodation detail REST client', () => {
  const baseParams = {
    apiUrl: 'https://api.bukazu.com/graphql',
    portalCode: 'TEST',
    objectCode: 'HOUSE1'
  };

  describe('buildAccommodationDetailUrl', () => {
    it('derives the REST origin from the GraphQL api_url and formats the params', () => {
      const url = new URL(buildAccommodationDetailUrl(baseParams));

      expect(url.origin).toBe('https://api.bukazu.com');
      expect(url.pathname).toBe('/portal_api/v1/accommodations/detail');
      expect(url.searchParams.get('portal_code')).toBe('TEST');
      expect(url.searchParams.get('object_code')).toBe('HOUSE1');
    });

    it('respects a custom (staging/local) api_url origin', () => {
      const url = new URL(
        buildAccommodationDetailUrl({
          ...baseParams,
          apiUrl: 'http://localhost:3000/graphql'
        })
      );

      expect(url.origin).toBe('http://localhost:3000');
      expect(url.pathname).toBe('/portal_api/v1/accommodations/detail');
    });

    it('escapes an object_code containing URL-unsafe characters', () => {
      const url = new URL(
        buildAccommodationDetailUrl({ ...baseParams, objectCode: 'HOUSE 1&X' })
      );

      expect(url.searchParams.get('object_code')).toBe('HOUSE 1&X');
    });
  });

  describe('fetchAccommodationDetail', () => {
    /** Pins the contract: every field the calendar and booking form rely on. */
    const response: AccommodationDetail = {
      id: 42,
      name: 'Villa Test',
      code: 'HOUSE1',
      allow_option: true,
      persons: 6,
      image_url: 'https://images.bukazu.com/house1.jpg',
      discounts: '5,10',
      discounts_info: 'Discount information',
      house_type: 'house',
      rental_terms: 'https://example.com/terms.pdf',
      cancel_insurance: true,
      damage_insurance: false,
      damage_insurance_required: false,
      travel_insurance: true,
      babies_extra: 2,
      max_nights: 28,
      last_minute_days: 14
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('calls http.get with the correct URL and locale header, returning parsed JSON', async () => {
      const mockJson = jest.fn().mockResolvedValue(response);
      (mockHttp.get as jest.Mock).mockReturnValue({ json: mockJson });

      const result = await fetchAccommodationDetail({
        ...baseParams,
        locale: 'nl'
      });

      expect(result).toEqual(response);
      expect(mockHttp.get).toHaveBeenCalledWith(
        buildAccommodationDetailUrl(baseParams),
        { headers: { locale: 'nl' } }
      );
    });

    it('throws an AccommodationDetailError flagged as notFound on a 404', async () => {
      (mockHttp.get as jest.Mock).mockReturnValue({
        json: jest.fn().mockRejectedValue(httpErrorWithStatus(404))
      });

      await expect(
        fetchAccommodationDetail({ ...baseParams, locale: 'nl' })
      ).rejects.toMatchObject({
        name: 'AccommodationDetailError',
        status: 404,
        notFound: true
      });
    });

    it('throws an AccommodationDetailError that is not notFound on other statuses', async () => {
      (mockHttp.get as jest.Mock).mockReturnValue({
        json: jest.fn().mockRejectedValue(httpErrorWithStatus(500))
      });

      await expect(
        fetchAccommodationDetail({ ...baseParams, locale: 'nl' })
      ).rejects.toMatchObject({
        name: 'AccommodationDetailError',
        status: 500,
        notFound: false
      });
    });

    it('carries the status in the error message', async () => {
      (mockHttp.get as jest.Mock).mockReturnValue({
        json: jest.fn().mockRejectedValue(httpErrorWithStatus(503))
      });

      await expect(
        fetchAccommodationDetail({ ...baseParams, locale: 'nl' })
      ).rejects.toThrow('Accommodation detail request failed (503)');
    });

    it('re-throws non-HTTP errors unchanged', async () => {
      const networkError = new Error('Network failure');
      (mockHttp.get as jest.Mock).mockReturnValue({
        json: jest.fn().mockRejectedValue(networkError)
      });

      await expect(
        fetchAccommodationDetail({ ...baseParams, locale: 'nl' })
      ).rejects.toThrow('Network failure');
    });

    it('is an instance of Error, so ApiError can render it', () => {
      expect(new AccommodationDetailError(500)).toBeInstanceOf(Error);
    });
  });
});
