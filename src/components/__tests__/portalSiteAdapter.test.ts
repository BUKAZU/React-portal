import {
  buildAppPortalSite,
  mapBookingFields,
  mapFilterFields,
  mapLabels,
  mapSearchFacets
} from '../portalSiteAdapter';
import type {
  SearchFacetsResponse,
  SettingsResponse
} from '../../_lib/portal_settings';

describe('portalSiteAdapter', () => {
  it('mapLabels strips the locale suffix for the requested locale only', () => {
    const labels = {
      countries_label_nl: 'Land',
      countries_label_en: 'Country',
      arrival_date_label_nl: 'Aankomst',
      form_submit_text_nl: 'Voorwaarden'
    };

    const result = mapLabels(labels, 'nl');

    expect(result.countries_label).toBe('Land');
    expect(result.arrival_date_label).toBe('Aankomst');
    expect(result.form_submit_text).toBe('Voorwaarden');
    expect(result).not.toHaveProperty('countries_label_en');
  });

  it('mapSearchFacets flattens max into top-level max_* fields', () => {
    const facets: SearchFacetsResponse = {
      countries: [{ id: 1, name: 'NL' }],
      regions: [],
      cities: [],
      categories: [],
      extra_search: ['pool'],
      max: { persons: 8, bedrooms: 4, bathrooms: 2, nights: 21, weekprice: '2000' }
    };

    const result = mapSearchFacets(facets);

    expect(result.max_persons).toBe(8);
    expect(result.max_bedrooms).toBe(4);
    expect(result.max_bathrooms).toBe(2);
    expect(result.max_nights).toBe(21);
    expect(result.max_weekprice).toBe(2000);
    expect(result.countries).toEqual([{ id: 1, name: 'NL' }]);
    expect(result.extra_search).toEqual(['pool']);
  });

  it('mapBookingFields exposes both type and field_type', () => {
    const fields = mapBookingFields([
      {
        id: '5',
        label: 'Drivers license',
        field_type: 'text',
        field_options: null,
        required: true,
        placeholder: null
      }
    ]);

    expect(fields[0]).toMatchObject({
      id: '5',
      label: 'Drivers license',
      field_type: 'text',
      type: 'text',
      required: true
    });
  });

  it('mapFilterFields maps id, type, and label', () => {
    const result = mapFilterFields([
      { id: 'persons_min', field_type: 'number', label: 'Personen' },
      { id: 'countries', field_type: 'select', label: 'Land' }
    ]);

    expect(result).toEqual([
      { id: 'persons_min', type: 'number', label: 'Personen' },
      { id: 'countries', type: 'select', label: 'Land' }
    ]);
  });

  it('buildAppPortalSite sets searchFields to [] when filterFields is empty', () => {
    const settings = {
      name: 'Portal', domain: 'example.com', portal_code: 'P1', commission: 0, use_custom_commission: false,
      colors: { button: '#1', button_cta: '#2', discount: '#3', cell: '#4', booked: '#5', arrival: '#6', departure: '#7' },
      booking_form: { show_months_amount: 2, show_months_in_a_row_amount: 1, children_allowed: false, babies_allowed: false, babies_till_age: 0, children_from_age: 0, children_till_age: 0, adults_from_age: 18, show_discount_code: false, language_selector_visible: false, redirect_urls: {} },
      filters_form: { show: true, location: 'top', mode: 'grid', no_results: 9, fixed_mobile: false, categories: [], show_price: true, show_persons: true, show_bedrooms: true, show_bathrooms: true, show_country: true, show_region: true, show_city: true },
      labels: {}
    } as unknown as SettingsResponse;

    const result = buildAppPortalSite({
      settings,
      filterFields: [],
      bookingFields: [],
      locale: 'nl'
    });

    expect(result.options.searchFields).toEqual([]);
  });

  it('buildAppPortalSite sets searchFields to undefined when filterFields not fetched', () => {
    const settings = {
      name: 'Portal', domain: 'example.com', portal_code: 'P1', commission: 0, use_custom_commission: false,
      colors: { button: '#1', button_cta: '#2', discount: '#3', cell: '#4', booked: '#5', arrival: '#6', departure: '#7' },
      booking_form: { show_months_amount: 2, show_months_in_a_row_amount: 1, children_allowed: false, babies_allowed: false, babies_till_age: 0, children_from_age: 0, children_till_age: 0, adults_from_age: 18, show_discount_code: false, language_selector_visible: false, redirect_urls: {} },
      filters_form: { show: true, location: 'top', mode: 'grid', no_results: 9, fixed_mobile: false, categories: [], show_price: true, show_persons: true, show_bedrooms: true, show_bathrooms: true, show_country: true, show_region: true, show_city: true },
      labels: {}
    } as unknown as SettingsResponse;

    const result = buildAppPortalSite({ settings, bookingFields: [], locale: 'nl' });

    expect(result.options.searchFields).toBeUndefined();
  });

  it('buildAppPortalSite assembles the full consumed shape', () => {
    const settings = {
      name: 'Portal',
      domain: 'example.com',
      portal_code: 'P1',
      commission: 0,
      use_custom_commission: false,
      colors: {
        button: '#1',
        button_cta: '#2',
        discount: '#3',
        cell: '#4',
        booked: '#5',
        arrival: '#6',
        departure: '#7'
      },
      booking_form: {
        show_months_amount: 2,
        show_months_in_a_row_amount: 1,
        children_allowed: true,
        babies_allowed: true,
        babies_till_age: 2,
        children_from_age: 3,
        children_till_age: 12,
        adults_from_age: 18,
        show_discount_code: true,
        language_selector_visible: false,
        redirect_urls: { nl: 'https://nl' }
      },
      filters_form: {
        show: true,
        location: 'top',
        mode: 'grid',
        no_results: 9,
        fixed_mobile: false,
        categories: [],
        show_price: true,
        show_persons: true,
        show_bedrooms: true,
        show_bathrooms: true,
        show_country: true,
        show_region: true,
        show_city: true
      },
      labels: { countries_label_nl: 'Land', form_submit_text_nl: 'Akkoord' }
    } as unknown as SettingsResponse;

    const facets: SearchFacetsResponse = {
      countries: [{ id: 1, name: 'NL' }],
      regions: [],
      cities: [],
      categories: [],
      extra_search: [],
      max: { persons: 8, bedrooms: 4, bathrooms: 2, nights: 21, weekprice: '2000' }
    };

    const result = buildAppPortalSite({
      settings,
      facets,
      filterFields: [
        { id: 'countries', field_type: 'select', label: 'Land' }
      ],
      bookingFields: [],
      locale: 'nl'
    });

    expect(result.portal_code).toBe('P1');
    expect(result.options.filtersForm.show_city).toBe(true);
    expect(result.options.searchFields).toEqual([{ id: 'countries', type: 'select', label: 'Land' }]);
    expect(result.options.bookingFields).toEqual([]);
    expect(result.colorsConfiguration.button_cta).toBe('#2');
    expect(result.bookingFormConfiguration.show_months_amount).toBe(2);
    expect(result.max_persons).toBe(8);
    expect(result.countries).toEqual([{ id: 1, name: 'NL' }]);
    expect(result.countries_label).toBe('Land');
    expect(result.form_submit_text).toBe('Akkoord');
  });
});

