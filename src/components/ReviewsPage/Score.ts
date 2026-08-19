import { getScoreColor } from './getScoreColor';

interface ScoreResult {
  color: string;
  formatted: string;
}

export function getScore(rating: number): ScoreResult {
  return {
    color: getScoreColor(rating),
    formatted: rating % 1 === 0 ? String(rating) : rating.toFixed(1)
  };
}
