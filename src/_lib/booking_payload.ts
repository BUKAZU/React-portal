import type { PossibleValues } from '../components/CalendarPage/formParts/form_types';

/**
 * Request body of POST /portal_api/v1/accommodations/bookings.
 * All keys are snake_case, matching the Grape params block of the endpoint.
 */
export interface CreateBookingPayload {
  portal_code: string;
  object_code: string;
  /** Arrival date, yyyy-MM-dd. */
  starts_at: string;
  /** Departure date, yyyy-MM-dd. */
  ends_at: string;
  is_option: boolean;
  language: string;
  country: string;
  adults: number;
  children: number;
  babies: number;
  discount: number;
  cancel_insurance: number;
  /** Quantities keyed by house cost id. */
  costs: Record<string, number>;
  /** Extra booking fields keyed by field name; omitted when empty. */
  extra_fields?: Record<string, string>;
  session_identifier?: string;
  first_name?: string;
  preposition?: string;
  last_name?: string;
  company_name?: string;
  email?: string;
  phone?: string;
  phone_mobile?: string;
  address?: string;
  house_number?: string;
  zipcode?: string;
  city?: string;
  iban?: string;
  bic?: string;
  holder?: string;
  comment?: string;
  discount_code?: string;
  discount_reason?: string;
  currency?: string;
}

interface BuildBookingPayloadParams {
  values: PossibleValues;
  objectCode: string;
  portalCode: string;
  locale: string;
  sessionIdentifier: string | null;
}

/**
 * Form values that are copied to the payload as-is when they hold a non-empty string.
 * They are not declared on PossibleValues: they only exist because the portal booking
 * field configuration declares a field with that id (see initializeBookingFields).
 */
const OPTIONAL_STRING_FIELDS = [
  'first_name',
  'preposition',
  'last_name',
  'company_name',
  'email',
  'phone',
  'phone_mobile',
  'address',
  'house_number',
  'zipcode',
  'city',
  'iban',
  'bic',
  'holder',
  'comment',
  'discount_code',
  'discount_reason',
  'currency'
] as const;

/** Read a form value as a trimmed string, or undefined when it is empty or not a string. */
function optionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

/** Drop empty entries and coerce the remaining quantities to numbers. */
function toCosts(costs: Record<string, string>): Record<string, number> {
  const result: Record<string, number> = {};

  for (const [id, quantity] of Object.entries(costs ?? {})) {
    const amount = Number(quantity);
    if (Number.isFinite(amount) && amount > 0) {
      result[id] = amount;
    }
  }

  return result;
}

/** Drop empty extra fields so the API does not store blank values. */
function toExtraFields(
  extraFields: Record<string, string>
): Record<string, string> | undefined {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(extraFields ?? {})) {
    const text = optionalString(value);
    if (text !== undefined) {
      result[key] = text;
    }
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

/**
 * Map the booking form state onto the REST payload.
 *
 * Deliberately an allow-list rather than a spread of `values`: PossibleValues carries an
 * index signature, so spreading would also send the internal BuDate objects, the computed
 * `persons` count and every unconsumed booking field key. Unlike GraphQL, the REST endpoint
 * receives whatever is in the body.
 */
export function buildBookingPayload({
  values,
  objectCode,
  portalCode,
  locale,
  sessionIdentifier
}: BuildBookingPayloadParams): CreateBookingPayload {
  const payload: CreateBookingPayload = {
    portal_code: portalCode,
    object_code: objectCode,
    starts_at: values.arrivalDate.date,
    ends_at: values.departureDate.date,
    is_option: values.is_option === 'true',
    language: locale,
    country: values.country.toUpperCase(),
    adults: Number(values.adults) || 0,
    children: Number(values.children) || 0,
    babies: Number(values.babies) || 0,
    discount: Number(values.discount) || 0,
    cancel_insurance: Number(values.cancel_insurance) || 0,
    costs: toCosts(values.costs)
  };

  const extraFields = toExtraFields(values.extra_fields);
  if (extraFields) {
    payload.extra_fields = extraFields;
  }

  if (sessionIdentifier) {
    payload.session_identifier = sessionIdentifier;
  }

  for (const field of OPTIONAL_STRING_FIELDS) {
    const value = optionalString(values[field]);
    if (value !== undefined) {
      payload[field] = value;
    }
  }

  return payload;
}
