/**
 * Assembles the portal-site configuration REST responses (see `_lib/portal_settings.ts`)
 * into the `AppPortalSite` shape the components consume. The REST API already uses
 * snake_case, matching the types directly — the only rename is `results_amount`
 * → `no_results` (see `mapFiltersForm`).
 */
import type {
  BookingFieldResponse,
  FilterFieldResponse,
  SettingsFiltersForm,
  SettingsResponse
} from '../_lib/portal_settings';
import {
  normalizeCurrencies,
  type SettingsCurrencies
} from '../_lib/currencies';
import type {
  ColorsType,
  FiltersFormType,
  PortalOptions,
  PortalSiteType
} from '../types';

/** The portal-site object assembled for the app, mirroring the legacy GraphQL shape. */
export interface AppPortalSite extends PortalSiteType {
  options: PortalOptions;
  colorsConfiguration: ColorsType;
  currencies: SettingsCurrencies;
  booking_fields: MappedBookingField[];
  form_submit_text?: string;
  form_submit_button_text?: string;
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

/** Map the filter-fields endpoint into the `options.searchFields` list the search UI renders. */
export function mapFilterFields(fields: FilterFieldResponse[]): {
  id: string;
  type: string;
  label: string | null;
  max?: number;
  options?: { id: number; name: string }[];
}[] {
  return (fields ?? []).map((f) => ({
    id: f.id,
    type: f.field_type,
    label: f.label,
    ...(f.max !== undefined && { max: f.max }),
    ...(f.options !== undefined && { options: f.options })
  }));
}

interface BuildAppPortalSiteParams {
  settings: SettingsResponse;
  filterFields?: FilterFieldResponse[];
  bookingFields?: BookingFieldResponse[];
  locale: string;
}

/** Results per page when the settings endpoint sends nothing usable. */
const DEFAULT_RESULTS_AMOUNT = 20;

/**
 * Map the settings `filters_form` onto the internal `FiltersFormType`.
 *
 * The API exposes the page size as `results_amount` (older backends sent
 * `no_results`); internally it stays `no_results`. Anything non-numeric would
 * otherwise become `NaN` and make the search request fail with a 400.
 */
export function mapFiltersForm(
  filtersForm: SettingsFiltersForm
): FiltersFormType {
  const { results_amount, no_results, ...rest } = filtersForm;
  const raw = Number(results_amount ?? no_results);
  return {
    ...rest,
    no_results: Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_RESULTS_AMOUNT
  };
}

/** Assemble the full `AppPortalSite` from the config REST responses. */
export function buildAppPortalSite({
  settings,
  filterFields,
  bookingFields,
  locale
}: BuildAppPortalSiteParams): AppPortalSite {
  const mappedBookingFields = mapBookingFields(bookingFields ?? []);
  const mappedSearchFields = mapFilterFields(filterFields ?? []);
  const colorsConfiguration: ColorsType = settings.colors;

  const options: PortalOptions = {
    filtersForm: mapFiltersForm(settings.filters_form),
    bookingFields: mappedBookingFields,
    searchFields: filterFields !== undefined ? mappedSearchFields : undefined,
    bookingForm: {} as PortalOptions['bookingForm'],
    colors: colorsConfiguration
  };

  return {
    name: settings.name,
    portal_code: settings.portal_code,
    options,
    colorsConfiguration,
    currencies: normalizeCurrencies(settings.currencies),
    bookingFormConfiguration: settings.booking_form,
    booking_fields: mappedBookingFields,
    max_persons: 0,
    max_bedrooms: 0,
    max_bathrooms: 0,
    max_weekprice: 0,
    ...mapLabels(settings.labels, locale)
  } as AppPortalSite;
}
