import { PricesType } from './components/CalendarPage/Summary/cost_types';

export type FiltersFormType = {
  show_city: boolean;
  show_region: boolean;
  show_country: boolean;
  show_persons: boolean;
  show_bathrooms: boolean;
  show_bedrooms: boolean;
  show_price: boolean;
  show_rating?: boolean;
  categories: number[];
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
  adults_from: number;
  children: boolean;
  children_from: number;
  children_til: number;
  babies: boolean;
  babies_til: number;
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
  adults_from: number;
  babies: boolean;
  babies_til: number;
  children: boolean;
  children_from: number;
  children_til: number;
  language_selector_visible: boolean;
  redirect_urls: Record<string, string | null>;
  show_discount_code: boolean;
  number_of_months: number;
  number_of_months_in_a_row: number;
};

type name_id_type = {
  id: number;
  name: string;
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
  searchFields?: { id: string; type: string }[];
  /** @deprecated Use PortalSiteType.bookingFormConfiguration instead. */
  bookingForm: BookingFormType;
  colors?: ColorsType;
};

export type PortalSiteType = {
  categories: { id: number; name: string; properties: name_id_type[] }[];
  options: PortalOptions;
  bookingFormConfiguration: BookingFormConfigurationType;
  max_persons: number;
  name: string;
  max_bedrooms: number;
  max_bathrooms: number;
  max_weekprice: number;
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

export type HouseType = {
  id: number;
  code: string;
  name: string;
  image_url?: string;
  house_url?: string;
  house_type: string;
  persons: number;
  bedrooms: number;
  bathrooms: number;
  minimum_week_price: number;
  max_nights: number;
  allow_option?: boolean;
  cancel_insurance?: boolean;
  discounts?: string;
  discounts_info?: string;
  babies_extra: number;
  city: string;
  province: string;
  province: string;
  country_name: string;
  description: string;
  booking_price?: {
    total_price: number;
  };
};
