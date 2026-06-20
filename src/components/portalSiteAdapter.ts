/**
 * Maps the portal-site configuration REST responses (see `_lib/portal_settings.ts`)
 * back into the shapes the components already consume (`AppPortalSite`,
 * `PortalOptions`, `BookingFormConfigurationType`, `ColorsType`, plus the dynamic
 * `<field>_label` keys). This keeps the migration to REST invisible to every
 * consumer: only the data source changed, not the data shape.
 */
import type {
  BookingFieldResponse,
  FilterFieldResponse,
  SearchFacetsResponse,
  SettingsBookingForm,
  SettingsColors,
  SettingsFiltersForm,
  SettingsResponse
} from '../_lib/portal_settings';
import type {
  BookingFormConfigurationType,
  ColorsType,
  FiltersFormType,
  PortalOptions,
  PortalSiteType
} from '../types';

/** The portal-site object assembled for the app, mirroring the legacy GraphQL shape. */
export interface AppPortalSite extends PortalSiteType {
  portal_code: string;
  options: PortalOptions;
  colorsConfiguration: ColorsType;
  countries: SearchFacetsResponse['countries'];
  regions: SearchFacetsResponse['regions'];
  cities: SearchFacetsResponse['cities'];
  extra_search: string[];
  booking_fields: MappedBookingField[];
  /** Dynamic localized labels exposed as bare `<field>_label` keys. */
  [key: string]: unknown;
}

/** A booking field shaped for both `options.bookingFields` and `PortalSite.booking_fields`. */
export type MappedBookingField = {
  id: string;
  label: string;
  field_type: string;
  type: string;
  options: unknown;
  required: boolean;
  placeholder: string | null;
};

export function mapColors(colors: SettingsColors): ColorsType {
  return {
    button: colors.button,
    buttonCta: colors.button_cta,
    discount: colors.discount,
    cell: colors.cell,
    booked: colors.booked,
    arrival: colors.arrival,
    departure: colors.departure
  };
}

export function mapBookingFormConfiguration(
  bf: SettingsBookingForm
): BookingFormConfigurationType & { showMonthsInARow: number } {
  const redirect = bf.redirect_urls ?? {};
  return {
    adultsFromAge: bf.adults_from,
    babiesAllowed: bf.babies,
    babiesTillAge: bf.babies_til,
    childrenAllowed: bf.children,
    childrenFromAge: bf.children_from,
    childrenTillAge: bf.children_til,
    languageSelectorVisible: bf.language_selector_visible,
    redirectUrl: '',
    redirectUrlNl: redirect.nl ?? '',
    redirectUrlEn: redirect.en ?? '',
    redirectUrlDe: redirect.de ?? '',
    redirectUrlFr: redirect.fr ?? '',
    redirectUrlEs: redirect.es ?? '',
    redirectUrlIt: redirect.it ?? '',
    showDiscountCode: bf.show_discount_code,
    showMonthsAmount: bf.number_of_months,
    showMonthsInARowAmount: bf.number_of_months_in_a_row,
    // GenerateCalendar reads `showMonthsInARow`; keep it in sync with the *Amount field.
    showMonthsInARow: bf.number_of_months_in_a_row
  };
}

export function mapFiltersForm(ff: SettingsFiltersForm): FiltersFormType {
  return {
    show: ff.show,
    location: ff.location,
    mode: ff.mode as FiltersFormType['mode'],
    no_results: ff.no_results,
    fixedMobile: ff.fixed_mobile,
    categories: ff.categories,
    showPrice: ff.show_price,
    showPersons: ff.show_persons,
    showBedrooms: ff.show_bedrooms,
    showBathrooms: ff.show_bathrooms,
    showCountry: ff.show_country,
    showRegion: ff.show_region,
    showCity: ff.show_city
  };
}

/**
 * Flatten the all-locales label map down to the single requested locale, exposing
 * bare `<field>_label` keys (e.g. `labels["countries_label_nl"]` -> `countries_label`),
 * reproducing what the locale-aware GraphQL server returned.
 */
