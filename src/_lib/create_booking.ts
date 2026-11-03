import { http } from './http_client';
import { HTTPError } from 'ky';
import type { CreateBookingPayload } from './booking_payload';

/** Full response of POST /portal_api/v1/accommodations/bookings. */
export interface CreateBookingResponse {
  booking_nr: string;
  status: string;
  is_option: boolean;
  arrival_date: string;
  departure_date: string;
  adults: number;
  children: number;
  babies: number;
  /** The language the booking was stored with; the API may replace an unsupported one. */
  language: string;
  payment_url: string | null;
  /** Whether the guest should be sent to payment_url; absent on older backends. */
  redirect_to_payment?: boolean;
  redirect_url: string | null;
  /** Omitted entirely (not null) when a redirect_url is configured. */
  success_message?: string;
  portal_code: string;
  house_code: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

/** Error body returned by the portal API on 400/404/422. */
interface ErrorBody {
  error?: string;
  errors?: Record<string, string[]>;
}

/**
 * A failed booking request. Carries the HTTP status, the messages to show and, when the
 * API returned them, the per-field validation errors keyed by booking field id (including
 * dotted ids such as `extra_fields.date_of_birth`).
 */
export class CreateBookingError extends Error {
  readonly status: number;
  readonly messages: string[];
  readonly fieldErrors?: Record<string, string[]>;

  constructor(
    status: number,
    messages: string[],
    fieldErrors?: Record<string, string[]>
  ) {
    super(messages.join('\n') || `Booking request failed (${status})`);
    this.name = 'CreateBookingError';
    this.status = status;
    this.messages = messages.length > 0 ? messages : [this.message];
    if (fieldErrors) {
      this.fieldErrors = fieldErrors;
    }
  }
}

interface CreateBookingParams {
  /** The configured api_url; only its origin is used to reach the REST API. */
  apiUrl: string;
  locale: string;
  payload: CreateBookingPayload;
}

const BOOKINGS_PATH = '/portal_api/v1/accommodations/bookings';

/**
 * Build the REST bookings URL by reusing the origin of the configured api_url, so
 * staging/local overrides keep working.
 */
export function buildBookingsUrl({ apiUrl }: { apiUrl: string }): string {
  return new URL(BOOKINGS_PATH, new URL(apiUrl).origin).toString();
}

/** Turn an error response body into the messages and field errors to render. */
async function toCreateBookingError(
  error: HTTPError
): Promise<CreateBookingError> {
  const status = error.response.status;
  let body: ErrorBody = {};

  try {
    body = (await error.response.json()) as ErrorBody;
  } catch {
    // Non-JSON body (proxy error page, empty response): fall back to the status alone.
    return new CreateBookingError(status, []);
  }

  const messages = body.error ? [body.error] : [];
  return new CreateBookingError(status, messages, body.errors);
}

/**
 * Create a booking through the REST API.
 * Replaces the legacy GraphQL `createBooking` mutation.
 *
 * The shared http client excludes POST from its retries, so a failed request is never
 * re-sent automatically and cannot produce a duplicate booking.
 */
export async function createBooking({
  apiUrl,
  locale,
  payload
}: CreateBookingParams): Promise<CreateBookingResponse> {
  const url = buildBookingsUrl({ apiUrl });

  try {
    return await http
      .post(url, { json: payload, headers: { locale } })
      .json<CreateBookingResponse>();
  } catch (error) {
    if (error instanceof HTTPError) {
      throw await toCreateBookingError(error);
    }
    throw error;
  }
}
