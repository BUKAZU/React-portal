import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import Results from '../Results';
import { AppContext } from '../../AppContext';
import { PortalSiteType } from '../../../types';
import { FiltersType } from '../filters/filter_types';

jest.mock('@apollo/client', () => ({
  useQuery: jest.fn(),
  gql: (q: TemplateStringsArray) => q[0]
}));

jest.mock('../../../_lib/gql', () => ({
  HOUSES_QUERY: 'HOUSES_QUERY',
  HOUSES_PRICE_QUERY: 'HOUSES_PRICE_QUERY'
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

const { useQuery } = require('@apollo/client');

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
    redirect_urls: { nl: null, en: null, de: null, fr: null, es: null, it: null },
    show_discount_code: false,
    show_months_amount: 2,
    show_months_in_a_row_amount: 2
  },
  max_persons: 10,
  name: 'Test Portal',
  max_bedrooms: 5,
  max_bathrooms: 3,
  max_weekprice: 5000
};

const baseFilters: FiltersType = {};

const mockHouse = {
  id: 1,
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
        value={{ locale: 'en', portalCode: 'TEST', objectCode: '', apiUrl: 'https://api.bukazu.com/graphql' }}
      >
        <Results {...props} />
      </AppContext.Provider>
    );
  });
}

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container);
  });
  jest.clearAllMocks();
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  container.remove();
});

describe('Results', () => {
  it('should render loading indicator while query is in flight', () => {
    (useQuery as jest.Mock).mockReturnValue({ loading: true, error: undefined, data: undefined });

    renderResults();

    expect(container.querySelector('[data-testid="loading"]')).not.toBeNull();
  });

  it('should render error component when query fails', () => {
    (useQuery as jest.Mock).mockReturnValue({ loading: false, error: new Error('Network error'), data: undefined });

    renderResults();

    expect(container.querySelector('[data-testid="api-error"]')).not.toBeNull();
  });

  it('should show no-results message when houses array is empty', () => {
    (useQuery as jest.Mock).mockReturnValue({
      loading: false,
      error: undefined,
      data: { PortalSite: { houses: [] } }
    });

    renderResults();

    const noResults = container.querySelector('.bu-noresults');
    expect(noResults).not.toBeNull();
    expect(container.querySelector('[data-testid="single-result"]')).toBeNull();
  });

  it('should render a SingleResult for each house returned', () => {
    (useQuery as jest.Mock).mockReturnValue({
      loading: false,
      error: undefined,
      data: { PortalSite: { houses: [mockHouse, { ...mockHouse, id: 2 }] } }
    });

    renderResults();

    const results = container.querySelectorAll('[data-testid="single-result"]');
    expect(results).toHaveLength(2);
  });

  it('should use HOUSES_QUERY when no dates are provided', () => {
    (useQuery as jest.Mock).mockReturnValue({
      loading: false,
      error: undefined,
      data: { PortalSite: { houses: [] } }
    });

    renderResults({ ...defaultProps, filters: {} });

    expect((useQuery as jest.Mock).mock.calls[0][0]).toBe('HOUSES_QUERY');
  });

  it('should use HOUSES_PRICE_QUERY when both arrival and departure dates are set', () => {
    (useQuery as jest.Mock).mockReturnValue({
      loading: false,
      error: undefined,
      data: { PortalSite: { houses: [] } }
    });

    renderResults({
      ...defaultProps,
      filters: { arrival_date: '01/15/2026', departure_date: '01/22/2026' }
    });

    expect((useQuery as jest.Mock).mock.calls[0][0]).toBe('HOUSES_PRICE_QUERY');
  });

  it('should render paginator twice (top and bottom)', () => {
    (useQuery as jest.Mock).mockReturnValue({
      loading: false,
      error: undefined,
      data: { PortalSite: { houses: [mockHouse] } }
    });

    renderResults();

    const paginators = container.querySelectorAll('[data-testid="paginator"]');
    expect(paginators).toHaveLength(2);
  });

  it('should apply the mode from PortalSite options as a CSS class on #results', () => {
    (useQuery as jest.Mock).mockReturnValue({
      loading: false,
      error: undefined,
      data: { PortalSite: { houses: [] } }
    });

    const listPortalSite = {
      ...mockPortalSite,
      options: {
        ...mockPortalSite.options,
        filtersForm: { ...mockPortalSite.options.filtersForm, mode: 'list' as const }
      }
    };

    renderResults({ ...defaultProps, PortalSite: listPortalSite });

    const resultsDiv = container.querySelector('#results');
    expect(resultsDiv?.className).toBe('list');
  });
});
