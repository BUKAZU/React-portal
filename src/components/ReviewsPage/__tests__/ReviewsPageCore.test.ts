import { GraphQLClient } from 'graphql-request';
import { REVIEWS_QUERY } from '../../../_lib/gql';
import { loadReviewsHouse } from '../ReviewsPage';

jest.mock('../../../_lib/gql', () => ({
  REVIEWS_QUERY: 'REVIEWS_QUERY'
}));

function makeMockClient(resolvedValue: unknown): GraphQLClient {
  return { request: jest.fn().mockResolvedValue(resolvedValue) } as unknown as GraphQLClient;
}

describe('loadReviewsHouse', () => {
  it('requests reviews house through the provided client', async () => {
    const client = makeMockClient({
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
      objectCode: 'HOUSE1',
      client
    });

    expect((client.request as jest.Mock)).toHaveBeenCalledWith(REVIEWS_QUERY, {
      id: 'PORTAL1',
      house_id: 'HOUSE1'
    });
    expect(result.id).toBe('h1');
  });

  it('throws when the API returns no matching house', async () => {
    const client = makeMockClient({
      PortalSite: {
        houses: []
      }
    });

    await expect(
      loadReviewsHouse({
        portalCode: 'PORTAL1',
        objectCode: 'HOUSE1',
        client
      })
    ).rejects.toThrow('No reviews house found for the given portal and object');
  });
});
