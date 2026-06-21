import { FormatIntl } from './date_helper';
import { http } from './http_client';
import { HTTPError } from 'ky';

/** A single date entry as returned by the REST availability endpoint. */
export type AvailabilityEntry = {
  date: string;
  arrival: boolean;
  arrival_time_from: string | null;
  arrival_time_to: string | null;
  departure: boolean;
  departure_time: string | null;
  min_nights: number;
  max_nights: number;
  special_offer: number;
};

/** A discount as returned by the REST availability endpoint. */
export type AvailabilityDiscount = {
  name: string;
  discount_starts_at: string;
  discount_ends_at: string;
};

/** Full response of GET /portal_api/v1/accommodations/availability. */
export type AvailabilityResponse = {
  name: string;
  last_minute_days: number;
  availabilities: AvailabilityEntry[];
  discounts: AvailabilityDiscount[];
};

interface FetchAvailabilityParams {
  /** The GraphQL api_url; only its origin is used to reach the REST API. */
  apiUrl: string;
  locale: string;
  portalCode: string;
  objectCode: string;
  /** Inclusive start of the range. */
  startsDate: Date;
  /** Inclusive end of the range. */
  endDate: Date;
}

const AVAILABILITY_PATH = '/portal_api/v1/accommodations/availability';

/**
 * Build the REST availability URL by reusing the origin of the configured
 * GraphQL api_url, so staging/local overrides keep working.
 */
export function buildAvailabilityUrl({
  apiUrl,
  portalCode,
  objectCode,
  startsDate,
  endDate
}: Omit<FetchAvailabilityParams, 'locale'>): string {
  const url = new URL(AVAILABILITY_PATH, new URL(apiUrl).origin);
  url.search = new URLSearchParams({
    portal_code: portalCode,
    object_code: objectCode,
    starts_date: FormatIntl(startsDate, 'yyyy-MM-dd'),
    end_date: FormatIntl(endDate, 'yyyy-MM-dd')
  }).toString();
  return url.toString();
}

/**
 * Fetch availability + discounts for an accommodation over a date range from the
 * REST API. Replaces the legacy GraphQL CALENDAR_QUERY.
 */
export async function fetchAvailability({
  apiUrl,
  locale,
  portalCode,
  objectCode,
  startsDate,
  endDate
}: FetchAvailabilityParams): Promise<AvailabilityResponse> {
  const url = buildAvailabilityUrl({
    apiUrl,
    portalCode,
    objectCode,
    startsDate,
    endDate
  });

  try {
    return await http.get(url, { headers: { locale } }).json<AvailabilityResponse>();
  } catch (error) {
    if (error instanceof HTTPError) {
      throw new Error(`Availability request failed (${error.response.status})`);
    }
    throw error;
  }
}
