import { criteriaAverages, reviewsWithCriteria } from '../review_stats';
import type { Review } from '../SingleReview';

const review = (criteria: Array<[string, number]>): Review => ({
  id: '',
  name: '',
  createdAt: '2024-01-01',
  review: '',
  score: 8,
  sourceName: '',
  reviewResponses: [],
  reviewCriteria: criteria.map(([name, score], id) => ({ id, name, score }))
});

describe('criteriaAverages', () => {
  it('averages each criterion over the reviews in first-seen order', () => {
    const result = criteriaAverages([
      review([
        ['Cleanliness', 9],
        ['Value', 7]
      ]),
      review([
        ['Value', 8],
        ['Location', 10]
      ]),
      review([['Cleanliness', 8]])
    ]);
    expect(result).toEqual([
      { name: 'Cleanliness', score: 8.5 },
      { name: 'Value', score: 7.5 },
      { name: 'Location', score: 10 }
    ]);
  });

  it('rounds to one decimal', () => {
    expect(
      criteriaAverages([
        review([['A', 7]]),
        review([['A', 8]]),
        review([['A', 8]])
      ])
    ).toEqual([{ name: 'A', score: 7.7 }]);
  });

  it('ignores criteria without a name or score', () => {
    expect(
      criteriaAverages([
        review([
          ['', 9],
          ['Value', 0],
          ['Location', 6]
        ])
      ])
    ).toEqual([{ name: 'Location', score: 6 }]);
    expect(criteriaAverages([review([])])).toEqual([]);
  });
});

describe('reviewsWithCriteria', () => {
  it('counts the reviews that scored at least one criterion', () => {
    expect(
      reviewsWithCriteria([review([['A', 9]]), review([['A', 0]]), review([])])
    ).toBe(1);
  });
});
