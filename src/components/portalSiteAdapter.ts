/**
 * Assembles the portal-site configuration REST responses (see `_lib/portal_settings.ts`)
 * into the `AppPortalSite` shape the components consume. The REST API already uses
 * snake_case, matching the types directly — no field renaming needed.
 */
import type {
  BookingFieldResponse,
  FilterFieldResponse,
  SearchFacetsResponse,
  SettingsResponse
} from '../_lib/portal_settings';
import type { ColorsType, PortalOptions, PortalSiteType } from '../types';

/** The portal-site object assembled for the app, mirroring the legacy GraphQL shape. */
export interface AppPortalSite extends PortalSiteType {
  portal_code: string;
  options: PortalOptions;
  colorsConfiguration: ColorsType;
  countries: SearchFacetsResponse['countries'];
  regions: SearchFacetsResponse['regions'];
  cities: SearchFacetsResponse['cities'];
  extra_search: string[];
  booking_fields: MappedBookingField[];
  /** Dynamic localized labels exposed as bare `<field>_label` keys. */
  [key: string]: unknown;
}

/** A booking field shaped for both `options.bookingFields` and `PortalSite.booking_fields`. */
export type MappedBookingField = {
  id: string;
  label: string;
  field_type: string;
  type: string;
  options: unknown;
  required: boolean;
  placeholder: string | null;
};

/**
 * Flatten the all-locales label map down to the single requested locale, exposing
 * bare `<field>_label` keys (e.g. `labels["countries_label_nl"]` -> `countries_label`),
 * reproducing what the locale-aware GraphQL server returned.
 */
export function mapLabels(
  labels: Record<string, string>,
  locale: string
): Record<string, string> {
  const suffix = `_${locale}`;
  const source = labels ?? {};
  const result: Record<string, string> = {};
  Object.keys(source).forEach((key) => {
    if (key.endsWith(suffix)) {
      result[key.slice(0, -suffix.length)] = source[key];
    }
  });
  return result;
}

export function mapBookingFields(
  fields: BookingFieldResponse[]
): MappedBookingField[] {
  return (fields ?? []).map((f) => ({
    id: f.id,
    label: f.label,
    field_type: f.field_type,
    // `options.bookingFields` consumers branch on `.type`; mirror `field_type`.
    type: f.field_type,
    options: f.field_options,
    required: f.required,
    placeholder: f.placeholder
  }));
}

type MappedSearchFacets = {
  countries: SearchFacetsResponse['countries'];
  regions: SearchFacetsResponse['regions'];
  cities: SearchFacetsResponse['cities'];
  categories: SearchFacetsResponse['categories'];
  extra_search: string[];
  max_persons: number;
  max_bedrooms: number;
  max_bathrooms: number;
  max_nights: number;
  max_weekprice: number;
};

/** Flatten the search-facets response into the top-level fields the search UI reads. */
export function mapSearchFacets(
  facets: SearchFacetsResponse
): MappedSearchFacets {
  return {
    countries: facets.countries,
    regions: facets.regions,
    cities: facets.cities,
    categories: facets.categories,
    extra_search: facets.extra_search,
    max_persons: facets.max.persons,
    max_bedrooms: facets.max.bedrooms,
    max_bathrooms: facets.max.bathrooms,
    max_nights: facets.max.nights,
    max_weekprice: parseFloat(facets.max.weekprice)
  };
}

/** Map the filter-fields endpoint into the `options.searchFields` list the search UI renders. */
export function mapFilterFields(
  fields: FilterFieldResponse[]
): { id: string; type: string; label: string | null }[] {
  return (fields ?? []).map((f) => ({ id: f.id, type: f.field_type, label: f.label }));
}

interface BuildAppPortalSiteParams {
  settings: SettingsResponse;
  facets?: SearchFacetsResponse;
  filterFields?: FilterFieldResponse[];
  bookingFields?: BookingFieldResponse[];
  locale: string;
}

/** Assemble the full `AppPortalSite` from the config REST responses. */
export function buildAppPortalSite({
  settings,
  facets,
  filterFields,
  bookingFields,
  locale
}: BuildAppPortalSiteParams): AppPortalSite {
  const mappedBookingFields = mapBookingFields(bookingFields ?? []);
  const mappedSearchFields = mapFilterFields(filterFields ?? []);
  const colorsConfiguration: ColorsType = settings.colors;

  const options: PortalOptions = {
    filtersForm: settings.filters_form,
    bookingFields: mappedBookingFields,
    searchFields: filterFields !== undefined ? mappedSearchFields : undefined,
    bookingForm: {} as PortalOptions['bookingForm'],
    colors: colorsConfiguration
  };

  const emptyFacets: MappedSearchFacets = {
    countries: [],
    regions: [],
    cities: [],
    categories: [],
    extra_search: [],
    max_persons: 0,
    max_bedrooms: 0,
    max_bathrooms: 0,
    max_nights: 0,
    max_weekprice: 0
  };

  return {
    name: settings.name,
    portal_code: settings.portal_code,
    options,
    colorsConfiguration,
    bookingFormConfiguration: settings.booking_form,
    booking_fields: mappedBookingFields,
    ...(facets ? mapSearchFacets(facets) : emptyFacets),
    ...mapLabels(settings.labels, locale)
  } as AppPortalSite;
}
