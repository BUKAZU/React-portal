import { differenceInCalendarDays, Parse_EN_US } from './date_helper';
import type { FiltersType } from '../components/SearchPage/filters/filter_types';

interface Pagination {
  limit: number;
  skip: number;
}

/**
 * Property ids to filter on: the multi-select `properties` filter plus every
 * `category_<id>` filter that has a value, which the filter panel renders as a
 * separate select per property category.
 */
function propertyIds(filters: FiltersType): number[] {
  const categoryIds = Object.entries(filters as Record<string, unknown>)
    .filter(([key, value]) => /^category_\d+$/.test(key) && value)
    .map(([, value]) => Number(value))
    .filter((id) => !isNaN(id));

  return [...(filters.properties || []), ...categoryIds].map(Number);
}

/** Adds a numeric filter, skipping the falsy values the filter panel uses for "unset". */
function setNumber(
  params: Record<string, string>,
  key: string,
  value: string | number | undefined
): void {
  const parsed = Number(value);
  if (!parsed) {
    return;
  }
  params[key] = String(parsed);
}

/**
 * Map the search filters onto the query params of
 * GET /portal_api/v1/accommodations.
 *
 * Dates come from `<input type="date">`, so they are already `yyyy-MM-dd` and are
 * passed through as-is. A filter is only sent when it has a value: the REST API
 * takes an empty string as a filter, where GraphQL dropped null variables.
 */
export function buildSearchParams(
  filters: FiltersType,
  { limit, skip }: Pagination
): Record<string, string> {
  const params: Record<string, string> = {
    limit: String(limit),
    skip: String(skip)
  };

  if (filters.countries) params.country_id = String(filters.countries);
  if (filters.regions) params.region_id = String(filters.regions);
  if (filters.cities) params.city_id = String(filters.cities);
  if (filters.extra_search) params.extra_search = filters.extra_search;

  setNumber(params, 'persons_min', filters.persons_min);
  setNumber(params, 'persons_max', filters.persons_max);
  setNumber(params, 'bedrooms_min', filters.bedrooms_min);
  setNumber(params, 'bathrooms_min', filters.bathrooms_min);
  setNumber(params, 'weekprice_max', filters.weekprice_max);

  const ids = propertyIds(filters);
  if (ids.length > 0) params.properties = ids.join(',');

  if (filters.arrival_date) {
    params.arrival_date = filters.arrival_date;

    if (filters.departure_date) {
      // Both dates: ask for the price of the stay next to the availability filter.
      params.starts_at = filters.arrival_date;
      params.ends_at = filters.departure_date;
      setNumber(
        params,
        'no_nights_min',
        differenceInCalendarDays(
          Parse_EN_US(filters.departure_date),
          Parse_EN_US(filters.arrival_date)
        )
      );
    } else {
      params.no_nights_min = '1';
    }
  }

  return params;
}
