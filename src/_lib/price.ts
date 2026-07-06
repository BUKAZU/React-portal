import { http } from './http_client';
import { HTTPError } from 'ky';
import { CostType, PricesType } from '../components/CalendarPage/Summary/cost_types';

/** Accommodation metadata returned when requested with includeAccommodation. */
export interface PriceAccommodation {
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
/** Full response of GET /portal_api/v1/accommodations/price. */
export type PriceResponse = PricesType & {
  arrival_date: string;
  departure_date: string;
  arrival_time: string | null;
  departure_time: string | null;
  currency: string;
  nights: number;
  base_price: number;
  total_price: number;
  insurances: Record<string, number>;
  on_site_house_costs: CostType[];
  person_percentages: unknown;
  night_percentages: unknown;
  /** Only present when requested with includeAccommodation. */
  accommodation?: PriceAccommodation;
};

interface FetchPriceParams {
  /** The GraphQL api_url; only its origin is used to reach the REST API. */
  apiUrl: string;
  locale: string;
  portalCode: string;
  objectCode: string;
  /** Inclusive arrival date, yyyy-MM-dd. */
  startsAt: string;
  /** Inclusive departure date, yyyy-MM-dd. */
  endsAt: string;
  persons?: number;
  currency?: string;
  cancelInsurance?: number;
  discount?: number;
  discountCode?: string;
  /** Selected optional costs, keyed by house cost id. */
  costs?: Record<string, string | number>;
  /** Also return the accommodation metadata (booking form only). */
  includeAccommodation?: boolean;
}

const PRICE_PATH = '/portal_api/v1/accommodations/price';

/**
 * Build the REST price URL by reusing the origin of the configured GraphQL
 * api_url, so staging/local overrides keep working.
 */
export function buildPriceUrl({
  apiUrl,
  portalCode,
  objectCode,
  startsAt,
  endsAt,
  persons,
  currency,
  cancelInsurance,
  discount,
  discountCode,
  costs,
  includeAccommodation
}: Omit<FetchPriceParams, 'locale'>): string {
  const url = new URL(PRICE_PATH, new URL(apiUrl).origin);
  const params = new URLSearchParams({
    portal_code: portalCode,
    object_code: objectCode,
    starts_at: startsAt,
    ends_at: endsAt
  });

  if (persons !== undefined) params.set('persons', String(persons));
  if (currency) params.set('currency', currency);
  if (cancelInsurance !== undefined)
    params.set('cancel_insurance', String(cancelInsurance));
  if (discount !== undefined) params.set('discount', String(discount));
  if (discountCode) params.set('discount_code', discountCode);
  if (costs) {
    for (const [id, amount] of Object.entries(costs)) {
      params.set(`costs[${id}]`, String(amount));
    }
  }
  if (includeAccommodation) params.set('include_accommodation', 'true');

  url.search = params.toString();
  return url.toString();
}

/**
 * Fetch the booking price for an accommodation from the REST API.
 * Replaces the legacy GraphQL `booking_price` field.
 */
export async function fetchPrice(
  params: FetchPriceParams
): Promise<PriceResponse> {
  const url = buildPriceUrl(params);

  try {
    return await http
      .get(url, { headers: { locale: params.locale } })
      .json<PriceResponse>();
  } catch (error) {
    if (error instanceof HTTPError) {
      throw new Error(`Price request failed (${error.response.status})`);
    }
    throw error;
  }
}
