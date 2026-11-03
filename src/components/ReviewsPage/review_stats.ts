import type { Review } from './SingleReview';

export interface CriterionAverage {
  name: string;
  score: number;
  /** Reviews that scored this criterium; set when the API supplied the average. */
  count?: number;
}

interface HouseAverages {
  averages: CriterionAverage[];
  /** How many reviews the averages rest on. */
  count: number;
  /** `api` = every published review (backend), `loaded` = the reviews on the page. */
  source: 'api' | 'loaded';
}

/**
 * The criteria averages to show for a house: the API's per-house averages
 * when the backend sends them, otherwise the averages of the reviews loaded
 * so far.
 */
export function houseCriteriaAverages(house: {
  reviews: Review[];
  criteriaAverages?: CriterionAverage[];
}): HouseAverages {
  if (house.criteriaAverages && house.criteriaAverages.length > 0) {
    return {
      averages: house.criteriaAverages,
      count: Math.max(...house.criteriaAverages.map((a) => a.count ?? 0)),
      source: 'api'
    };
  }
  return {
    averages: criteriaAverages(house.reviews),
    count: reviewsWithCriteria(house.reviews),
    source: 'loaded'
  };
}

/**
 * Average score per criterion over the given reviews, in the order the
 * criteria first appear. The API only returns criteria per review, so this is
 * computed from the reviews loaded so far; reviews without criteria are
 * skipped. Returns an empty list when no review carries criteria.
 */
export function criteriaAverages(reviews: Review[]): CriterionAverage[] {
  const totals = new Map<string, { sum: number; count: number }>();

  for (const review of reviews) {
    for (const criterion of review.reviewCriteria) {
      if (!criterion.name || !(criterion.score > 0)) continue;
      const total = totals.get(criterion.name) ?? { sum: 0, count: 0 };
      total.sum += criterion.score;
      total.count += 1;
      totals.set(criterion.name, total);
    }
  }

  return Array.from(totals, ([name, { sum, count }]) => ({
    name,
    score: Math.round((sum / count) * 10) / 10
  }));
}

/** Number of reviews that contributed at least one criterion score. */
export function reviewsWithCriteria(reviews: Review[]): number {
  return reviews.filter((review) =>
    review.reviewCriteria.some((criterion) => criterion.score > 0)
  ).length;
}
