import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import Results from '../Results';
import { AppContext } from '../../AppContext';
import { PortalSiteType } from '../../../types';
import { FiltersType } from '../filters/filter_types';
import type {
  AccommodationResult,
  AccommodationsResponse
} from '../../../_lib/accommodations';

jest.mock('../../../_lib/accommodations', () => ({
  fetchAccommodations: jest.fn()
}));

jest.mock(
  '../SingleResult',
  () => () => '<div data-testid="single-result"></div>'
);
jest.mock('../Paginator', () => () => <div data-testid="paginator" />);
jest.mock('../../icons/loading.svg', () => () => <svg data-testid="loading" />);
jest.mock('../../Error', () => ({
  ApiError: () => <div data-testid="api-error" />
}));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

import { fetchAccommodations } from '../../../_lib/accommodations';

const mockFetch = fetchAccommodations as jest.Mock;

const mockPortalSite: PortalSiteType = {
  options: {
    filtersForm: {
      show_city: false,
      show_region: false,
      show_country: false,
      show_persons: false,
      show_bathrooms: false,
      show_bedrooms: false,
      show_price: false,
      show_rating: false,
      no_results: 20,
      location: 'left',
      mode: 'grid',
      show: true,
      fixed_mobile: false
    },
    bookingFields: [],
    bookingForm: {
      adults_from_age: 18,
      children_allowed: false,
      children_from_age: 0,
      children_till_age: 12,
      babies_allowed: false,
      babies_till_age: 2,
      showDiscountCode: false,
      redirectUrl: null,
      redirectUrl_en: null,
      redirectUrl_nl: null,
      redirectUrl_de: null,
      redirectUrl_fr: null,
      redirectUrl_es: null,
      redirectUrl_it: null
    }
  },
  bookingFormConfiguration: {
    adults_from_age: 18,
    babies_allowed: false,
    babies_till_age: 2,
    children_allowed: false,
    children_from_age: 0,
    children_till_age: 12,
    language_selector_visible: false,
    redirect_urls: {
      nl: null,
      en: null,
      de: null,
      fr: null,
      es: null,
      it: null
    },
    show_discount_code: false,
    show_months_amount: 2,
    show_months_in_a_row_amount: 2
  },
  max_persons: 10,
  name: 'Test Portal',
  max_bedrooms: 5,
  max_bathrooms: 3,
  max_weekprice: 5000,
  portal_code: 'TEST'
};

const baseFilters: FiltersType = {};

const mockHouse: AccommodationResult = {
  id: 1,
  code: 'HOUSE1',
  name: 'Test House',
  persons: 6,
  bedrooms: 3,
  bathrooms: 2,
  description: 'Nice house',
  image_url: 'https://example.com/image.jpg',
  house_url: 'https://example.com/house',
  province: 'Noord-Holland',
  city: 'Amsterdam',
  country_name: 'Netherlands',
  minimum_week_price: 1000,
  rating: 4.5
};

function responseWith(items: AccommodationResult[]): AccommodationsResponse {
  return {
    items,
    meta: { total_count: items.length, limit: 10, skip: 0 }
  };
}

const defaultProps = {
  filters: baseFilters,
  PortalSite: mockPortalSite,
  limit: 10,
  skip: 0,
  onPageChange: jest.fn(),
  activePage: 1
};

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

function renderResults(props = defaultProps) {
  act(() => {
    root.render(
      <AppContext.Provider
        value={{
          locale: 'en',
          portalCode: 'TEST',
          objectCode: '',
          apiUrl: 'https://api.bukazu.com/graphql'
        }}
      >
        <Results {...props} />
      </AppContext.Provider>
    );
  });
}

async function renderResultsAndSettle(props = defaultProps) {
  renderResults(props);
  await act(async () => {
    await Promise.resolve();
  });
}

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container);
  });
  jest.clearAllMocks();
  mockFetch.mockResolvedValue(responseWith([]));
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  container.remove();
});

describe('Results', () => {
  it('should render loading indicator while the request is in flight', () => {
    mockFetch.mockReturnValue(new Promise(() => {}));

    renderResults();

    expect(container.querySelector('[data-testid="loading"]')).not.toBeNull();
  });

  it('should render error component when the request fails', async () => {
    mockFetch.mockRejectedValue(new Error('Search request failed (500)'));

    await renderResultsAndSettle();

    expect(container.querySelector('[data-testid="api-error"]')).not.toBeNull();
  });

  it('should show no-results message when no accommodation matches', async () => {
    await renderResultsAndSettle();

    const noResults = container.querySelector('.bu-noresults');
    expect(noResults).not.toBeNull();
    expect(container.querySelector('[data-testid="single-result"]')).toBeNull();
  });

  it('should render a SingleResult for each accommodation returned', async () => {
    mockFetch.mockResolvedValue(
      responseWith([mockHouse, { ...mockHouse, id: 2 }])
    );

    await renderResultsAndSettle();

    const results = container.querySelectorAll('[data-testid="single-result"]');
    expect(results).toHaveLength(2);
  });

  it('should request the search endpoint with the portal code, locale and pagination', async () => {
    await renderResultsAndSettle();

    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        apiUrl: 'https://api.bukazu.com/graphql',
        locale: 'en',
        portalCode: 'TEST',
        params: expect.objectContaining({ limit: '10', skip: '0' })
      })
    );
  });

  it('should ask for prices when both arrival and departure dates are set', async () => {
    await renderResultsAndSettle({
      ...defaultProps,
      filters: { arrival_date: '2026-01-15', departure_date: '2026-01-22' }
    });

    expect(mockFetch.mock.calls[0][0].params).toMatchObject({
      starts_at: '2026-01-15',
      ends_at: '2026-01-22',
      no_nights_min: '7'
    });
  });

  it('should not ask for prices when no period is selected', async () => {
    await renderResultsAndSettle();

    expect(mockFetch.mock.calls[0][0].params).not.toHaveProperty('starts_at');
  });

  it('should abort the in-flight request when the filters change', async () => {
    await renderResultsAndSettle();

    const firstSignal: AbortSignal = mockFetch.mock.calls[0][0].signal;
    expect(firstSignal.aborted).toBe(false);

    await renderResultsAndSettle({
      ...defaultProps,
      filters: { persons_min: '4' }
    });

    expect(firstSignal.aborted).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should not re-request when the parent re-renders with equal filters', async () => {
    await renderResultsAndSettle();
    await renderResultsAndSettle({ ...defaultProps, filters: {} });

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should render paginator twice (top and bottom)', async () => {
    mockFetch.mockResolvedValue(responseWith([mockHouse]));

    await renderResultsAndSettle();

    const paginators = container.querySelectorAll('[data-testid="paginator"]');
    expect(paginators).toHaveLength(2);
  });

  it('should apply the mode from PortalSite options as a CSS class on #results', async () => {
    const listPortalSite = {
      ...mockPortalSite,
      options: {
        ...mockPortalSite.options,
        filtersForm: {
          ...mockPortalSite.options.filtersForm,
          mode: 'list' as const
        }
      }
    };

    await renderResultsAndSettle({
      ...defaultProps,
      PortalSite: listPortalSite
    });

    const resultsDiv = container.querySelector('#results');
    expect(resultsDiv?.className).toBe('list');
  });
});
