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
      'via_source'
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

  it('shows the band label, the count with the house name and the criteria averages', () => {
    const node = createReviewsPageView({
      id: 'h1',
      name: 'Chalet',
      rating: 8.5,
      scoreAmount: 42,
      reviews: [
        {
          id: '1',
          name: 'Alice',
          createdAt: '2024-01-15',
          review: 'Great',
          score: 9,
          sourceName: '',
          reviewResponses: [],
          reviewCriteria: [
            { id: 1, name: 'Cleanliness', score: 9 },
            { id: 2, name: 'Value', score: 7 }
          ]
        },
        {
          id: '2',
          name: 'Bob',
          createdAt: '2024-01-10',
          review: 'Fine',
          score: 8,
          sourceName: '',
          reviewResponses: [],
          reviewCriteria: [{ id: 1, name: 'Cleanliness', score: 8 }]
        }
      ]
    });
    const header = node.querySelector('.bu-reviews-header') as HTMLElement;
    expect(header.querySelector('.bu-score-lg')?.textContent).toBe('8.5');
    expect(header.querySelector('.bu-reviews-header-label')?.textContent).toBe(
      'score_excellent'
    );
    expect(
      header.querySelector('.bu_reviews__overview__number')?.textContent
    ).toBe('42 reviews · Chalet');
    const rows = header.querySelectorAll('.bu-criteria-average');
    expect(rows).toHaveLength(2);
    expect(rows[0].textContent).toBe('Cleanliness8.5');
    expect(
      (rows[0].querySelector('.bu-criteria-bar span') as HTMLElement).style
        .width
    ).toBe('85%');
    expect(rows[1].textContent).toBe('Value8.5');
    expect(
      header.querySelector('.bu-criteria-averages-hint')?.textContent
    ).toBe('based_on_last_reviews');
  });

  it('skips the score and averages when the house has neither', () => {
    const node = createReviewsPageView({
      id: 'h1',
      name: '',
      rating: 0,
      scoreAmount: 0,
      reviews: [
        {
          id: '1',
          name: 'Alice',
          createdAt: '2024-01-15',
          review: 'Great',
          score: 0,
          sourceName: '',
          reviewResponses: [],
          reviewCriteria: []
        }
      ]
    });
    expect(node.querySelector('.bu-score-lg')).toBeNull();
    expect(node.querySelector('.bu-reviews-header-label')).toBeNull();
    expect(
      node.querySelector('.bu_reviews__overview__number')?.textContent
    ).toBe('0 reviews');
    expect(node.querySelector('.bu-criteria-averages')).toBeNull();
    expect(
      node.querySelector('.bu_single_review .bu_score__rating')
    ).toBeNull();
  });

  it('renders a review without text as a slim card', () => {
    const node = createReviewsPageView({
      id: 'h1',
      name: 'House',
      rating: 8.5,
      scoreAmount: 1,
      reviews: [
        {
          id: '1',
          name: 'Lisa',
          createdAt: '2024-01-15',
          review: '   ',
          score: 8,
          sourceName: 'Booking.com',
          reviewResponses: [],
          reviewCriteria: [
            { id: 1, name: 'Cleanliness', score: 8 },
            { id: 2, name: 'Comment', score: 0 }
          ]
        }
      ]
    });
    const card = node.querySelector('.bu_single_review') as HTMLElement;
    expect(card.classList.contains('bu-review-card-slim')).toBe(true);
    expect(card.querySelector('.bu_review')).toBeNull();
    expect(card.querySelector('.bu_review_summary__date')?.textContent).toBe(
      `${formatReviewDate('2024-01-15')} · score_only`
    );
    const pills = card.querySelectorAll('.bu-criterion');
    expect(pills).toHaveLength(2);
    expect(pills[0].querySelector('.bu-criterion-dot')).not.toBeNull();
    expect(pills[0].querySelector('.bu-criterion-score')?.textContent).toBe(
      '8.0'
    );
    expect(pills[1].querySelector('.bu-criterion-dot')).toBeNull();
    expect(pills[1].querySelector('.bu-criterion-score')).toBeNull();
  });
});
