import { getScore } from './Score';

interface ReviewCriterion {
  score: number;
  name: string;
  id: number;
}

export interface Review {
  id: string;
  score: number;
  name: string;
  createdAt: string;
  review: string;
  reviewCriteria: ReviewCriterion[];
}

interface ProcessedCriterion {
  id: number;
  name: string;
  score: number;
  color: string;
  formatted: string;
}

export interface ProcessedReview {
  id: string;
  name: string;
  createdAt: string;
  review: string;
  color: string;
  formatted: string;
  criteria: ProcessedCriterion[];
}

export function processReview(review: Review): ProcessedReview {
  const score = getScore(review.score);
  return {
    id: review.id,
    name: review.name,
    createdAt: review.createdAt,
    review: review.review,
    color: score.color,
    formatted: score.formatted,
    criteria: review.reviewCriteria.map((crit) => {
      const critScore = getScore(crit.score);
      return {
        id: crit.id,
        name: crit.name,
        score: crit.score,
        color: critScore.color,
        formatted: critScore.formatted
      };
    })
  };
}
