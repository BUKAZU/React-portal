import { http } from './http_client';
import { HTTPError } from 'ky';

/** Price for the requested period, only present when the search carried a period. */
export interface AccommodationBookingPrice {
  total_price: number;
  currency: string;
}

/** A single accommodation as returned by GET /portal_api/v1/accommodations. */
export interface AccommodationResult {
  id: number;
  code: string;
  name: string;
  description: string;
  image_url: string | null;
  house_url: string | null;
  persons: number;
  bedrooms: number;
  bathrooms: number;
  city: string;
  province: string;
  country_name: string;
  minimum_week_price: number;
  rating: number | null;
  /** Omitted entirely when the search carried no arrival/departure date. */
  booking_price?: AccommodationBookingPrice;
}

/** Full response of GET /portal_api/v1/accommodations. */
export interface AccommodationsResponse {
  items: AccommodationResult[];
  meta: {
    /** Number of matching accommodations, ignoring limit and skip. */
    total_count: number;
    limit: number;
    skip: number;
  };
}

interface FetchAccommodationsParams {
  /** The GraphQL api_url; only its origin is used to reach the REST API. */
  apiUrl: string;
  locale: string;
  portalCode: string;
  /** Filters and pagination, as built by buildSearchParams. */
  params: Record<string, string>;
  /** Aborts the request when the filters change before it resolves. */
  signal?: AbortSignal;
}

const SEARCH_PATH = '/portal_api/v1/accommodations';

/**
 * Build the REST search URL by reusing the origin of the configured GraphQL
 * api_url, so staging/local overrides keep working.
 */
export function buildSearchUrl({
  apiUrl,
  portalCode,
  params
}: Omit<FetchAccommodationsParams, 'locale' | 'signal'>): string {
  const url = new URL(SEARCH_PATH, new URL(apiUrl).origin);
  url.search = new URLSearchParams({
    portal_code: portalCode,
    ...params
  }).toString();
  return url.toString();
}

/**
 * Fetch the accommodations matching the search filters from the REST API.
 * Replaces the legacy GraphQL PortalSite.houses queries.
 */
export async function fetchAccommodations({
  apiUrl,
  locale,
  portalCode,
  params,
  signal
}: FetchAccommodationsParams): Promise<AccommodationsResponse> {
  const url = buildSearchUrl({ apiUrl, portalCode, params });

  try {
    return await http
      .get(url, { headers: { locale }, signal })
      .json<AccommodationsResponse>();
  } catch (error) {
    if (error instanceof HTTPError) {
      throw new Error(`Search request failed (${error.response.status})`);
    }
    throw error;
  }
}
