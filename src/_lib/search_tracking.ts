import type { FiltersType } from '../components/SearchPage/filters/filter_types';
import type { FilterValue } from './Tracking';

type Scalar = string | number;
type Format = (value: unknown) => value is Scalar;

const MAX_LIST = 50;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DIGITS = /^\d{1,10}$/;
const PLACE_PART = "\\|[\\p{L}\\p{M}\\d '’.()-]{1,100}";
const REGION = new RegExp(`^\\d{1,10}${PLACE_PART}$`, 'u');
const CITY = new RegExp(`^\\d{1,10}${PLACE_PART}${PLACE_PART}$`, 'u');

function isoDate(value: string | undefined): string | undefined {
  return value && ISO_DATE.test(value) ? value : undefined;
}

function isCount(value: unknown): value is Scalar {
  if (typeof value === 'number') {
    return Number.isSafeInteger(value) && value >= 0;
  }
  return typeof value === 'string' && DIGITS.test(value);
}

function matching(pattern: RegExp): Format {
  return (value: unknown): value is Scalar =>
    typeof value === 'string' && pattern.test(value);
}

// Mirrors the server's whitelist: one value it cannot parse rejects the whole
// event, so anything that does not fit is dropped here.
const FORMATS: Record<string, { format: Format; list: boolean }> = {
  countries: { format: isCount, list: true },
  properties: { format: isCount, list: true },
  regions: { format: matching(REGION), list: true },
  cities: { format: matching(CITY), list: true },
  persons_max: { format: isCount, list: false },
  bedrooms_min: { format: isCount, list: false },
  bathrooms_min: { format: isCount, list: false },
  weekprice_max: { format: isCount, list: false }
};

function filterValue(
  value: unknown,
  { format, list }: { format: Format; list: boolean }
): FilterValue | undefined {
  if (format(value)) return value;
  if (!list || !Array.isArray(value) || value.length > MAX_LIST) {
    return undefined;
  }
  const values = value.filter(format);
  return values.length > 0 ? values : undefined;
}

export function searchFilters(
  filters: FiltersType
): Record<string, FilterValue> {
  const result: Record<string, FilterValue> = {};
  for (const [key, spec] of Object.entries(FORMATS)) {
    const value = filterValue(filters[key as keyof FiltersType], spec);
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
