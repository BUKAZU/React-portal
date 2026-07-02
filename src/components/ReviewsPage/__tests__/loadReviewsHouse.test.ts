import { HTTPError } from 'ky';
import { http } from '../../../_lib/http_client';
import { loadReviewsHouse } from '../ReviewsPage';

jest.mock('../../../_lib/http_client', () => ({
  http: { get: jest.fn() },
  parseResponse: jest.fn()
}));
import { parseResponse } from '../../../_lib/http_client';

const mockHttp = http as jest.Mocked<typeof http>;
const mockParseResponse = parseResponse as jest.Mock;

const fakeRequest = { method: 'GET', url: 'https://example.com' } as Request;

function makeHttpError(status: number): HTTPError {
  return new HTTPError({ status } as Response, fakeRequest, {} as never);
}

const baseParams = { portalCode: 'PORTAL1', objectCode: 'HOUSE1' };

const restResponse = {
  house: { name: 'Test House', rating: 8.5, score_amount: 42 },
  items: [
    {
      created_at: '2024-01-15',
      review_at: '2024-01-14',
      name: 'Alice',
      source_name: 'Booking.com',
      review: 'Great place!',
      score: 9,
      review_criteria: [{ name: 'Cleanliness', score: 9 }],
      review_responses: [{ created_at: '2024-01-16', sender: 'landlord', message: 'Thank you!' }]
    }
  ],
  page_info: {
    start_cursor: 'cursor1',
    end_cursor: 'cursor2',
    has_next_page: true,
    has_previous_page: false
  }
};

beforeEach(() => {
  (mockHttp.get as jest.Mock).mockClear();
  mockParseResponse.mockClear();
  (mockHttp.get as jest.Mock).mockResolvedValue({});
  mockParseResponse.mockResolvedValue(restResponse);
});

describe('loadReviewsHouse', () => {
  describe('URL construction', () => {
    it('includes portal_code and object_code params', async () => {
      await loadReviewsHouse(baseParams);
      const url = (mockHttp.get as jest.Mock).mock.calls[0][0] as string;
      expect(url).toContain('portal_code=PORTAL1');
      expect(url).toContain('object_code=HOUSE1');
    });

    it('hits the reviews endpoint', async () => {
      await loadReviewsHouse(baseParams);
      const url = (mockHttp.get as jest.Mock).mock.calls[0][0] as string;
      expect(url).toContain('/portal_api/v1/accommodations/reviews');
    });

    it('includes after param when provided', async () => {
      await loadReviewsHouse({ ...baseParams, after: 'cursor99' });
      const url = (mockHttp.get as jest.Mock).mock.calls[0][0] as string;
      expect(url).toContain('after=cursor99');
    });

    it('omits after param when not provided', async () => {
      await loadReviewsHouse(baseParams);
      const url = (mockHttp.get as jest.Mock).mock.calls[0][0] as string;
      expect(url).not.toContain('after=');
    });

    it('uses only the origin of apiUrl, not its path', async () => {
      await loadReviewsHouse({ ...baseParams, apiUrl: 'https://api.example.com/graphql' });
      const url = (mockHttp.get as jest.Mock).mock.calls[0][0] as string;
      expect(url).toMatch(/^https:\/\/api\.example\.com\/portal_api\/v1\/accommodations\/reviews/);
      expect(url).not.toContain('/graphql');
    });
  });

  describe('response mapping', () => {
    it('maps house name, rating, and score_amount → scoreAmount', async () => {
      const { house } = await loadReviewsHouse(baseParams);
      expect(house.name).toBe('Test House');
      expect(house.rating).toBe(8.5);
      expect(house.scoreAmount).toBe(42);
    });

    it('maps review snake_case fields to camelCase', async () => {
      const { house } = await loadReviewsHouse(baseParams);
      const review = house.reviews[0];
      expect(review.name).toBe('Alice');
      expect(review.review).toBe('Great place!');
      expect(review.score).toBe(9);
      expect(review.createdAt).toBe('2024-01-15');
      expect(review.sourceName).toBe('Booking.com');
    });

    it('maps review_criteria', async () => {
      const { house } = await loadReviewsHouse(baseParams);
      expect(house.reviews[0].reviewCriteria).toEqual([
        { id: 0, name: 'Cleanliness', score: 9 }
      ]);
    });

    it('maps review_responses', async () => {
      const { house } = await loadReviewsHouse(baseParams);
      expect(house.reviews[0].reviewResponses).toEqual([
        { created_at: '2024-01-16', sender: 'landlord', message: 'Thank you!' }
      ]);
    });

    it('returns pageInfo with cursors and pagination flags', async () => {
      const { pageInfo } = await loadReviewsHouse(baseParams);
      expect(pageInfo.start_cursor).toBe('cursor1');
      expect(pageInfo.end_cursor).toBe('cursor2');
      expect(pageInfo.has_next_page).toBe(true);
      expect(pageInfo.has_previous_page).toBe(false);
    });

    it('handles empty items list', async () => {
      mockParseResponse.mockResolvedValue({
        ...restResponse,
        items: [],
        page_info: { start_cursor: null, end_cursor: null, has_next_page: false, has_previous_page: false }
      });
      const { house, pageInfo } = await loadReviewsHouse(baseParams);
      expect(house.reviews).toHaveLength(0);
      expect(pageInfo.has_next_page).toBe(false);
      expect(pageInfo.end_cursor).toBeNull();
    });

    it('handles review with empty review_criteria and review_responses', async () => {
      mockParseResponse.mockResolvedValue({
        ...restResponse,
        items: [{ ...restResponse.items[0], review_criteria: [], review_responses: [] }]
      });
      const { house } = await loadReviewsHouse(baseParams);
      expect(house.reviews[0].reviewCriteria).toEqual([]);
      expect(house.reviews[0].reviewResponses).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('wraps HTTPError with status code in message', async () => {
      (mockHttp.get as jest.Mock).mockRejectedValue(makeHttpError(404));
      await expect(loadReviewsHouse(baseParams)).rejects.toThrow(
        'Reviews request failed (404)'
      );
    });

    it('wraps HTTPError 500 with status code in message', async () => {
      (mockHttp.get as jest.Mock).mockRejectedValue(makeHttpError(500));
      await expect(loadReviewsHouse(baseParams)).rejects.toThrow(
        'Reviews request failed (500)'
      );
    });

    it('rethrows non-HTTP errors unchanged', async () => {
      const networkError = new TypeError('Failed to fetch');
      (mockHttp.get as jest.Mock).mockRejectedValue(networkError);
      await expect(loadReviewsHouse(baseParams)).rejects.toBe(networkError);
    });
  });
});
