import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import Filters from '../Filters';
import { PortalOptions, PortalSiteType } from '../../../types';

// Mock SVG and child components
jest.mock('../../icons/Close.svg', () => () => (
  <svg data-testid="close-icon" />
));
jest.mock('../Field', () => jest.fn());

import Field from '../Field';

type FieldProps = {
  field: { id: string };
  onFilterChange: (key: string, value: unknown) => void;
};
const FieldMock = Field as unknown as jest.Mock;
let lastFieldHandler: FieldProps['onFilterChange'] | undefined;

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

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
  countries: [{ id: '12', name: 'Spain', country_id: '12' }],
  max_persons: 10,
  name: 'Test Portal',
  max_bedrooms: 5,
  max_bathrooms: 3,
  max_weekprice: 5000
} as any;

const mockOptions: PortalOptions = mockPortalSite.options as any;

const defaultSearchFields = [
  { id: 'countries', type: 'select', label: 'Country' },
  { id: 'cities', type: 'list', label: 'City' },
  { id: 'persons_min', type: 'select', label: 'Persons', max: 6 }
];

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

function renderFilters(
  props: Partial<React.ComponentProps<typeof Filters>> = {}
) {
  act(() => {
    root.render(
      <Filters
        filters={{}}
        onFilterChange={jest.fn()}
        PortalSite={mockPortalSite}
        options={{ ...mockOptions, searchFields: defaultSearchFields } as any}
        {...props}
      />
    );
  });
}

function renderedFieldIds(): string[] {
  return Array.from(container.querySelectorAll('[data-testid="field"]')).map(
    (el) => el.getAttribute('data-field') as string
  );
}

