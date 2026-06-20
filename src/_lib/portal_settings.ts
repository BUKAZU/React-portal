/**
 * REST client for the portal-site configuration endpoints
 * (GET /portal_api/v1/config/*). Replaces the legacy GraphQL PortalSite settings
 * reads (PORTAL_BASE_QUERY / PORTAL_SEARCH_QUERY and the settings portions of the
 * booking queries). Mirrors the availability client in `availability.ts`: native
 * fetch, REST origin derived from the configured GraphQL api_url, locale header.
 */

/** Colour configuration as returned by the settings endpoint. */
export type SettingsColors = {
  button: string;
  button_cta: string;
  discount: string;
  cell: string;
  booked: string;
  arrival: string;
  departure: string;
};

/** Booking-form configuration as returned by the settings endpoint. */
export type SettingsBookingForm = {
  number_of_months: number;
  number_of_months_in_a_row: number;
  children: boolean;
  babies: boolean;
  babies_til: number;
  children_from: number;
  children_til: number;
  adults_from: number;
  show_discount_code: boolean;
  language_selector_visible: boolean;
  redirect_urls: Record<string, string | null>;
};

/** Filters-panel configuration as returned by the settings endpoint. */
export type SettingsFiltersForm = {
  show: boolean;
  location: string;
  mode: string;
  no_results: number;
  fixed_mobile: boolean;
  categories: number[];
  show_price: boolean;
  show_persons: boolean;
  show_bedrooms: boolean;
  show_bathrooms: boolean;
  show_country: boolean;
  show_region: boolean;
  show_city: boolean;
};

/** Full response of GET /portal_api/v1/config/settings. */
export type SettingsResponse = {
  name: string;
  domain: string;
  portal_code: string;
  commission: number;
  use_custom_commission: boolean;
  colors: SettingsColors;
  booking_form: SettingsBookingForm;
  filters_form: SettingsFiltersForm;
  /** Flat map of "<attribute>_<locale>" => localized value, for every locale. */
  labels: Record<string, string>;
};

type NameId = { id: number; name: string };

/** Full response of GET /portal_api/v1/config/search-facets. */
export type SearchFacetsResponse = {
  countries: NameId[];
  regions: Array<{ id: number; name: string; country_id: number }>;
  cities: Array<{ id: number; name: string; region: string; country_id: number }>;
  categories: Array<{ id: number; name: string; properties: NameId[] }>;
  extra_search: string[];
  max: {
    persons: number;
    bedrooms: number;
    bathrooms: number;
    nights: number;
    weekprice: number;
  };
};

/** A single entry of GET /portal_api/v1/config/booking-fields. */
export type BookingFieldResponse = {
  id: string;
  label: string;
  field_type: string;
  field_options: unknown;
  required: boolean;
  placeholder: string | null;
};

/** A single entry of GET /portal_api/v1/config/filter-fields. */
export type FilterFieldResponse = {
  id: string;
  field_type: string;
  position: number;
  visible: boolean;
  label: string | null;
};

interface ConfigRequestParams {
  /** The GraphQL api_url; only its origin is used to reach the REST API. */
  apiUrl: string;
  locale: string;
  portalCode: string;
}

const CONFIG_BASE = '/portal_api/v1/config';

/**
 * Build a config URL by reusing the origin of the configured GraphQL api_url, so
 * staging/local overrides keep working.
 */
function buildConfigUrl(
  apiUrl: string,
  resource: string,
  portalCode: string
): string {
  const url = new URL(`${CONFIG_BASE}/${resource}`, new URL(apiUrl).origin);
  url.search = new URLSearchParams({ portal_code: portalCode }).toString();
  return url.toString();
}

export function buildSettingsUrl({
  apiUrl,
  portalCode
}: Omit<ConfigRequestParams, 'locale'>): string {
  return buildConfigUrl(apiUrl, 'settings', portalCode);
}

export function buildSearchFacetsUrl({
  apiUrl,
  portalCode
}: Omit<ConfigRequestParams, 'locale'>): string {
  return buildConfigUrl(apiUrl, 'search-facets', portalCode);
}

export function buildBookingFieldsUrl({
  apiUrl,
  portalCode
}: Omit<ConfigRequestParams, 'locale'>): string {
  return buildConfigUrl(apiUrl, 'booking-fields', portalCode);
}

export function buildFilterFieldsUrl({
  apiUrl,
  portalCode
}: Omit<ConfigRequestParams, 'locale'>): string {
  return buildConfigUrl(apiUrl, 'filter-fields', portalCode);
}

async function fetchConfig<T>(url: string, locale: string): Promise<T> {
  const response = await fetch(url, {
    headers: { locale, Accept: 'application/json' }
  });

  if (!response.ok) {
    throw new Error(`Portal settings request failed (${response.status})`);
  }

  return (await response.json()) as T;
}

export function fetchSettings({
  apiUrl,
  locale,
  portalCode
}: ConfigRequestParams): Promise<SettingsResponse> {
  return fetchConfig<SettingsResponse>(
    buildSettingsUrl({ apiUrl, portalCode }),
    locale
  );
}

export function fetchSearchFacets({
  apiUrl,
  locale,
  portalCode
}: ConfigRequestParams): Promise<SearchFacetsResponse> {
  return fetchConfig<SearchFacetsResponse>(
    buildSearchFacetsUrl({ apiUrl, portalCode }),
    locale
  );
}

export function fetchBookingFields({
  apiUrl,
  locale,
  portalCode
}: ConfigRequestParams): Promise<BookingFieldResponse[]> {
  return fetchConfig<BookingFieldResponse[]>(
    buildBookingFieldsUrl({ apiUrl, portalCode }),
    locale
  );
}

export function fetchFilterFields({
  apiUrl,
  locale,
  portalCode
}: ConfigRequestParams): Promise<FilterFieldResponse[]> {
  return fetchConfig<FilterFieldResponse[]>(
    buildFilterFieldsUrl({ apiUrl, portalCode }),
    locale
  );
}
