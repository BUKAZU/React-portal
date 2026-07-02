export function isInt(value: unknown): boolean {
  if (typeof value === 'number') {
    return Number.isInteger(value);
  }

  if (typeof value === 'string') {
    return /^-?\d+$/.test(value);
  }

  return false;
}
