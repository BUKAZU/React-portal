import { http } from './http_client';
import { HTTPError } from 'ky';

/**
 * The accommodation metadata shared by the detail endpoint and by the price
 * endpoint's `accommodation` key (include_accommodation=true).
 */
export interface Accommodation {
  id: number;
  name: string;
  code: string;
  allow_option: boolean;
  persons: number;
  image_url: string | null;
  discounts: string | null;
  discounts_info: string | null;
  house_type: string;
  rental_terms: string | null;
  cancel_insurance: boolean;
  damage_insurance: boolean;
  damage_insurance_required: boolean;
  travel_insurance: boolean;
  babies_extra: number;
}

/** Full response of GET /portal_api/v1/accommodations/detail. */
export interface AccommodationDetail extends Accommodation {
  /** Longest bookable stay, in nights. */
  max_nights: number;
  /** Days before arrival within which a booking counts as last minute. */
  last_minute_days: number;
}

/**
 * A failed accommodation lookup. A 404 means the accommodation is not
 * published on this portal site, which the calendar renders as "no house
 * found" rather than as an error.
 */
export class AccommodationDetailError extends Error {
  readonly status: number;
  readonly notFound: boolean;

  constructor(status: number) {
    super(`Accommodation detail request failed (${status})`);
    this.name = 'AccommodationDetailError';
    this.status = status;
    this.notFound = status === 404;
  }
}

interface FetchAccommodationDetailParams {
  /** The GraphQL api_url; only its origin is used to reach the REST API. */
  apiUrl: string;
  locale: string;
  portalCode: string;
  objectCode: string;
}

const DETAIL_PATH = '/portal_api/v1/accommodations/detail';

/**
 * Build the REST detail URL by reusing the origin of the configured GraphQL
 * api_url, so staging/local overrides keep working.
 */
export function buildAccommodationDetailUrl({
  apiUrl,
  portalCode,
  objectCode
}: Omit<FetchAccommodationDetailParams, 'locale'>): string {
  const url = new URL(DETAIL_PATH, new URL(apiUrl).origin);

  url.search = new URLSearchParams({
    portal_code: portalCode,
    object_code: objectCode
  }).toString();

  return url.toString();
}

/**
 * Fetch the metadata of a single accommodation through the REST API.
 * Replaces the legacy GraphQL SINGLE_HOUSE_QUERY.
 */
export async function fetchAccommodationDetail(
  params: FetchAccommodationDetailParams
): Promise<AccommodationDetail> {
  const url = buildAccommodationDetailUrl(params);

  try {
    return await http
      .get(url, { headers: { locale: params.locale } })
      .json<AccommodationDetail>();
  } catch (error) {
    if (error instanceof HTTPError) {
      throw new AccommodationDetailError(error.response.status);
    }
    throw error;
  }
}
