import { processReview, Review } from '../SingleReview';

const mockReview: Review = {
  id: '1',
  score: 8.5,
  name: 'Alice',
  createdAt: '2024-01-15',
  review: 'Great place!',
  sourceName: 'Booking.com',
  reviewResponses: [{ created_at: '2024-01-16', sender: 'landlord', message: 'Thank you!' }],
  reviewCriteria: [
    { id: 1, name: 'Cleanliness', score: 9 },
    { id: 2, name: 'Location', score: 5 }
  ]
};

describe('processReview', () => {
  it('passes through id, name, createdAt, and review text', () => {
    const result = processReview(mockReview);
    expect(result.id).toBe('1');
    expect(result.name).toBe('Alice');
    expect(result.createdAt).toBe('2024-01-15');
    expect(result.review).toBe('Great place!');
  });

  it('passes through sourceName and reviewResponses', () => {
    const result = processReview(mockReview);
    expect(result.sourceName).toBe('Booking.com');
    expect(result.reviewResponses).toEqual(mockReview.reviewResponses);
  });

  it('computes color and formatted score from rating', () => {
    const result = processReview(mockReview);
    expect(result.color).toBe('best');
    expect(result.formatted).toBe('8.5');
  });

  it('processes review criteria with score colors', () => {
    const result = processReview(mockReview);
    expect(result.criteria).toHaveLength(2);

    expect(result.criteria[0]).toEqual({
      id: 1,
      name: 'Cleanliness',
      score: 9,
      color: 'best',
      formatted: '9'
    });

    expect(result.criteria[1]).toEqual({
      id: 2,
      name: 'Location',
      score: 5,
      color: 'medium',
      formatted: '5'
    });
  });

  it('handles low score reviews', () => {
    const lowReview: Review = {
      ...mockReview,
      score: 3,
      reviewCriteria: [{ id: 1, name: 'Comfort', score: 2 }]
    };
    const result = processReview(lowReview);
    expect(result.color).toBe('low');
    expect(result.formatted).toBe('3');
    expect(result.criteria[0].color).toBe('low');
  });
});
