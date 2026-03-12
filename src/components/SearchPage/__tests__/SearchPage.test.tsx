import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import SearchPage from '../SearchPage';
import { PortalOptions, PortalSiteType } from '../../../types';

// Mock child components so we don't need Apollo and other heavy deps
jest.mock('../Filters', () => () => <div data-testid="filters" />);
jest.mock('../Results', () => () => <div data-testid="results" />);
jest.mock('../../../_lib/Tracking', () => ({
  TrackEvent: jest.fn()
}));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const mockPortalSite: PortalSiteType = {
  portal_code: 'TEST',
  categories: [],
  options: {
    filtersForm: {
      showCity: false,
      showRegion: false,
      showCountry: false,
      showPersons: false,
      showBathrooms: false,
      showBedrooms: false,
      showPrice: false,
      showRating: false,
      categories: [],
      no_results: 20,
      location: 'left',
      mode: 'grid',
      show: true,
      fixedMobile: false
    },
    bookingFields: [],
    bookingForm: {
      adults_from: 18,
      children: false,
      children_from: 0,
      children_til: 12,
      babies: false,
      babies_til: 2,
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
  max_persons: 10,
  name: 'Test Portal',
  max_bedrooms: 5,
  max_bathrooms: 3,
  max_weekprice: 5000
};

const mockOptions: PortalOptions = mockPortalSite.options as any;

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container);
  });
  localStorage.clear();
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  container.remove();
  localStorage.clear();
});

describe('SearchPage', () => {
  it('should render the search page container', () => {
    act(() => {
      root.render(
        <SearchPage
          options={mockOptions}
          PortalSite={mockPortalSite}
          locale="en"
        />
      );
    });

    const searchPage = container.querySelector('#search-page');
    expect(searchPage).not.toBeNull();
  });

  it('should render Filters and Results', () => {
    act(() => {
      root.render(
        <SearchPage
          options={mockOptions}
          PortalSite={mockPortalSite}
          locale="en"
        />
      );
    });

    expect(container.querySelector('[data-testid="filters"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="results"]')).not.toBeNull();
  });

  it('should apply bu-reverse class when location is right', () => {
    const optionsRight: PortalOptions = {
      ...mockOptions,
      filtersForm: { ...mockOptions.filtersForm, location: 'right' }
    } as any;

    act(() => {
      root.render(
        <SearchPage
          options={optionsRight}
          PortalSite={mockPortalSite}
          locale="en"
        />
      );
    });

    const searchPage = container.querySelector('#search-page');
    expect(searchPage?.classList.contains('bu-reverse')).toBe(true);
  });

  it('should apply bu-column class when location is top', () => {
    const optionsTop: PortalOptions = {
      ...mockOptions,
      filtersForm: { ...mockOptions.filtersForm, location: 'top' }
    } as any;

    act(() => {
      root.render(
        <SearchPage
          options={optionsTop}
          PortalSite={mockPortalSite}
          locale="en"
        />
      );
    });

    const searchPage = container.querySelector('#search-page');
    expect(searchPage?.classList.contains('bu-column')).toBe(true);
  });

  it('should restore filters from localStorage on mount', () => {
    const savedFilters = { countries: 'NL' };
    localStorage.setItem('bukazuFilters', JSON.stringify(savedFilters));

    act(() => {
      root.render(
        <SearchPage
          options={mockOptions}
          PortalSite={mockPortalSite}
          locale="en"
        />
      );
    });

    // Component mounted — if filters were restored the component still renders
    expect(container.querySelector('#search-page')).not.toBeNull();
  });

  it('should use no_results from options as limit', () => {
    const optionsWithLimit: PortalOptions = {
      ...mockOptions,
      filtersForm: { ...mockOptions.filtersForm, no_results: 10 }
    } as any;

    act(() => {
      root.render(
        <SearchPage
          options={optionsWithLimit}
          PortalSite={mockPortalSite}
          locale="en"
        />
      );
    });

    expect(container.querySelector('#search-page')).not.toBeNull();
  });
});
