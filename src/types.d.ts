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

export type BookingFormConfiguration = {
  adultsFromAge: number;
  babiesAllowed: boolean;
  babiesTillAge: number;
  childrenAllowed: boolean;
  childrenFromAge: number;
  childrenTillAge: number;
  languageSelectorVisible: boolean;
  redirectUrl: string | null;
  showMonthsAmount: number;
  showMonthsInARowAmount: number;
};

type name_id_type = {
  id: number;
  name: string;
};

type PortalOptions = {
  filtersForm: FiltersFormType;
  bookingFields: object[];
};

export type PortalSiteType = {
  categories: { id: number; name: string; properties: name_id_type[] }[];
  options: PortalOptions;
  bookingFormConfiguration: BookingFormConfiguration;
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