beforeEach(() => {
  (window as any).__localeId__ = 'en';
  lastFieldHandler = undefined;
  FieldMock.mockImplementation((props: FieldProps) => {
    lastFieldHandler = props.onFilterChange;
    return <div data-testid="field" data-field={props.field.id} />;
  });
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
    expect(button?.querySelector('.bu-badge')).toBeNull();
  });

  it('should render the filters container with a header', () => {
    renderFilters();

    expect(container.querySelector('.filters')).not.toBeNull();
    expect(container.querySelector('.filters-title')?.textContent).toBe(
      'Filters'
    );
  });

  it('should render a Field for each searchField', () => {
    renderFilters();

    expect(renderedFieldIds()).toEqual(['countries', 'cities', 'persons_min']);
  });

  it('should point the label at the control only when one exists', () => {
    renderFilters();

    const labels = Array.from(container.querySelectorAll('.bu-field label'));
    expect(labels.map((l) => l.id)).toEqual([
      'countries-label',
      'cities-label',
      'persons_min-label'
    ]);
    // select and select: labelable; list (chips): named via aria-labelledby
    expect(labels.map((l) => l.getAttribute('for'))).toEqual([
      'countries',
      null,
      'persons_min'
    ]);
    expect(FieldMock.mock.calls[1][0].labelId).toBe('cities-label');
  });

  it('should render no fields when searchFields is missing', () => {
    renderFilters({ options: mockOptions });

    expect(renderedFieldIds()).toEqual([]);
  });

  it('should show no active-filters block without filters', () => {
    renderFilters();

    expect(container.querySelector('.bu-active-filters')).toBeNull();
  });

  it('should toggle showOnMobile class when filters button is clicked', () => {
    renderFilters();

    const filtersButton = container.querySelector(
      '.filters-button'
    ) as HTMLElement;
    const filtersDiv = container.querySelector('.filters') as HTMLElement;

    expect(filtersDiv.className).not.toContain('showOnMobile');
    expect(filtersButton.getAttribute('aria-expanded')).toBe('false');

    act(() => {
      filtersButton.click();
    });

    expect(filtersDiv.className).toContain('showOnMobile');
    expect(filtersButton.getAttribute('aria-expanded')).toBe('true');
  });

  it('should close the panel with the close button', () => {
    renderFilters();

    act(() => {
      (container.querySelector('.filters-button') as HTMLElement).click();
    });
    act(() => {
      (container.querySelector('.filters-close') as HTMLElement).click();
    });

    expect(container.querySelector('.filters')?.className).not.toContain(
      'showOnMobile'
    );
  });

  describe('with active filters', () => {
    const filters = { countries: '12', persons_min: '4' };

    it('should show a pill per active filter and hide their fields', () => {
      renderFilters({ filters });

      const pills = Array.from(container.querySelectorAll('.bu-pill')).map(
        (pill) => pill.textContent
      );
      expect(pills).toEqual(['Country: Spain', 'Persons: 4']);
      expect(renderedFieldIds()).toEqual(['cities']);
    });

    it('should show the active count on the mobile filters button', () => {
      renderFilters({ filters });

      expect(
        container.querySelector('.filters-button .bu-badge')?.textContent
      ).toBe('2');
    });

    it('should drop only the clicked filter when its pill is removed', () => {
      const onFilterChange = jest.fn();
      renderFilters({ filters, onFilterChange });

      act(() => {
        (
          container.querySelector(
            '[data-filter-key="countries"]'
          ) as HTMLElement
        ).click();
      });

      expect(onFilterChange).toHaveBeenCalledWith({ persons_min: '4' });
      expect('countries' in onFilterChange.mock.calls[0][0]).toBe(false);
    });

    it('should clear every filter with "Clear all"', () => {
      const onFilterChange = jest.fn();
      renderFilters({ filters, onFilterChange });

      act(() => {
        (container.querySelector('.bu-link-button') as HTMLElement).click();
      });

      expect(onFilterChange).toHaveBeenCalledWith({});
    });
  });

  describe('saving a field value', () => {
    // Field is mocked; call the handler it receives directly.
    it('should add the value to the filters', () => {
      const onFilterChange = jest.fn();
      renderFilters({ filters: { countries: '12' }, onFilterChange });

      act(() => {
        lastFieldHandler?.('persons_min', '4');
      });

      expect(onFilterChange).toHaveBeenCalledWith({
        countries: '12',
        persons_min: '4'
      });
    });

    it('should remove the key when the value is cleared', () => {
      const onFilterChange = jest.fn();
      renderFilters({
        filters: { countries: '12', cities: 'NER' },
        onFilterChange
      });

      act(() => {
        lastFieldHandler?.('cities', null);
      });

      expect(onFilterChange).toHaveBeenCalledWith({ countries: '12' });
    });
  });

  it('should apply filters-hidden class when filtersForm.show is false', () => {
    const hiddenOptions: PortalOptions = {
      ...mockOptions,
      filtersForm: { ...mockOptions.filtersForm, show: false }
    } as any;

    renderFilters({
      options: { ...hiddenOptions, searchFields: defaultSearchFields } as any
    });

    const filtersDiv = container.querySelector('.filters-hidden');
    expect(filtersDiv).not.toBeNull();
  });

  it('should show filters when filtersForm.show is undefined', () => {
    const filtersFormWithoutShow = { ...mockOptions.filtersForm };
    delete filtersFormWithoutShow.show;
    const optionsWithoutShow: PortalOptions = {
      ...mockOptions,
      filtersForm: filtersFormWithoutShow
    };

    renderFilters({
      options: { ...optionsWithoutShow, searchFields: defaultSearchFields }
    });

    const filtersDiv = container.querySelector('.filters');
    const hiddenDiv = container.querySelector('.filters-hidden');
    const fields = container.querySelectorAll('[data-testid="field"]');
    expect(filtersDiv).not.toBeNull();
    expect(hiddenDiv).toBeNull();
    expect(fields.length).toBe(defaultSearchFields.length);
  });

  it('should apply fixed-mobile class when fixedMobile is true', () => {
    const fixedOptions: PortalOptions = {
      ...mockOptions,
      filtersForm: { ...mockOptions.filtersForm, fixed_mobile: true }
    } as any;

    renderFilters({
      options: { ...fixedOptions, searchFields: defaultSearchFields } as any
    });

    const fixedEl = container.querySelector('.fixed-mobile');
    expect(fixedEl).not.toBeNull();
  });
});
