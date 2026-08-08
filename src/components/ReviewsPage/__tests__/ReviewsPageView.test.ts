import { createReviewsPageView } from '../ReviewsPageView';
import { formatReviewDate } from '../../../_lib/date_helper';
import type { ReviewsHouse } from '../ReviewsPage';

jest.mock('../../../intl', () => ({
  t: (id: string) => id
}));

jest.mock('../Score', () => ({
  getScore: () => ({
    color: 'best',
    formatted: '8.5'
  })
}));

jest.mock('../SingleReview', () => ({
  processReview: (review: {
    id: string;
    name: string;
    createdAt: string;
    review: string;
    score: number;
    sourceName: string;
    reviewResponses: Array<{
      created_at: string;
      sender: string;
      message: string;
    }>;
    reviewCriteria: Array<{ id: number; name: string; score: number }>;
  }) => ({
    id: review.id,
    name: review.name,
    createdAt: review.createdAt,
    review: review.review,
    color: 'best',
    formatted: review.score.toFixed(1),
    sourceName: review.sourceName,
    reviewResponses: review.reviewResponses,
    criteria: review.reviewCriteria.map((item) => ({
      id: item.id,
      name: item.name,
      score: item.score,
      color: 'best',
      formatted: item.score.toFixed(1)
    }))
  })
}));

describe('createReviewsPageView', () => {
  it('creates DOM for overview, reviews, and note section', () => {
    const house: ReviewsHouse = {
      id: 'h1',
      name: 'House',
      rating: 8.5,
      scoreAmount: 42,
      reviews: [
        {
          id: '1',
          name: 'Alice',
          createdAt: '2024-01-15',
          review: 'Great place',
          score: 9,
          sourceName: '',
          reviewResponses: [],
          reviewCriteria: [{ id: 1, name: 'Cleanliness', score: 9 }]
        }
      ]
    };

    const node = createReviewsPageView(house);

    expect(node.className).toContain('bu_reviews');
    expect(node.textContent).toContain('42 reviews');
    expect(node.textContent).toContain('Alice');
    expect(node.textContent).toContain('Great place');
    expect(node.querySelector('.bu_reviews__note')).toBeNull();
  });

  it('renders sourceName when present', () => {
    const house: ReviewsHouse = {
      id: 'h1',
      name: 'House',
      rating: 8.0,
      scoreAmount: 1,
      reviews: [
        {
          id: '1',
          name: 'Bob',
          createdAt: '2024-02-01',
          review: 'Nice stay',
          score: 8,
          sourceName: 'Booking.com',
          reviewResponses: [],
          reviewCriteria: []
        }
      ]
    };

    const node = createReviewsPageView(house);
    expect(node.querySelector('.bu_review_summary__source')?.textContent).toBe(
      'Booking.com'
    );
  });

  it('renders review responses when present', () => {
    (window as any).__localeId__ = 'en';

    const house: ReviewsHouse = {
      id: 'h1',
      name: 'House',
      rating: 8.0,
      scoreAmount: 1,
      reviews: [
        {
          id: '1',
          name: 'Carol',
          createdAt: '2024-03-01',
          review: 'Lovely',
          score: 9,
          sourceName: '',
          reviewResponses: [
            {
              created_at: '2024-03-02',
              sender: 'landlord',
              message: 'Thank you!'
            }
          ],
          reviewCriteria: []
        }
      ]
    };

    const node = createReviewsPageView(house);
    expect(node.querySelector('.bu_review_responses')).not.toBeNull();
    expect(node.querySelector('.bu_review_response__label')?.textContent).toBe(
      'review_response_label'
    );
    expect(
      node.querySelector('.bu_review_response__message')?.textContent
    ).toBe('Thank you!');
    expect(node.querySelector('.bu_review_response__sender')?.textContent).toBe(
      'landlord'
    );
    expect(node.querySelector('.bu_review_response__date')?.textContent).toBe(
      formatReviewDate('2024-03-02')
    );

    delete (window as any).__localeId__;
  });

  it('does not render review responses section when empty', () => {
    const house: ReviewsHouse = {
      id: 'h1',
      name: 'House',
      rating: 8.0,
      scoreAmount: 1,
      reviews: [
        {
          id: '1',
          name: 'Dave',
          createdAt: '2024-04-01',
          review: 'Good',
          score: 7,
          sourceName: '',
          reviewResponses: [],
          reviewCriteria: []
        }
      ]
    };

    const node = createReviewsPageView(house);
    expect(node.querySelector('.bu_review_responses')).toBeNull();
  });
});
