export type Field = {
  id: string;
  type: string;
  label: string | null;
  max?: number;
  options?: { id: number; name: string }[];
};

export type FiltersType = {
  countries?: any;
  regions?: any;
  properties?: any[];
  departure_date?: string;
  arrival_date?: string;
  cities?: string;
  persons_min?: string;
  persons_max?: string;
  bedrooms_min?: string;
  bathrooms_min?: string;
  weekprice_max?: string;
  extra_search?: string;
};

export type OptionsType = {
  id: string;
  name: string;
  country_id: string;
  region?: string;
};
