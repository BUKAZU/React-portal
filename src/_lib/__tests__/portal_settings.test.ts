import {
  buildBookingFieldsUrl,
  buildFilterFieldsUrl,
  buildSettingsUrl,
  fetchSettings
} from '../portal_settings';
import { HTTPError } from 'ky';

jest.mock('../http_client', () => ({
  http: { get: jest.fn() }
}));
import { http } from '../http_client';

const mockHttp = http as jest.Mocked<typeof http>;

const baseParams = {
  apiUrl: 'https://api.bukazu.com/graphql',
  portalCode: 'TEST'
};

describe('portal settings REST client', () => {
  describe('URL builders', () => {
    it('derives the REST origin from the GraphQL api_url and sets portal_code', () => {
      const url = new URL(buildSettingsUrl(baseParams));

      expect(url.origin).toBe('https://api.bukazu.com');
      expect(url.pathname).toBe('/portal_api/v1/config/settings');
      expect(url.searchParams.get('portal_code')).toBe('TEST');
    });

    it('builds the booking-fields and filter-fields paths', () => {
      expect(new URL(buildBookingFieldsUrl(baseParams)).pathname).toBe(
        '/portal_api/v1/config/booking-fields'
      );
      expect(new URL(buildFilterFieldsUrl(baseParams)).pathname).toBe(
        '/portal_api/v1/config/filter-fields'
      );
    });

    it('respects a custom (staging/local) api_url origin', () => {
      const url = new URL(
        buildSettingsUrl({ ...baseParams, apiUrl: 'http://localhost:3000/graphql' })
      );

      expect(url.origin).toBe('http://localhost:3000');
      expect(url.pathname).toBe('/portal_api/v1/config/settings');
    });
  });

  describe('fetchSettings', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('calls http.get with the correct URL and locale header, returning parsed JSON', async () => {
      const response = { name: 'House', portal_code: 'TEST' };
      const mockJson = jest.fn().mockResolvedValue(response);
      (mockHttp.get as jest.Mock).mockReturnValue({ json: mockJson });

      const result = await fetchSettings({ ...baseParams, locale: 'nl' });

      expect(result).toEqual(response);
      const [calledUrl, calledOptions] = (mockHttp.get as jest.Mock).mock.calls[0];
      expect(calledUrl).toContain('/portal_api/v1/config/settings');
      expect((calledOptions as { headers: Record<string, string> }).headers.locale).toBe('nl');
    });

    it('re-throws an HTTPError as a plain Error containing the status code', async () => {
      const fakeResponse = { status: 404 } as Response;
      const fakeRequest = { method: 'GET', url: 'https://example.com' } as Request;
      const httpError = new HTTPError(fakeResponse, fakeRequest, {} as never);

      (mockHttp.get as jest.Mock).mockReturnValue({
        json: jest.fn().mockRejectedValue(httpError)
      });

      await expect(
        fetchSettings({ ...baseParams, locale: 'nl' })
      ).rejects.toThrow('404');
    });

    it('re-throws non-HTTP errors unchanged', async () => {
      const networkError = new Error('Network failure');
      (mockHttp.get as jest.Mock).mockReturnValue({
        json: jest.fn().mockRejectedValue(networkError)
      });

      await expect(
        fetchSettings({ ...baseParams, locale: 'nl' })
      ).rejects.toThrow('Network failure');
    });
  });
});
