import { PricesType } from './components/CalendarPage/Summary/cost_types';

export type FiltersFormType = {
  showCity: boolean;
  showRegion: boolean;
  showCountry: boolean;
  showPersons: boolean;
  showBathrooms: boolean;
  showBedrooms: boolean;
  showPrice: boolean;
  categories: number[];
  no_results: number;
  location: string;
  mode: 'grid' | 'list';
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
  adultsFromAge: number;
  babiesAllowed: boolean;
  babiesTillAge: number;
  childrenAllowed: boolean;
  childrenFromAge: number;
  childrenTillAge: number;
  languageSelectorVisible: boolean;
  redirectUrl: string;
  redirectUrlNl: string;
  redirectUrlEn: string;
  redirectUrlDe: string;
  redirectUrlFr: string;
  redirectUrlEs: string;
  redirectUrlIt: string;
  showDiscountCode: boolean;
  showMonthsAmount: number;
  showMonthsInARowAmount: number;
};

type name_id_type = {
  id: number;
  name: string;
};

export type ColorsType = {
  arrival: string;
  booked: string;
  button: string;
  buttonCta: string;
  cell: string;
  departure: string;
  discount: string;
};

export type PortalOptions = {
  filtersForm: FiltersFormType;
  bookingFields: object[];
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
