import {
  buildAppPortalSite,
  mapBookingFields,
  mapBookingFormConfiguration,
  mapColors,
  mapFilterFields,
  mapFiltersForm,
  mapLabels,
  mapSearchFacets
} from '../portalSiteAdapter';
import type {
  SearchFacetsResponse,
  SettingsResponse
} from '../../_lib/portal_settings';

describe('portalSiteAdapter', () => {
  it('mapColors renames button_cta', () => {
    const colors = mapColors({
      button: '#1',
      button_cta: '#2',
      discount: '#3',
      cell: '#4',
      booked: '#5',
      arrival: '#6',
      departure: '#7'
    });
    expect(colors.buttonCta).toBe('#2');
    expect(colors.button).toBe('#1');
  });

  it('mapBookingFormConfiguration renames every field and mirrors months-in-a-row', () => {
    const config = mapBookingFormConfiguration({
      number_of_months: 3,
      number_of_months_in_a_row: 2,
      children: true,
      babies: false,
      babies_til: 2,
      children_from: 4,
      children_til: 12,
      adults_from: 18,
      show_discount_code: true,
      language_selector_visible: false,
      redirect_urls: { nl: 'https://nl', de: 'https://de' }
    });

    expect(config.showMonthsAmount).toBe(3);
    expect(config.showMonthsInARowAmount).toBe(2);
    expect(config.showMonthsInARow).toBe(2);
    expect(config.childrenAllowed).toBe(true);
    expect(config.babiesAllowed).toBe(false);
    expect(config.babiesTillAge).toBe(2);
    expect(config.childrenFromAge).toBe(4);
    expect(config.childrenTillAge).toBe(12);
    expect(config.adultsFromAge).toBe(18);
    expect(config.showDiscountCode).toBe(true);
    expect(config.redirectUrlNl).toBe('https://nl');
    expect(config.redirectUrlDe).toBe('https://de');
    expect(config.redirectUrlEn).toBe('');
    expect(config.redirectUrl).toBe('');
  });

  it('mapFiltersForm renames show_* and fixed_mobile', () => {
    const ff = mapFiltersForm({
      show: true,
      location: 'top',
      mode: 'grid',
      no_results: 9,
      fixed_mobile: true,
      categories: [1],
      show_price: true,
      show_persons: false,
      show_bedrooms: true,
      show_bathrooms: false,
      show_country: true,
      show_region: false,
      show_city: true
    });

    expect(ff.showCity).toBe(true);
    expect(ff.showRegion).toBe(false);
    expect(ff.fixedMobile).toBe(true);
    expect(ff.show).toBe(true);
    expect(ff.no_results).toBe(9);
    expect(ff.categories).toEqual([1]);
  });

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
    expect(result.options.filtersForm.showCity).toBe(true);
    expect(result.options.searchFields).toEqual([{ id: 'countries', type: 'select' }]);
    expect(result.options.bookingFields).toEqual([]);
    expect(result.colorsConfiguration.buttonCta).toBe('#2');
    expect(result.bookingFormConfiguration.showMonthsAmount).toBe(2);
    expect(result.max_persons).toBe(8);
    expect(result.countries).toEqual([{ id: 1, name: 'NL' }]);
    expect(result.countries_label).toBe('Land');
    expect(result.form_submit_text).toBe('Akkoord');
  });
});
