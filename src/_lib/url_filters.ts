import type { FiltersType } from '../components/SearchPage/filters/filter_types';

/**
 * Filter keys that may be prefilled from the page URL. Everything else on the
 * landlord's URL (their own tracking or routing params) is ignored.
 */
const FILTER_KEYS: readonly string[] = [
  'countries',
  'regions',
  'cities',
  'arrival_date',
  'departure_date',
  'persons_min',
  'persons_max',
  'bedrooms_min',
  'bathrooms_min',
  'weekprice_max',
  'extra_search'
];

/**
 * Parse search filters out of a URL query string (`window.location.search`),
 * so a landlord can deep-link into filtered results, e.g.
 * `?arrival_date=2026-07-01&persons_min=4`.
 *
 * Only whitelisted filter keys and the dynamic `category_<id>` keys are
 * accepted; `properties` takes a comma-separated list of property ids. All
 * values stay strings, matching how the filter components compare values.
 */
export function parseFiltersFromUrl(search: string): FiltersType {
  const params = new URLSearchParams(search);
  const filters: Record<string, unknown> = {};

  params.forEach((value, key) => {
    if (!value) {
      return;
    }

    if (key === 'properties') {
      const ids = value
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);
      if (ids.length > 0) {
        filters.properties = ids;
      }
      return;
    }

    if (FILTER_KEYS.includes(key) || /^category_\d+$/.test(key)) {
      filters[key] = value;
    }
  });

  return filters as FiltersType;
}
