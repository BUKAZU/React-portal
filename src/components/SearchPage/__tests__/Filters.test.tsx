import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { IntlProvider } from 'react-intl';
import Filters from '../Filters';
import en from '../../../locales/en.json';
import { PortalOptions, PortalSiteType } from '../../../types';

// Mock SVG and child components
jest.mock('../../icons/Reload.svg', () => () => <svg data-testid="reload-icon" />);
jest.mock('../Field', () => () => <div data-testid="field" />);

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
    bookingFields: []
  },
  bookingFormConfiguration: {
    adultsFromAge: 18,
    childrenAllowed: false,
    childrenFromAge: 3,
    childrenTillAge: 17,
    babiesAllowed: false,
    babiesTillAge: 2,
    languageSelectorVisible: false,
    redirectUrl: null,
    showMonthsAmount: 2,
    showMonthsInARowAmount: 2
  },
  max_persons: 10,
  name: 'Test Portal',
  max_bedrooms: 5,
  max_bathrooms: 3,
  max_weekprice: 5000
} as any;

const mockOptions: PortalOptions = mockPortalSite.options as any;

const defaultSearchFields = [
  { id: 'countries', type: 'select', label: 'Country' },
  { id: 'cities', type: 'list', label: 'City' }
];

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

function renderFilters(props: Partial<React.ComponentProps<typeof Filters>> = {}) {
  act(() => {
    root.render(
      <IntlProvider locale="en" messages={en as any}>
        <Filters
          filters={{}}
          onFilterChange={jest.fn()}
          PortalSite={mockPortalSite}
          options={{ ...mockOptions, searchFields: defaultSearchFields } as any}
          {...props}
        />
      </IntlProvider>
    );
  });
}

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container);
  });
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  container.remove();
});

describe('Filters', () => {
  it('should render a filters button', () => {
    renderFilters();

    const button = container.querySelector('.filters-button');
    expect(button).not.toBeNull();
  });

  it('should render the filters container', () => {
    renderFilters();

    const filtersDiv = container.querySelector('.filters');
    expect(filtersDiv).not.toBeNull();
  });

  it('should render a reload button', () => {
    renderFilters();

    const reload = container.querySelector('.filters-reload');
    expect(reload).not.toBeNull();
  });

  it('should render a Field for each searchField', () => {
    renderFilters();

    const fields = container.querySelectorAll('[data-testid="field"]');
    expect(fields.length).toBe(defaultSearchFields.length);
  });

  it('should toggle showOnMobile class when filters button is clicked', () => {
    renderFilters();

    const filtersButton = container.querySelector('.filters-button') as HTMLElement;
    const filtersDiv = container.querySelector('[class*="filters"]') as HTMLElement;

    // Initially not showing on mobile
    expect(filtersDiv.className).not.toContain('showOnMobile');

    act(() => {
      filtersButton.click();
    });

    // After click, should contain showOnMobile
    const filtersDivAfter = container.querySelector('[class*="showOnMobile"]');
    expect(filtersDivAfter).not.toBeNull();
  });

  it('should call onFilterChange when reload button is clicked', () => {
    const onFilterChange = jest.fn();
    renderFilters({ onFilterChange });

    const reloadButton = container.querySelector('.filters-reload') as HTMLElement;
    act(() => {
      reloadButton.click();
    });

    expect(onFilterChange).toHaveBeenCalledTimes(1);
  });

  it('should apply filters-hidden class when filtersForm.show is false', () => {
    const hiddenOptions: PortalOptions = {
      ...mockOptions,
      filtersForm: { ...mockOptions.filtersForm, show: false }
    } as any;

    renderFilters({ options: { ...hiddenOptions, searchFields: defaultSearchFields } as any });

    const filtersDiv = container.querySelector('.filters-hidden');
    expect(filtersDiv).not.toBeNull();
  });

  it('should apply fixed-mobile class when fixedMobile is true', () => {
    const fixedOptions: PortalOptions = {
      ...mockOptions,
      filtersForm: { ...mockOptions.filtersForm, fixedMobile: true }
    } as any;

    renderFilters({ options: { ...fixedOptions, searchFields: defaultSearchFields } as any });

    const fixedEl = container.querySelector('.fixed-mobile');
    expect(fixedEl).not.toBeNull();
  });
});
