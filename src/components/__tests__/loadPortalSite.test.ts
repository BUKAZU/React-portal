import { PORTAL_BASE_QUERY, PORTAL_SEARCH_QUERY } from '../../_lib/gql';
import { requestGraphQL } from '../../_lib/graphql_request';
import { loadPortalSite } from '../loadPortalSite';

jest.mock('../../_lib/graphql_request', () => ({
  requestGraphQL: jest.fn()
}));

const mockedRequestGraphQL = requestGraphQL as jest.Mock;

describe('loadPortalSite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses search query when isSearchPage is true', async () => {
    mockedRequestGraphQL.mockResolvedValue({
      PortalSite: {
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
      }
    });

    await loadPortalSite({ portalCode: 'P1', isSearchPage: true });

    expect(mockedRequestGraphQL).toHaveBeenCalledWith(PORTAL_SEARCH_QUERY, {
      id: 'P1'
    });
  });

  it('throws when PortalSite is missing', async () => {
    mockedRequestGraphQL.mockResolvedValue({ PortalSite: null });

    await expect(
      loadPortalSite({ portalCode: 'P1', isSearchPage: false })
    ).rejects.toThrow('Portal site data is missing');

    expect(mockedRequestGraphQL).toHaveBeenCalledWith(PORTAL_BASE_QUERY, {
      id: 'P1'
    });
  });
});
