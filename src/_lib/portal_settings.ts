/**
 * REST client for the portal-site configuration endpoints
 * (GET /portal_api/v1/config/*). Replaces the legacy GraphQL PortalSite settings
 * reads (PORTAL_BASE_QUERY / PORTAL_SEARCH_QUERY and the settings portions of the
 * booking queries). Mirrors the availability client in `availability.ts`: shared ky
 * http client, REST origin derived from the configured GraphQL api_url, locale header.
 */

import { HTTPError } from 'ky';

import { http, parseResponse } from './http_client';

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
  show_months_amount: number;
  show_months_in_a_row_amount: number;
  children_allowed: boolean;
  babies_allowed: boolean;
  babies_till_age: number;
  children_from_age: number;
  children_till_age: number;
  adults_from_age: number;
  show_discount_code: boolean;
  language_selector_visible: boolean;
  redirect_urls: Record<string, string | null>;
};

/** Filters-panel configuration as returned by the settings endpoint. */
export type SettingsFiltersForm = {
  show: boolean;
  location: string;
  mode: 'grid' | 'list';
  no_results: number;
  fixed_mobile: boolean;
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
  commission: string;
  use_custom_commission: boolean;
  colors: SettingsColors;
  booking_form: SettingsBookingForm;
  filters_form: SettingsFiltersForm;
  /** Flat map of "<attribute>_<locale>" => localized value, for every locale. */
  labels: Record<string, string>;
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
  label: string | null;
  /** Upper bound for numeric select fields (e.g. persons_min). */
  max?: number;
  /** Selectable options for select/list fields (e.g. category properties). */
  options?: { id: number; name: string }[];
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
  try {
    return await parseResponse<T>(await http.get(url, { headers: { locale } }));
  } catch (error) {
    if (error instanceof HTTPError) {
      throw new Error(`Portal settings request failed (${error.response.status})`);
    }
    throw error;
  }
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
