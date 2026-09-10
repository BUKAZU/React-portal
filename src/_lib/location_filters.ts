import type { FiltersType } from '../components/SearchPage/filters/filter_types';
import {
  hasFilterValue,
  removeFilter,
  type ResolvedOption
} from './active_filters';

/** Location filters from broad to narrow; each option knows its parents. */
const CHAIN = ['countries', 'regions', 'cities'] as const;
type LocationKey = (typeof CHAIN)[number];

type LocationOption = {
  id: string | number;
  country_id?: string | number;
  region?: string | number;
};

function isLocationKey(key: string): key is LocationKey {
  return (CHAIN as readonly string[]).includes(key);
}

function same(a: unknown, b: unknown): boolean {
  return String(a) === String(b);
}

/** Whether a filter value (a single id, or a list of ids from a deep link) names `id`. */
function includesId(value: unknown, id: unknown): boolean {
  return Array.isArray(value)
    ? value.some((v) => same(v, id))
    : same(value, id);
}

function findOption(
  options: ResolvedOption[] | undefined,
  value: unknown
): LocationOption | null {
  for (const option of options ?? []) {
    if (typeof option === 'object' && same(option.id, value)) {
      return option;
    }
  }
  return null;
}

/**
 * Apply one filter change, keeping the country > region > city chain consistent:
 *
 * - picking a region also picks its country; picking a city also picks its
 *   region and country (read from the option's `country_id` / `region`);
 * - clearing a country clears the region and city, clearing a region clears
 *   the city;
 * - a region or city that no longer belongs to the picked country is dropped.
 *
 * `optionsById` holds the resolved options per field id; a chain field without
 * options is left untouched, since nothing can be inferred for it.
 */
export function applyFilterChange(
  filters: FiltersType,
  key: string,
  value: unknown,
  optionsById: Map<string, ResolvedOption[]>
): FiltersType {
  let next = hasFilterValue(value)
    ? ({ ...filters, [key]: value } as FiltersType)
    : removeFilter(filters, key);

  if (!isLocationKey(key)) {
    return next;
  }

  const position = CHAIN.indexOf(key);

  if (!hasFilterValue(value)) {
    for (const child of CHAIN.slice(position + 1)) {
      next = removeFilter(next, child);
    }
    return next;
  }

  // Fill in the parents the picked option belongs to.
  const values = next as Record<string, unknown>;
  if (key === 'cities') {
    const city = findOption(optionsById.get('cities'), value);
    if (city?.region !== undefined && city.region !== null) {
      values.regions = String(city.region);
    }
    if (city?.country_id !== undefined && city.country_id !== null) {
      values.countries = String(city.country_id);
    }
  } else if (key === 'regions') {
    const region = findOption(optionsById.get('regions'), value);
    if (region?.country_id !== undefined && region.country_id !== null) {
      values.countries = String(region.country_id);
    }
  }

  // Drop children that no longer belong to the (possibly new) parents.
  const region = findOption(optionsById.get('regions'), values.regions);
  if (
    hasFilterValue(values.regions) &&
    region?.country_id !== undefined &&
    hasFilterValue(values.countries) &&
    !includesId(values.countries, region.country_id)
  ) {
    next = removeFilter(next, 'regions');
  }

  const city = findOption(optionsById.get('cities'), values.cities);
  const cityValues = next as Record<string, unknown>;
  if (hasFilterValue(cityValues.cities) && city) {
    const wrongCountry =
      city.country_id !== undefined &&
      hasFilterValue(cityValues.countries) &&
      !includesId(cityValues.countries, city.country_id);
    const wrongRegion =
      city.region !== undefined &&
      hasFilterValue(cityValues.regions) &&
      !includesId(cityValues.regions, city.region);
    if (wrongCountry || wrongRegion) {
      next = removeFilter(next, 'cities');
    }
  }

  return next;
}