export function mapLabels(
  labels: Record<string, string>,
  locale: string
): Record<string, string> {
  const suffix = `_${locale}`;
  const source = labels ?? {};
  const result: Record<string, string> = {};
  Object.keys(source).forEach((key) => {
    if (key.endsWith(suffix)) {
      result[key.slice(0, -suffix.length)] = source[key];
    }
  });
  return result;
}

export function mapBookingFields(
  fields: BookingFieldResponse[]
): MappedBookingField[] {
  return (fields ?? []).map((f) => ({
    id: f.id,
    label: f.label,
    field_type: f.field_type,
    // `options.bookingFields` consumers branch on `.type`; mirror `field_type`.
    type: f.field_type,
    options: f.field_options,
    required: f.required,
    placeholder: f.placeholder
  }));
}

type MappedSearchFacets = {
  countries: SearchFacetsResponse['countries'];
  regions: SearchFacetsResponse['regions'];
  cities: SearchFacetsResponse['cities'];
  categories: SearchFacetsResponse['categories'];
  extra_search: string[];
  max_persons: number;
  max_bedrooms: number;
  max_bathrooms: number;
  max_nights: number;
  max_weekprice: number;
};

/** Flatten the search-facets response into the top-level fields the search UI reads. */
export function mapSearchFacets(facets: SearchFacetsResponse): MappedSearchFacets {
  return {
    countries: facets.countries,
    regions: facets.regions,
    cities: facets.cities,
    categories: facets.categories,
    extra_search: facets.extra_search,
    max_persons: facets.max.persons,
    max_bedrooms: facets.max.bedrooms,
    max_bathrooms: facets.max.bathrooms,
    max_nights: facets.max.nights,
    max_weekprice: facets.max.weekprice
  };
}

/**
 * Map the filter-fields endpoint into the `options.searchFields` list the search
 * UI renders. Drops hidden fields and per-category (`category_<id>`) entries, which
 * the legacy `searchFields` blob never carried (categories are driven by the
 * `properties` field + `filtersForm.categories`).
 */
export function mapFilterFields(
  fields: FilterFieldResponse[]
): { id: string; type: string }[] {
  return (fields ?? [])
    .filter((f) => f.visible && !f.id.startsWith('category_'))
    .sort((a, b) => a.position - b.position)
    .map((f) => ({ id: f.id, type: f.field_type }));
}

interface BuildAppPortalSiteParams {
  settings: SettingsResponse;
  facets?: SearchFacetsResponse;
  filterFields?: FilterFieldResponse[];
  bookingFields?: BookingFieldResponse[];
  locale: string;
}

/** Assemble the full `AppPortalSite` from the config REST responses. */
export function buildAppPortalSite({
  settings,
  facets,
  filterFields,
  bookingFields,
  locale
}: BuildAppPortalSiteParams): AppPortalSite {
  const mappedBookingFields = mapBookingFields(bookingFields ?? []);
  const colorsConfiguration = mapColors(settings.colors);

  const options: PortalOptions = {
    filtersForm: mapFiltersForm(settings.filters_form),
    bookingFields: mappedBookingFields,
    searchFields: mapFilterFields(filterFields ?? []),
    bookingForm: {} as PortalOptions['bookingForm'],
    colors: colorsConfiguration
  };

  const emptyFacets: MappedSearchFacets = {
    countries: [],
    regions: [],
    cities: [],
    categories: [],
    extra_search: [],
    max_persons: 0,
    max_bedrooms: 0,
    max_bathrooms: 0,
    max_nights: 0,
    max_weekprice: 0
  };

  return {
    name: settings.name,
    portal_code: settings.portal_code,
    options,
    colorsConfiguration,
    bookingFormConfiguration: mapBookingFormConfiguration(settings.booking_form),
    booking_fields: mappedBookingFields,
    ...(facets ? mapSearchFacets(facets) : emptyFacets),
    ...mapLabels(settings.labels, locale)
  } as AppPortalSite;
}
