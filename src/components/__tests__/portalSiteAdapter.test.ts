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
      max: { persons: 8, bedrooms: 4, bathrooms: 2, nights: 21, weekprice: 2000 }
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

  it('mapFilterFields drops hidden and category fields, sorts by position', () => {
    const result = mapFilterFields([
      { id: 'persons_min', field_type: 'number', position: 5, visible: true, label: null },
      { id: 'countries', field_type: 'select', position: 0, visible: true, label: null },
      { id: 'cities', field_type: 'select', position: 2, visible: false, label: null },
      { id: 'category_3', field_type: 'select', position: 11, visible: true, label: 'X' }
    ]);

    expect(result).toEqual([
      { id: 'countries', type: 'select' },
      { id: 'persons_min', type: 'number' }
    ]);
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
        number_of_months: 2,
        number_of_months_in_a_row: 1,
        children: true,
        babies: true,
        babies_til: 2,
        children_from: 3,
        children_til: 12,
        adults_from: 18,
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
      max: { persons: 8, bedrooms: 4, bathrooms: 2, nights: 21, weekprice: 2000 }
    };

    const result = buildAppPortalSite({
      settings,
      facets,
      filterFields: [
        { id: 'countries', field_type: 'select', position: 0, visible: true, label: null }
      ],
      bookingFields: [],
      locale: 'nl'
    });

    expect(result.portal_code).toBe('P1');
    expect(result.options.filtersForm.show_city).toBe(true);
    expect(result.options.searchFields).toEqual([{ id: 'countries', type: 'select' }]);
    expect(result.options.bookingFields).toEqual([]);
    expect(result.colorsConfiguration.button_cta).toBe('#2');
    expect(result.bookingFormConfiguration.number_of_months).toBe(2);
    expect(result.max_persons).toBe(8);
    expect(result.countries).toEqual([{ id: 1, name: 'NL' }]);
    expect(result.countries_label).toBe('Land');
    expect(result.form_submit_text).toBe('Akkoord');
  });
});

