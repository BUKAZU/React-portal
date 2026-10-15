/**
 * Score band for a 0–10 rating. `best` and `good` are greens, `medium` is
 * amber and `low` is red (see reviews.css), so a weak score reads as one.
 */
export function getScoreColor(rating: number): string {
  if (rating > 8) return 'best';
  if (rating > 7) return 'good';
  if (rating > 5.5) return 'medium';
  return 'low';
}

/** Locale key of the label shown next to a house score. */
export function getScoreLabelKey(rating: number): string {
  switch (getScoreColor(rating)) {
    case 'best':
      return 'score_excellent';
    case 'good':
      return 'score_very_good';
    case 'medium':
      return 'score_good';
    default:
      return 'score_fair';
  }
}
