import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import Field from '../Field';
import { PortalSiteType } from '../../../types';

// Mock filter components so we only test Field routing logic
jest.mock('../filters/List', () => ({ field, options }: any) => (
  <div data-testid="list" data-field={field.id} data-options={options.length} />
));
jest.mock('../filters/Select', () => ({ field, options }: any) => (
  <div data-testid="select" data-field={field.id} data-options={options.length} />
));
jest.mock('../filters/Categories', () => () => <div data-testid="categories" />);
jest.mock('../filters/Radio', () => ({ field }: any) => (
  <div data-testid="radio" data-field={field.id} />
));
jest.mock('../filters/DateFilter', () => ({ field }: any) => (
  <div data-testid="date-filter" data-field={field.id} />
));
jest.mock('../filters/NumberFilter', () => ({ field }: any) => (
  <div data-testid="number-filter" data-field={field.id} />
));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const mockPortalSite: PortalSiteType = {
  portal_code: 'TEST',
  countries: [{ id: 'NL', name: 'Netherlands', country_id: 'NL' }],
  cities: [{ id: 'AMS', name: 'Amsterdam', country_id: 'NL', region: 'NH' }],
  regions: [{ id: 'NH', name: 'Noord-Holland', country_id: 'NL' }],
  max_persons: 10,
  max_bedrooms: 5,
  max_bathrooms: 3,
  max_weekprice: 5000,
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
    bookingForm: {} as any
  },
  name: 'Test Portal'
} as any;

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

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

describe('Field', () => {
  it('should render Select for a select-type field', () => {
    act(() => {
      root.render(
        <Field
          PortalSite={mockPortalSite}
          field={{ id: 'countries', type: 'select' }}
          filters={{}}
          value=""
          onFilterChange={jest.fn()}
        />
      );
    });

    expect(container.querySelector('[data-testid="select"]')).not.toBeNull();
  });

  it('should render List for a list-type field', () => {
    act(() => {
      root.render(
        <Field
          PortalSite={mockPortalSite}
          field={{ id: 'cities', type: 'list' }}
          filters={{}}
          value=""
          onFilterChange={jest.fn()}
        />
      );
    });

    expect(container.querySelector('[data-testid="list"]')).not.toBeNull();
  });

  it('should render Radio for a radio-type field', () => {
    act(() => {
      root.render(
        <Field
          PortalSite={mockPortalSite}
          field={{ id: 'countries', type: 'radio' }}
          filters={{}}
          value=""
          onFilterChange={jest.fn()}
        />
      );
    });

    expect(container.querySelector('[data-testid="radio"]')).not.toBeNull();
  });

  it('should render DateFilter for a date-type field', () => {
    act(() => {
      root.render(
        <Field
          PortalSite={mockPortalSite}
          field={{ id: 'arrival_date', type: 'date' }}
          filters={{}}
          value=""
          onFilterChange={jest.fn()}
        />
      );
    });

    expect(container.querySelector('[data-testid="date-filter"]')).not.toBeNull();
  });

  it('should render NumberFilter for a number-type field', () => {
    act(() => {
      root.render(
        <Field
          PortalSite={mockPortalSite}
          field={{ id: 'persons_min', type: 'number' }}
          filters={{}}
          value=""
          onFilterChange={jest.fn()}
        />
      );
    });

    expect(container.querySelector('[data-testid="number-filter"]')).not.toBeNull();
  });

  it('should render Categories when field id is properties', () => {
    act(() => {
      root.render(
        <Field
          PortalSite={mockPortalSite}
          field={{ id: 'properties', type: 'select' }}
          filters={{}}
          value=""
          onFilterChange={jest.fn()}
        />
      );
    });

    expect(container.querySelector('[data-testid="categories"]')).not.toBeNull();
  });

  it('should render a plain input for unknown type fields', () => {
    act(() => {
      root.render(
        <Field
          PortalSite={mockPortalSite}
          field={{ id: 'extra_search', type: 'text' }}
          filters={{}}
          value="test"
          onFilterChange={jest.fn()}
        />
      );
    });

    const input = container.querySelector('input');
    expect(input).not.toBeNull();
    expect(input?.value).toBe('test');
  });

  it('should pass portal site array options for persons_min field', () => {
    act(() => {
      root.render(
        <Field
          PortalSite={mockPortalSite}
          field={{ id: 'persons_min', type: 'number' }}
          filters={{}}
          value=""
          onFilterChange={jest.fn()}
        />
      );
    });

    expect(container.querySelector('[data-testid="number-filter"]')).not.toBeNull();
  });
});
