import { PricesType } from './components/CalendarPage/Summary/cost_types';
import type { AccommodationDetail } from './_lib/accommodation';

export type FiltersFormType = {
  show_city: boolean;
  show_region: boolean;
  show_country: boolean;
  show_persons: boolean;
  show_bathrooms: boolean;
  show_bedrooms: boolean;
  show_price: boolean;
  show_rating?: boolean;
  no_results: number;
  location: string;
  mode: 'grid' | 'list';
  show?: boolean;
  fixed_mobile?: boolean;
};

/**
 * @deprecated Use BookingFormConfigurationType instead.
 * The bookingForm field in portal options is deprecated in favour of
 * the bookingFormConfiguration returned directly by the API.
 */
type BookingFormType = {
  adults_from_age: number;
  children_allowed: boolean;
  children_from_age: number;
  children_till_age: number;
  babies_allowed: boolean;
  babies_till_age: number;
  showDiscountCode: boolean;
  redirectUrl: string | null;
  redirectUrl_en: string | null;
  redirectUrl_nl: string | null;
  redirectUrl_de: string | null;
  redirectUrl_fr: string | null;
  redirectUrl_es: string | null;
  redirectUrl_it: string | null;
};

/** Booking form configuration returned directly by the portal site API. */
export type BookingFormConfigurationType = {
  adults_from_age: number;
  babies_allowed: boolean;
  babies_till_age: number;
  children_allowed: boolean;
  children_from_age: number;
  children_till_age: number;
  language_selector_visible: boolean;
  /** Per-locale redirect URLs after booking. Keys are locale codes ('nl', 'en', 'de', 'fr', 'es', 'it'); values may be null when not configured. */
  redirect_urls: Record<string, string | null>;
  show_discount_code: boolean;
  show_months_amount: number;
  show_months_in_a_row_amount: number;
};

export type ColorsType = {
  arrival: string;
  booked: string;
  button: string;
  button_cta: string;
  cell: string;
  departure: string;
  discount: string;
};

export type PortalOptions = {
  filtersForm: FiltersFormType;
  bookingFields: object[];
  /** Search-filter fields to render, mapped from the filter-fields REST endpoint. */
  searchFields?: {
    id: string;
    type: string;
    label: string | null;
    max?: number;
    options?: { id: number; name: string }[];
  }[];
  /** @deprecated Use PortalSiteType.bookingFormConfiguration instead. */
  bookingForm: BookingFormType;
  colors?: ColorsType;
};

export type PortalSiteType = {
  options: PortalOptions;
  bookingFormConfiguration: BookingFormConfigurationType;
  max_persons: number;
  name: string;
  max_bedrooms: number;
  max_bathrooms: number;
  max_weekprice: number;
  portal_code: string;
};

export type LocaleType = 'nl' | 'en' | 'de' | 'es' | 'fr' | 'it';

export type Discount = {
  name?: string;
  discount_starts_at: string;
  discount_ends_at: string;
};

export type BuDate = {
  arrival: boolean;
  departure: boolean;
  min_nights: number;
  max_nights: number;
  date: string;
  special_offer: number;
  arrival_time_from?: string | null;
  arrival_time_to?: string | null;
  departure_time?: string | null;
};

export type OptionalHouseCostType = {
  id: string;
  name: string;
  method: string;
  max_available: number;
  amount: number;
  method_name: string;
  description?: string;
};

export type HouseType = AccommodationDetail & {
  booking_price?: {
    total_price: number;
    optional_house_costs: OptionalHouseCostType[];
  };
};
