import { loadPortalSite } from '../loadPortalSite';
import {
  fetchBookingFields,
  fetchFilterFields,
  fetchSearchFacets,
  fetchSettings
} from '../../_lib/portal_settings';

jest.mock('../../_lib/portal_settings');

const mockedFetchSettings = jest.mocked(fetchSettings);
const mockedFetchSearchFacets = jest.mocked(fetchSearchFacets);
const mockedFetchFilterFields = jest.mocked(fetchFilterFields);
const mockedFetchBookingFields = jest.mocked(fetchBookingFields);

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
    redirect_urls: { nl: 'https://nl', en: 'https://en' }
  },
  filters_form: {
    show: true,
    location: 'top',
    mode: 'grid',
    no_results: 9,
    fixed_mobile: true,
    categories: [1, 2],
    show_price: true,
    show_persons: true,
    show_bedrooms: true,
    show_bathrooms: true,
    show_country: true,
    show_region: true,
    show_city: true
  },
  labels: { countries_label_nl: 'Land', countries_label_en: 'Country' }
} as unknown as Awaited<ReturnType<typeof fetchSettings>>;

const facets = {
  countries: [{ id: 1, name: 'NL' }],
  regions: [],
  cities: [],
  categories: [],
  extra_search: [],
  max: { persons: 8, bedrooms: 4, bathrooms: 2, nights: 21, weekprice: 2000 }
} as unknown as Awaited<ReturnType<typeof fetchSearchFacets>>;

const baseParams = { portalCode: 'P1', apiUrl: 'https://api/graphql', locale: 'nl' };

beforeEach(() => {
  jest.clearAllMocks();
  mockedFetchSettings.mockResolvedValue(settings);
  mockedFetchSearchFacets.mockResolvedValue(facets);
  mockedFetchFilterFields.mockResolvedValue([]);
  mockedFetchBookingFields.mockResolvedValue([]);
});

describe('loadPortalSite', () => {
  it('fetches facets and filter fields on the search page', async () => {
    const result = await loadPortalSite({
      ...baseParams,
      isSearchPage: true,
      isBookingPage: false
    });

    expect(mockedFetchSettings).toHaveBeenCalledWith(baseParams);
    expect(mockedFetchSearchFacets).toHaveBeenCalledWith(baseParams);
    expect(mockedFetchFilterFields).toHaveBeenCalledWith(baseParams);
    expect(mockedFetchBookingFields).not.toHaveBeenCalled();

    // Adapter mapped the settings + facets into the consumed shape.
    expect(result.portal_code).toBe('P1');
    expect(result.colorsConfiguration.button_cta).toBe('#2');
    expect(result.max_persons).toBe(8);
    expect(result.countries_label).toBe('Land');
  });

  it('fetches only settings on a non-search, non-booking page', async () => {
    await loadPortalSite({
      ...baseParams,
      isSearchPage: false,
      isBookingPage: false
    });

    expect(mockedFetchSettings).toHaveBeenCalledTimes(1);
    expect(mockedFetchSearchFacets).not.toHaveBeenCalled();
    expect(mockedFetchFilterFields).not.toHaveBeenCalled();
    expect(mockedFetchBookingFields).not.toHaveBeenCalled();
  });

  it('fetches booking fields on a booking page', async () => {
    await loadPortalSite({
      ...baseParams,
      isSearchPage: false,
      isBookingPage: true
    });

    expect(mockedFetchBookingFields).toHaveBeenCalledWith(baseParams);
  });

  it('throws when settings are missing', async () => {
    mockedFetchSettings.mockResolvedValue(
      undefined as unknown as Awaited<ReturnType<typeof fetchSettings>>
    );

    await expect(
      loadPortalSite({ ...baseParams, isSearchPage: false, isBookingPage: false })
    ).rejects.toThrow('Portal site data is missing');
  });
});
