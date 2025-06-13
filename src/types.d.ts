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

type name_id_type = {
  id: number;
  name: string;
};

type PortalOptions = {
  filtersForm: FiltersFormType;
  bookingFields: object[];
  bookingForm: BookingFormType;
};

export type PortalSiteType = {
  portal_code: string;
  categories: { id: number; name: string; properties: name_id_type[] }[];
  options: PortalOptions;
  max_persons: number;
  name: string;
  max_bedrooms: number;
  max_bathrooms: number;
  max_weekprice: number;
};

export type LocaleType = 'nl' | 'en' | 'de' | 'es' | 'fr' | 'it';

export type BuDate = {
  arrival: Boolean;
  departure: Boolean;
  min_nights: Number;
  max_nights: Number;
  date: string;
  special_offer: Number;
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
