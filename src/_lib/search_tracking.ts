import type { FiltersType } from '../components/SearchPage/filters/filter_types';
import { isToken, type FilterValue } from './Tracking';

// Sent as their own keys, or (extra_search) free text the server rejects.
const NOT_FILTERS = [
  'arrival_date',
  'departure_date',
  'persons_min',
  'persons_max',
  'extra_search'
];

type Scalar = string | number;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isoDate(value: string | undefined): string | undefined {
  return value && ISO_DATE.test(value) ? value : undefined;
}

function isScalar(value: unknown): value is Scalar {
  return isToken(value) || (typeof value === 'number' && isFinite(value));
}

function filterValue(value: unknown): FilterValue | undefined {
  if (isScalar(value) || typeof value === 'boolean') return value;
  if (Array.isArray(value)) {
    const values = value.filter(isScalar);
    return values.length > 0 ? values : undefined;
  }
  return undefined;
}

export function searchFilters(
  filters: FiltersType
): Record<string, FilterValue> {
  const result: Record<string, FilterValue> = {};
  for (const [key, raw] of Object.entries(filters)) {
    if (NOT_FILTERS.includes(key) || !isToken(key)) continue;
    const value = filterValue(raw);
    if (value !== undefined) result[key] = value;
  }
  return result;
}

export function searchInfo(filters: FiltersType, resultCount: number) {
  const persons = parseInt(String(filters.persons_min ?? ''), 10);
  const rest = searchFilters(filters);
  return {
    arrival: isoDate(filters.arrival_date),
    departure: isoDate(filters.departure_date),
    persons: persons > 0 ? persons : undefined,
    filters: Object.keys(rest).length > 0 ? rest : undefined,
    result_count: resultCount
  };
}
