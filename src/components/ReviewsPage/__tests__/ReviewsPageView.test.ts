import { createReviewsPageView } from '../ReviewsPageView';
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
    reviewCriteria: Array<{ id: number; name: string; score: number }>;
  }) => ({
    id: review.id,
    name: review.name,
    createdAt: review.createdAt,
    review: review.review,
    color: 'best',
    formatted: review.score.toFixed(1),
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
          reviewCriteria: [{ id: 1, name: 'Cleanliness', score: 9 }]
        }
      ]
    };

    const node = createReviewsPageView(house);

    expect(node.className).toContain('bu_reviews');
    expect(node.textContent).toContain('42 reviews');
    expect(node.textContent).toContain('Alice');
    expect(node.textContent).toContain('Great place');
    expect(node.querySelector('.bu_reviews__note a')?.textContent).toBe(
      'reviews_note_link'
    );
  });
});
