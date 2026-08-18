import { http } from './http_client';
import { HTTPError } from 'ky';

/** Full response of GET /portal_api/v1/accommodations/discount-code. */
export interface DiscountCodeResponse {
  name: string;
  /** Whether the discount is a fixed amount (price) instead of a percentage. */
  use_price: boolean;
  percentage: number | null;
  price: number | null;
  /** ISO 4217 currency code the price is expressed in. */
  currency: string;
}

/**
 * A failed discount-code lookup. A 404 means the code does not exist for this
 * accommodation, which the booking form renders as "no discount found" rather
 * than as an error.
 */
export class DiscountCodeError extends Error {
  readonly status: number;
  readonly notFound: boolean;

  constructor(status: number) {
    super(`Discount code request failed (${status})`);
    this.name = 'DiscountCodeError';
    this.status = status;
    this.notFound = status === 404;
  }
}

interface FetchDiscountCodeParams {
  /** The GraphQL api_url; only its origin is used to reach the REST API. */
  apiUrl: string;
  locale: string;
  portalCode: string;
  objectCode: string;
  /** The discount code entered by the visitor. */
  code: string;
}

const DISCOUNT_CODE_PATH = '/portal_api/v1/accommodations/discount-code';

/**
 * Build the REST discount-code URL by reusing the origin of the configured
 * GraphQL api_url, so staging/local overrides keep working.
 */
export function buildDiscountCodeUrl({
  apiUrl,
  portalCode,
  objectCode,
  code
}: Omit<FetchDiscountCodeParams, 'locale'>): string {
  const url = new URL(DISCOUNT_CODE_PATH, new URL(apiUrl).origin);

  url.search = new URLSearchParams({
    portal_code: portalCode,
    object_code: objectCode,
    code
  }).toString();

  return url.toString();
}

/**
 * Look up a discount code for an accommodation through the REST API.
 * Replaces the legacy GraphQL `checkDiscountCode` mutation.
 */
export async function fetchDiscountCode(
  params: FetchDiscountCodeParams
): Promise<DiscountCodeResponse> {
  const url = buildDiscountCodeUrl(params);

  try {
    return await http
      .get(url, { headers: { locale: params.locale } })
      .json<DiscountCodeResponse>();
  } catch (error) {
    if (error instanceof HTTPError) {
      throw new DiscountCodeError(error.response.status);
    }
    throw error;
  }
}
