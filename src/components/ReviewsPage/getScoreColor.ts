export function getScoreColor(rating: number): string {
  if (rating > 7) return 'best';
  if (rating > 6) return 'good';
  if (rating > 4) return 'medium';
  return 'low';
}
