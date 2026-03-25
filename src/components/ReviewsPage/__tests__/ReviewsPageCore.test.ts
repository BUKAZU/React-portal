import { GraphQLClient } from 'graphql-request';
import { REVIEWS_QUERY } from '../../../_lib/gql';
import { loadReviewsHouse } from '../ReviewsPage';

jest.mock('graphql-request', () => ({
  GraphQLClient: jest.fn()
}));

jest.mock('../../../_lib/gql', () => ({
  REVIEWS_QUERY: 'REVIEWS_QUERY'
}));

type GraphQLClientMock = jest.MockedClass<typeof GraphQLClient>;

const GraphQLClientCtor = GraphQLClient as GraphQLClientMock;

describe('loadReviewsHouse', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates GraphQLClient with locale header and requests reviews house', async () => {
    const request = jest.fn().mockResolvedValue({
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

    GraphQLClientCtor.mockImplementation(
      () =>
        ({
          request
        }) as unknown as GraphQLClient
    );

    const result = await loadReviewsHouse({
      portalCode: 'PORTAL1',
      objectCode: 'HOUSE1',
      locale: 'en'
    });

    expect(GraphQLClientCtor).toHaveBeenCalledWith(
      'https://api.bukazu.com/graphql',
      {
        headers: {
          locale: 'en'
        }
      }
    );
    expect(request).toHaveBeenCalledWith(REVIEWS_QUERY, {
      id: 'PORTAL1',
      house_id: 'HOUSE1'
    });
    expect(result.id).toBe('h1');
  });

  it('throws when the API returns no matching house', async () => {
    const request = jest.fn().mockResolvedValue({
      PortalSite: {
        houses: []
      }
    });

    GraphQLClientCtor.mockImplementation(
      () =>
        ({
          request
        }) as unknown as GraphQLClient
    );

    await expect(
      loadReviewsHouse({
        portalCode: 'PORTAL1',
        objectCode: 'HOUSE1',
        locale: 'en'
      })
    ).rejects.toThrow('No reviews house found for the given portal and object');
  });
});
