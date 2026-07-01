export function isInt(value: unknown): boolean {
  if (typeof value !== 'string' && typeof value !== 'number') return false;
  const n = parseFloat(value as string);
  return !isNaN(n) && (n | 0) === n;
}
