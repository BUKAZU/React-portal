import {
  buildBookingFieldsUrl,
  buildFilterFieldsUrl,
  buildSearchFacetsUrl,
  buildSettingsUrl,
  fetchSettings
} from '../portal_settings';

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

    it('builds the search-facets, booking-fields and filter-fields paths', () => {
      expect(new URL(buildSearchFacetsUrl(baseParams)).pathname).toBe(
        '/portal_api/v1/config/search-facets'
      );
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
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('sends the locale header and returns parsed JSON on success', async () => {
      const response = { name: 'House', portal_code: 'TEST' };
      const fetchMock = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(response)
      });
      global.fetch = fetchMock as unknown as typeof fetch;

      const result = await fetchSettings({ ...baseParams, locale: 'nl' });

      expect(result).toEqual(response);
      const [, init] = fetchMock.mock.calls[0];
      expect(init.headers.locale).toBe('nl');
      expect(init.headers.Accept).toBe('application/json');
    });

    it('throws when the response is not ok', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404
      }) as unknown as typeof fetch;

      await expect(
        fetchSettings({ ...baseParams, locale: 'nl' })
      ).rejects.toThrow('404');
    });
  });
});
