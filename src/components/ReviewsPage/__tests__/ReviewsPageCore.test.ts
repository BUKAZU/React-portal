import { REVIEWS_QUERY } from '../../../_lib/gql';
import { requestGraphQL } from '../../../_lib/graphql_request';
import { loadReviewsHouse } from '../ReviewsPage';

jest.mock('../../../_lib/gql', () => ({
  REVIEWS_QUERY: 'REVIEWS_QUERY'
}));

jest.mock('../../../_lib/graphql_request', () => ({
  requestGraphQL: jest.fn()
}));

const mockedRequestGraphQL = requestGraphQL as jest.Mock;

describe('loadReviewsHouse', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('requests reviews house through the central request helper', async () => {
    mockedRequestGraphQL.mockResolvedValue({
      PortalSite: {
        houses: [
          {
            id: 'h1',
            name: 'House',
            rating: 8.5,
            scoreAmount: 4,
            reviews: []
          }
        ]
      }
    });

    const result = await loadReviewsHouse({
      portalCode: 'PORTAL1',
      objectCode: 'HOUSE1'
    });

    expect(mockedRequestGraphQL).toHaveBeenCalledWith(REVIEWS_QUERY, {
      id: 'PORTAL1',
      house_id: 'HOUSE1'
    });
    expect(result.id).toBe('h1');
  });

  it('throws when the API returns no matching house', async () => {
    mockedRequestGraphQL.mockResolvedValue({
      PortalSite: {
        houses: []
      }
    });

    await expect(
      loadReviewsHouse({
        portalCode: 'PORTAL1',
        objectCode: 'HOUSE1'
      })
    ).rejects.toThrow('No reviews house found for the given portal and object');
  });
});
