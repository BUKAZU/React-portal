import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import Categories from '../Categories';
import { PortalSiteType } from '../../../../types';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const mockCategories = [
  {
    id: 1,
    name: 'Amenities',
    properties: [
      { id: 10, name: 'Pool' },
      { id: 11, name: 'WiFi' }
    ]
  },
  {
    id: 2,
    name: 'Views',
    properties: [{ id: 20, name: 'Sea View' }]
  }
];

const mockPortalSite: PortalSiteType = {
  portal_code: 'TEST',
  max_persons: 10,
  max_bedrooms: 5,
  max_bathrooms: 3,
  max_weekprice: 5000,
  categories: mockCategories,
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
    bookingForm: {} as any
  },
  name: 'Test Portal'
} as any;

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  act(() => { root = createRoot(container); });
});

afterEach(() => {
  act(() => { root.unmount(); });
  container.remove();
});

describe('Categories (filter)', () => {
  it('renders checkboxes for the category group matching field.id', () => {
    act(() => {
      root.render(
        <Categories
          PortalSite={mockPortalSite}
          field={{ id: '1', type: 'categories', label: 'Amenities' }}
          filters={{}}
          onChange={jest.fn()}
        />
      );
    });

    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBe(2); // Pool + WiFi
  });

  it('renders only the matching group, not other groups', () => {
    act(() => {
      root.render(
        <Categories
          PortalSite={mockPortalSite}
          field={{ id: '2', type: 'categories', label: 'Views' }}
          filters={{}}
          onChange={jest.fn()}
        />
      );
    });

    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBe(1); // Sea View only
  });

  it('renders nothing when field.id does not match any category', () => {
    act(() => {
      root.render(
        <Categories
          PortalSite={mockPortalSite}
          field={{ id: '99', type: 'categories', label: null }}
          filters={{}}
          onChange={jest.fn()}
        />
      );
    });

    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBe(0);
  });

  it('marks a property as checked when it is in filters.properties', () => {
    act(() => {
      root.render(
        <Categories
          PortalSite={mockPortalSite}
          field={{ id: '1', type: 'categories', label: 'Amenities' }}
          filters={{ properties: [10] }}
          onChange={jest.fn()}
        />
      );
    });

    const pool = container.querySelector('input[value="10"]') as HTMLInputElement;
    const wifi = container.querySelector('input[value="11"]') as HTMLInputElement;
    expect(pool?.checked).toBe(true);
    expect(wifi?.checked).toBe(false);
  });

  it('calls onChange with updated properties when a checkbox is toggled', () => {
    const onChange = jest.fn();
    act(() => {
      root.render(
        <Categories
          PortalSite={mockPortalSite}
          field={{ id: '1', type: 'categories', label: 'Amenities' }}
          filters={{ properties: [] }}
          onChange={onChange}
        />
      );
    });

    act(() => {
      (container.querySelector('input[value="10"]') as HTMLInputElement).click();
    });

    expect(onChange).toHaveBeenCalledWith('properties', [10]);
  });

  it('removes a property from selection when already checked', () => {
    const onChange = jest.fn();
    act(() => {
      root.render(
        <Categories
          PortalSite={mockPortalSite}
          field={{ id: '1', type: 'categories', label: 'Amenities' }}
          filters={{ properties: [10, 11] }}
          onChange={onChange}
        />
      );
    });

    act(() => {
      (container.querySelector('input[value="10"]') as HTMLInputElement).click();
    });

    expect(onChange).toHaveBeenCalledWith('properties', [11]);
  });
});
