import { GraphQLClient } from 'graphql-request';
import { PORTAL_BASE_QUERY, PORTAL_SEARCH_QUERY } from '../../_lib/gql';
import { loadPortalSite } from '../loadPortalSite';

function makeMockClient(resolvedValue: unknown): GraphQLClient {
  return { request: jest.fn().mockResolvedValue(resolvedValue) } as unknown as GraphQLClient;
}

describe('loadPortalSite', () => {
  it('uses search query when isSearchPage is true', async () => {
    const portalSite = {
      portal_code: 'PORTAL',
      options: {},
      colorsConfiguration: {
        arrival: '#1',
        booked: '#2',
        button: '#3',
        buttonCta: '#4',
        cell: '#5',
        departure: '#6',
        discount: '#7'
      },
      categories: [],
      bookingFormConfiguration: {},
      max_persons: 0,
      name: 'Portal',
      max_bedrooms: 0,
      max_bathrooms: 0,
      max_weekprice: 0
    };
    const client = makeMockClient({ PortalSite: portalSite });

    await loadPortalSite({ portalCode: 'P1', isSearchPage: true, client });

    expect((client.request as jest.Mock)).toHaveBeenCalledWith(
      PORTAL_SEARCH_QUERY,
      { id: 'P1' }
    );
  });

  it('throws when PortalSite is missing', async () => {
    const client = makeMockClient({ PortalSite: null });

    await expect(
      loadPortalSite({ portalCode: 'P1', isSearchPage: false, client })
    ).rejects.toThrow('Portal site data is missing');

    expect((client.request as jest.Mock)).toHaveBeenCalledWith(
      PORTAL_BASE_QUERY,
      { id: 'P1' }
    );
  });
});
