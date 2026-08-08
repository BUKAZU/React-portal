export function escapeHtml(value: unknown): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function isInt(value: unknown): boolean {
  if (typeof value === 'number') {
    return Number.isInteger(value);
  }

  if (typeof value === 'string') {
    return /^-?\d+$/.test(value);
  }

  return false;
}
